"""Asistente de configuración inicial de Z-Hub: licencia y administrador."""
import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password
from app.models.setting import DEFAULT_SETTINGS, Setting
from app.models.user import User
from .schemas import AdminSetupRequest, LicenseRequest, SetupCompleteRequest

router = APIRouter(prefix="/setup", tags=["Configuración inicial"])
LICENSE_FILE = Path(__file__).resolve().parents[4] / "licencia" / "licenses.json"


def _licenses() -> set[str]:
    try:
        data = json.loads(LICENSE_FILE.read_text(encoding="utf-8"))
        return {str(value).strip().upper() for value in data.get("licenses", []) if str(value).strip()}
    except (OSError, ValueError, TypeError):
        return set()


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
    if key not in _licenses():
        raise HTTPException(status_code=400, detail="La licencia no es válida")

    data["license_key"] = key
    setting.data = data
    await db.commit()
    return {"valid": True, "message": "Licencia válida"}


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
