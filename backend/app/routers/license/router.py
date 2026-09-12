"""API autenticada de licencia Z-Hub.

Etapa 7/7: expone estado comercial seguro, incluido el vencimiento de licencias
PAID obtenido del License Server, sin mostrar la clave completa al cliente.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import ZHUB_LICENSE_PAYMENT_URL, ZHUB_LICENSE_WHATSAPP
from app.core.database import get_db
from app.core.license_manager import apply_license_metadata, get_license, get_setting_data, resolve_license_record
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/license", tags=["Licencia"], dependencies=[Depends(get_current_user)])


class LicenseActivationIn(BaseModel):
    license_key: str = Field(min_length=4, max_length=160)


def _mask_license_key(value: str) -> str:
    key = str(value or "").strip()
    if not key:
        return ""
    if len(key) <= 8:
        return "•" * max(4, len(key) - 2) + key[-2:]
    return f"{key[:4]}-••••-••••-{key[-4:]}"


async def _public_info(db: AsyncSession) -> dict:
    info = await get_license(db)
    key = str(info.pop("key", "") or "").strip().upper()

    # get_license() mantiene enforcement/caché. Para la vista comercial PAID
    # recuperamos además el vencimiento firmado por Web-Licence para que el
    # cliente vea la fecha real configurada por administración.
    license_expires_at = None
    if key and str(info.get("type") or "").upper() == "PAID":
        record, _ = await resolve_license_record(db, key)
        if record:
            license_expires_at = record.get("expires_at")

    return {
        **info,
        "license_expires_at": license_expires_at,
        "license_key_masked": _mask_license_key(key),
        "sales_whatsapp": ZHUB_LICENSE_WHATSAPP,
        "payment_url": ZHUB_LICENSE_PAYMENT_URL,
    }


@router.get("/info")
async def license_info(db: AsyncSession = Depends(get_db)):
    return await _public_info(db)


@router.post("/activate", dependencies=[Depends(require_role("admin"))])
async def activate_license(payload: LicenseActivationIn, db: AsyncSession = Depends(get_db)):
    key = payload.license_key.strip().upper()
    record, validation = await resolve_license_record(db, key)
    if not record:
        detail = validation.get("message") or "La licencia ingresada no es válida o no está activa."
        raise HTTPException(status_code=400, detail=detail)

    license_type = str(record.get("type") or "").upper()
    if license_type not in {"PAID", "TRIAL"}:
        raise HTTPException(status_code=422, detail="Tipo de licencia no permitido para esta instalación.")

    setting, data = await get_setting_data(db)
    setting.data = apply_license_metadata(data, record)
    await db.commit()
    label = "Trial" if license_type == "TRIAL" else "Licencia pagada"
    return {
        "ok": True,
        "message": f"{label} activada correctamente.",
        "validation_source": validation.get("source"),
        "license": await _public_info(db),
    }
