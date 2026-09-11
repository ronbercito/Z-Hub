"""API autenticada de licencia Z-Hub.

Etapa 5/7: expone estado seguro para el panel y permite al administrador
convertir Trial/instalación en una licencia pagada usando el registro local.
La validación remota se sustituirá en la Etapa 6.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import ZHUB_LICENSE_PAYMENT_URL, ZHUB_LICENSE_WHATSAPP
from app.core.database import get_db
from app.core.license_manager import apply_license_metadata, get_license, get_license_record, get_setting_data
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
    key = info.pop("key", "")
    return {
        **info,
        "license_key_masked": _mask_license_key(key),
        "sales_whatsapp": ZHUB_LICENSE_WHATSAPP,
        "payment_url": ZHUB_LICENSE_PAYMENT_URL,
    }


@router.get("/info")
async def license_info(db: AsyncSession = Depends(get_db)):
    """Estado seguro de licencia y opciones comerciales para cualquier usuario autenticado."""
    return await _public_info(db)


@router.post("/activate", dependencies=[Depends(require_role("admin"))])
async def activate_paid_license(payload: LicenseActivationIn, db: AsyncSession = Depends(get_db)):
    """Activa/cambia a una licencia pagada sin borrar datos de la instalación."""
    key = payload.license_key.strip().upper()
    record = get_license_record(key)
    if not record:
        raise HTTPException(status_code=400, detail="La licencia ingresada no es válida o no está activa.")
    if record.get("type") != "PAID":
        raise HTTPException(status_code=422, detail="Desde esta pantalla solo puede activarse una licencia pagada.")

    setting, data = await get_setting_data(db)
    setting.data = apply_license_metadata(data, record)
    await db.commit()
    return {
        "ok": True,
        "message": "Licencia pagada activada correctamente.",
        "license": await _public_info(db),
    }
