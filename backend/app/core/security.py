"""
Archivo: backend/app/core/security.py
Función: Seguridad y autenticación: hash de contraseñas con bcrypt, emisión y
         validación de tokens JWT, y la dependencia get_current_user que protege
         todas las rutas privadas (acepta Bearer válido y, en su ausencia, cookie httpOnly).
Trabaja con: backend/app/core/config.py, backend/app/models/user.py,
             backend/app/routers/auth/router.py y todas las rutas protegidas.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM, JWT_SECRET
from app.core.database import get_db
from app.models.user import User


def is_admin_role(role: str | None) -> bool:
    """Acepta el identificador interno y variantes históricas de administrador."""
    return str(role or "").strip().lower() in {"admin", "administrador", "administrator"}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    auth_header = request.headers.get("Authorization", "")
    bearer = auth_header[7:].strip() if auth_header.startswith("Bearer ") else ""
    # Algunos componentes antiguos pueden enviar "Authorization: Bearer " tras una recarga.
    # Un Bearer vacío nunca debe bloquear el fallback a la cookie httpOnly.
    token = bearer or request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token no válido")
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tipo de token inválido")
    user = await db.get(User, payload["sub"])
    if not user and payload.get("email"):
        user = (await db.execute(select(User).where(User.email == payload["email"]))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida, vuelva a iniciar sesión")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada")
    return user.to_dict(exclude=("password_hash",))


def require_role(*roles: str):
    async def checker(user: dict = Depends(get_current_user)) -> dict:
        if not (is_admin_role(user.get("role")) or user["role"] in roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos para esta acción")
        return user

    return checker
