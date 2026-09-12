"""Asistente de configuración inicial de Z-Hub: registro, Auto-TRIAL y administrador."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auto_trial import (
    AutoTrialRejected,
    AutoTrialUnavailable,
    CustomerRegistrationRejected,
    CustomerRegistrationUnavailable,
    activate_auto_trial,
    register_customer,
)
from app.core.database import get_db
from app.core.license_manager import (
    _ensure_installation_id,
    apply_license_metadata,
    get_setting_data,
    resolve_license_record,
)
from app.core.security import hash_password
from app.models.user import User
from .schemas import AdminSetupRequest, AutoTrialSetupRequest, CustomerRegistrationRequest, LicenseRequest, SetupCompleteRequest

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


@router.post("/register")
async def setup_register_customer(req: CustomerRegistrationRequest, db: AsyncSession = Depends(get_db)):
    """Registra la empresa en Web-Licence desde el Wizard sin exponer el servidor central."""
    _, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")
    try:
        result = await register_customer(req.company_name, req.contact_name, str(req.email), req.phone, req.country)
    except CustomerRegistrationRejected as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except CustomerRegistrationUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {
        "ok": True,
        "email": str(req.email).strip().lower(),
        "company_name": req.company_name.strip(),
        "message": result.get("message") or "Registro preparado. Continúa con la activación del TRIAL.",
        "existing": not bool(result.get("customer_created", True)),
    }


@router.post("/auto-trial")
async def setup_auto_trial(req: AutoTrialSetupRequest, db: AsyncSession = Depends(get_db)):
    """Activa o recupera el TRIAL reservado sin exponer su clave al navegador."""
    setting, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")

    installation_id = await _ensure_installation_id(db, setting, data)
    try:
        activation = await activate_auto_trial(str(req.email), installation_id, req.installation_name)
    except AutoTrialRejected as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except AutoTrialUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    key = str(activation.get("license_key") or "").strip().upper()
    license_data, validation = await resolve_license_record(db, key)
    if not license_data:
        raise HTTPException(status_code=503, detail=validation.get("message") or "El TRIAL fue asignado pero no pudo validarse")

    updated = apply_license_metadata(data, license_data)
    updated["license_installation_id"] = installation_id
    setting.data = updated
    await db.commit()
    return {
        "valid": True,
        "message": "TRIAL activado" if not activation.get("recovered") else "TRIAL recuperado",
        "owner": license_data.get("name", ""),
        "email": license_data.get("email", str(req.email)),
        "type": license_data.get("type", "TRIAL"),
        "plan": license_data.get("plan", "TRIAL"),
        "max_clients": license_data.get("max_clients"),
        "expires_at": license_data.get("expires_at") or activation.get("expires_at"),
        "recovered": bool(activation.get("recovered")),
        "validation_source": validation.get("source"),
    }


@router.post("/license")
async def validate_license(req: LicenseRequest, db: AsyncSession = Depends(get_db)):
    """Ruta de compatibilidad para recuperación manual; ya no es el flujo normal del Wizard."""
    setting, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")
    key = req.license_key.strip().upper()
    license_data, validation = await resolve_license_record(db, key)
    if not license_data:
        raise HTTPException(status_code=400, detail=validation.get("message") or "La licencia no es válida")
    setting.data = apply_license_metadata(data, license_data)
    await db.commit()
    return {"valid": True, "message": "Licencia válida", "owner": license_data["name"], "email": license_data["email"], "type": license_data["type"], "plan": license_data["plan"], "max_clients": license_data["max_clients"], "validation_source": validation.get("source")}


@router.post("/admin")
async def create_initial_admin(req: AdminSetupRequest, db: AsyncSession = Depends(get_db)):
    _, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        raise HTTPException(status_code=409, detail="La configuración inicial ya fue completada")
    record, _ = await resolve_license_record(db, data.get("license_key"))
    if not record:
        raise HTTPException(status_code=400, detail="Primero debe activar o recuperar el TRIAL")
    if req.password != req.password_confirmation:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")
    email = str(req.email).strip().lower()
    existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    db.add(User(email=email, password_hash=hash_password(req.password), name=req.name.strip(), role="admin"))
    await db.commit()
    return {"created": True, "message": "Cuenta de administrador creada"}


@router.post("/complete")
async def complete_setup(req: SetupCompleteRequest, db: AsyncSession = Depends(get_db)):
    setting, data = await get_setting_data(db)
    if data.get("initial_setup_completed"):
        return {"completed": True}
    record, _ = await resolve_license_record(db, data.get("license_key"))
    if not record:
        raise HTTPException(status_code=400, detail="La licencia automática no está validada")
    admin = (await db.execute(select(User).where(User.role == "admin"))).scalars().first()
    if not admin:
        raise HTTPException(status_code=400, detail="Debe crear la cuenta de administrador")
    data["initial_setup_completed"] = True
    setting.data = data
    await db.commit()
    return {"completed": True}
