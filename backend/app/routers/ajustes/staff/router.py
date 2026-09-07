"""Gestión personal aislada: operadores, perfiles y permisos ampliables."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import PERMISSION_CATALOG, ROLE_DEFAULTS
from app.core.security import get_current_user, hash_password, require_role
from app.models.user import User

router = APIRouter(prefix="/staff", tags=["Ajustes / Gestión personal"], dependencies=[Depends(require_role("admin"))])

class StaffIn(BaseModel):
    name: str
    email: str
    phone: str = ""
    role: str = "tecnico"
    password: str = ""
    is_active: bool = True
    permissions: dict = Field(default_factory=dict)
    access_schedule: dict = Field(default_factory=dict)

def public(user: User):
    return user.to_dict(exclude=("password_hash",))

def validate_role(data: StaffIn):
    if data.role not in ROLE_DEFAULTS:
        raise HTTPException(422, "Rol no válido")

@router.get("/catalog")
async def catalog():
    return {"modules": PERMISSION_CATALOG, "defaults": ROLE_DEFAULTS}

@router.get("")
async def list_staff(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(User).order_by(User.created_at))).scalars()
    return [public(user) for user in rows]

@router.post("")
async def create(data: StaffIn, db: AsyncSession = Depends(get_db)):
    validate_role(data)
    email = data.email.strip().lower()
    if await db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(400, "El correo ya existe")
    if len(data.password) < 8:
        raise HTTPException(422, "La contraseña debe tener al menos 8 caracteres")
    user = User(
        name=data.name.strip(), email=email, phone=data.phone.strip(), role=data.role,
        password_hash=hash_password(data.password), is_active=data.is_active,
        permissions=data.permissions or ROLE_DEFAULTS[data.role],
        access_schedule=data.access_schedule,
    )
    db.add(user)
    await db.commit()
    return public(user)

@router.put("/{user_id}")
async def update(user_id: str, data: StaffIn, current: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    validate_role(data)
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Operador no encontrado")
    email = data.email.strip().lower()
    duplicate = await db.scalar(select(User.id).where(User.email == email, User.id != user_id))
    if duplicate:
        raise HTTPException(400, "El correo ya pertenece a otro operador")
    if user.id == current["id"] and not data.is_active:
        raise HTTPException(400, "No puede desactivar su propia cuenta")
    user.name, user.email, user.phone = data.name.strip(), email, data.phone.strip()
    user.role, user.is_active = data.role, data.is_active
    user.permissions = data.permissions or ROLE_DEFAULTS[data.role]
    user.access_schedule = data.access_schedule
    if data.password:
        if len(data.password) < 8:
            raise HTTPException(422, "La contraseña debe tener al menos 8 caracteres")
        user.password_hash = hash_password(data.password)
    await db.commit()
    return public(user)
