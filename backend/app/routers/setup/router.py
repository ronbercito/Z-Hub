"""Asistente de configuración inicial de Z-Hub: licencia y administrador."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.license_manager import apply_license_metadata, get_setting_data, resolve_license_record
from app.core.security import hash_password
from app.models.user import User
from .schemas import AdminSetupRequest, LicenseRequest, SetupCompleteRequest

router = APIRouter(prefix="/setup", tags=["Configuración inicial"])


@router.get("/status")
async def setup_status(db: AsyncSession = Depends(get_db)):
    _, data = await get_setting_data(db)
    record, validation = await resolve_license_record(db, data.get("license_key"))
    return {
        "setup_required": not bool(data.get("initial_setup_completed", False)),
        "license_valid": bool(record),
        "validation_source": validation.get("source"),
    }


@router.post("/license")
async def validate_license(req: LicenseRequest, db: AsyncSession = Depends(get_db)):
    setting, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")

    key = req.license_key.strip().upper()
    license_data, validation = await resolve_license_record(db, key)
    if not license_data:
        raise HTTPException(status_code=400, detail=validation.get("message") or "La licencia no es válida")

    setting.data = apply_license_metadata(data, license_data)
    await db.commit()
    return {
        "valid": True,
        "message": "Licencia válida",
        "owner": license_data["name"],
        "email": license_data["email"],
        "type": license_data["type"],
        "plan": license_data["plan"],
        "max_clients": license_data["max_clients"],
        "validation_source": validation.get("source"),
    }


@router.post("/admin")
async def create_initial_admin(req: AdminSetupRequest, db: AsyncSession = Depends(get_db)):
    _, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")
    record, _ = await resolve_license_record(db, data.get("license_key"))
    if not record:
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
    setting, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        return {"completed": True}

    key = req.license_key.strip().upper()
    record, _ = await resolve_license_record(db, key)
    if key != data.get("license_key") or not record:
        raise HTTPException(status_code=400, detail="La licencia no está validada")

    admin = (await db.execute(select(User).where(User.role == "admin"))).scalars().first()
    if not admin:
        raise HTTPException(status_code=400, detail="Debe crear la cuenta de administrador")

    data["initial_setup_completed"] = True
    setting.data = data
    await db.commit()
    return {"completed": True}
