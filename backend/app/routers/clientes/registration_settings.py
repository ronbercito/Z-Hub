"""Preferencias seguras de Registro y altas para el asistente de abonados."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(
    prefix="/client-registration-settings",
    tags=["Clientes / Registro"],
    dependencies=[Depends(get_current_user)],
)


@router.get("")
async def get_client_registration_settings(db: AsyncSession = Depends(get_db)):
    row = await db.get(Setting, "system_config")
    data = {**DEFAULT_SETTINGS, **((row.data or {}) if row else {})}
    try:
        billing_day = int(data.get("client_registration_default_billing_day", 5))
    except (TypeError, ValueError):
        billing_day = 5
    return {
        "billing_day": max(1, min(30, billing_day)),
        "technology": "wireless" if data.get("client_registration_default_technology") == "wireless" else "fiber",
        "installation_date_required": data.get("client_registration_installation_date_required", True) is not False,
        "create_first_invoice_default": data.get("client_registration_create_first_invoice_default", True) is not False,
    }
