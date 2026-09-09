"""Asistente de configuración inicial de Z-Hub: licencia y administrador."""
import os
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password
from app.models.setting import DEFAULT_SETTINGS, Setting
from app.models.user import User
from .schemas import AdminSetupRequest, LicenseRequest, SetupCompleteRequest

router = APIRouter(prefix="/setup", tags=["Configuración inicial"])
# El registro de licencias es exclusivamente backend. En producción se prioriza
# la copia privada del servidor/contenedor; el archivo del repositorio solo sirve
# como plantilla temporal para preparar una instalación nueva.
REPO_LICENSE_FILE = Path(__file__).resolve().parents[4] / "licencia" / "licencias.txt"
PRIVATE_LICENSE_FILE = Path(os.environ.get("ZHUB_LICENSE_FILE", "/etc/zhub/licencia/licencias.txt"))


def _license_file() -> Path:
    if PRIVATE_LICENSE_FILE.is_file():
        return PRIVATE_LICENSE_FILE
    return REPO_LICENSE_FILE


def _licenses() -> dict[str, dict[str, str]]:
    """Lee bloques LICENCIA/NOMBRE/CORREO/ESTADO sin exponer el registro completo."""
    try:
        text = _license_file().read_text(encoding="utf-8")
    except OSError:
        return {}

    licenses: dict[str, dict[str, str]] = {}
    current: dict[str, str] = {}
    fields = {
        "LICENCIA": "key",
        "NOMBRE": "name",
        "CORREO": "email",
        "ESTADO": "status",
    }

    def flush() -> None:
        key = current.get("key", "").strip().upper()
        status = current.get("status", "ACTIVA").strip().upper()
        if key and status == "ACTIVA":
            licenses[key] = {
                "name": current.get("name", "").strip(),
                "email": current.get("email", "").strip().lower(),
            }

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.match(r"^(LICENCIA|NOMBRE|CORREO|ESTADO)\s*:\s*(.*?)\s*$", line, re.IGNORECASE)
        if not match:
            continue
        field, value = match.groups()
        field = field.upper()
        if field == "LICENCIA" and current.get("key"):
            flush()
            current = {}
        current[fields[field]] = value
    flush()
    return licenses


def _setting_data(setting: Setting | None) -> dict:
    data = dict(DEFAULT_SETTINGS)
    if setting and setting.data:
        data.update(setting.data)
    return data


async def _get_setup(db: AsyncSession) -> tuple[Setting, dict]:
    setting = await db.get(Setting, "system_config")
    if not setting:
        setting = Setting(id="system_config", data=dict(DEFAULT_SETTINGS))
        db.add(setting)
        await db.flush()
    data = _setting_data(setting)
    return setting, data


@router.get("/status")
async def setup_status(db: AsyncSession = Depends(get_db)):
    setting, data = await _get_setup(db)
    await db.commit()
    return {
        "setup_required": not bool(data.get("initial_setup_completed", False)),
        "license_valid": bool(data.get("license_key")),
    }


@router.post("/license")
async def validate_license(req: LicenseRequest, db: AsyncSession = Depends(get_db)):
    setting, data = await _get_setup(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")

    key = req.license_key.strip().upper()
    license_data = _licenses().get(key)
    if not license_data:
        raise HTTPException(status_code=400, detail="La licencia no es válida")

    data["license_key"] = key
    setting.data = data
    await db.commit()
    return {
        "valid": True,
        "message": "Licencia válida",
        "owner": license_data["name"],
        "email": license_data["email"],
    }


@router.post("/admin")
async def create_initial_admin(req: AdminSetupRequest, db: AsyncSession = Depends(get_db)):
    setting, data = await _get_setup(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")
    if not data.get("license_key") or data.get("license_key") not in _licenses():
        raise HTTPException(status_code=400, detail="Primero debe validar una licencia válida")
    if req.password != req.password_confirmation:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")

    email = str(req.email).strip().lower()
    existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user = User(
        email=email,
        password_hash=hash_password(req.password),
        name=req.name.strip(),
        role="admin",
    )
    db.add(user)
    await db.commit()
    return {"created": True, "message": "Cuenta de administrador creada"}


@router.post("/complete")
async def complete_setup(req: SetupCompleteRequest, db: AsyncSession = Depends(get_db)):
    setting, data = await _get_setup(db)
    if data.get("initial_setup_completed"):
        return {"completed": True}

    key = req.license_key.strip().upper()
    if key != data.get("license_key") or key not in _licenses():
        raise HTTPException(status_code=400, detail="La licencia no está validada")

    admin = (await db.execute(select(User).where(User.role == "admin"))).scalars().first()
    if not admin:
        raise HTTPException(status_code=400, detail="Debe crear la cuenta de administrador")

    data["initial_setup_completed"] = True
    setting.data = data
    await db.commit()
    return {"completed": True}
