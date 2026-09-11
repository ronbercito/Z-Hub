"""API protegida para integración WhatsApp AutomatizadoVIP.

No sustituye el módulo existente de Mensajería. Permite configurar el gateway,
probar conexión mediante un envío real opcional y enviar mensajes manuales o
lotes desde Z-Hub.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.setting import Setting
from app.models.whatsapp_automatizadovip_log import WhatsAppAutomatizadoVIPLog
from app.services.whatsapp_automatizadovip import (
    DEFAULT_GATEWAY_URL,
    MAX_MESSAGE_LENGTH,
    WhatsAppGatewayError,
    normalize_phone,
    send_messages,
)

router = APIRouter(
    prefix="/whatsapp/automatizadovip",
    tags=["WhatsApp AutomatizadoVIP"],
    dependencies=[Depends(get_current_user)],
)

SETTINGS_KEY = "whatsapp_automatizadovip"
DEFAULT_CONFIG = {
    "enabled": False,
    "gateway_url": DEFAULT_GATEWAY_URL,
    "country_code": "51",
    "verify": True,
    "api_key": "",
    "max_message_length": MAX_MESSAGE_LENGTH,
}


class ConfigUpdate(BaseModel):
    enabled: bool = False
    gateway_url: str = DEFAULT_GATEWAY_URL
    country_code: str = "51"
    verify: bool = True
    api_key: str = ""


class MessageItem(BaseModel):
    number: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_LENGTH)
    client_id: str | None = None


class SendRequest(BaseModel):
    contacts: list[MessageItem] = Field(min_length=1, max_length=100)


def _read_config(s: Setting | None) -> dict[str, Any]:
    cfg = ((s.data if s else {}) or {}).get(SETTINGS_KEY) or {}
    return {**DEFAULT_CONFIG, **cfg}


def _public_config(cfg: dict[str, Any]) -> dict[str, Any]:
    # La API Key nunca se devuelve al navegador.
    return {
        "enabled": bool(cfg.get("enabled")),
        "gateway_url": cfg.get("gateway_url") or DEFAULT_GATEWAY_URL,
        "country_code": cfg.get("country_code") or "51",
        "verify": bool(cfg.get("verify", True)),
        "configured": bool(str(cfg.get("api_key") or "").strip()),
        "max_message_length": MAX_MESSAGE_LENGTH,
    }


@router.get("/config")
async def get_config(db: AsyncSession = Depends(get_db)):
    s = await db.get(Setting, "system_config")
    return _public_config(_read_config(s))


@router.put("/config")
async def update_config(data: ConfigUpdate, db: AsyncSession = Depends(get_db)):
    s = await db.get(Setting, "system_config")
    if not s:
        raise HTTPException(status_code=500, detail="No existe la configuración del sistema")

    current = _read_config(s)
    incoming = data.model_dump()
    # Un formulario puede conservar la API Key oculta; una cadena vacía no la borra.
    if not incoming["api_key"].strip():
        incoming["api_key"] = current.get("api_key", "")
    current.update(incoming)
    current["gateway_url"] = current["gateway_url"].strip() or DEFAULT_GATEWAY_URL
    current["country_code"] = "".join(ch for ch in current["country_code"] if ch.isdigit()) or "51"

    s.data = {**(s.data or {}), SETTINGS_KEY: current}
    await db.commit()
    return _public_config(current)


async def _log_batch(db: AsyncSession, contacts: list[MessageItem], status: str, http_status: int | None = None, response_data: Any = None, error_message: str | None = None):
    for item in contacts:
        db.add(
            WhatsAppAutomatizadoVIPLog(
                client_id=item.client_id,
                phone=item.number,
                message=item.message,
                status=status,
                http_status=http_status,
                response_data=response_data,
                error_message=error_message,
            )
        )
    await db.commit()


@router.post("/send")
async def send(data: SendRequest, db: AsyncSession = Depends(get_db)):
    s = await db.get(Setting, "system_config")
    cfg = _read_config(s)
    if not cfg.get("enabled"):
        raise HTTPException(status_code=409, detail="La pasarela AutomatizadoVIP está desactivada")
    if not str(cfg.get("api_key") or "").strip():
        raise HTTPException(status_code=409, detail="Configure la API Key de AutomatizadoVIP")

    contacts = [item.model_dump(exclude_none=True) for item in data.contacts]
    gateway_contacts = [{"number": item["number"], "message": item["message"]} for item in contacts]
    try:
        result = await send_messages(
            api_key=cfg["api_key"],
            contacts=gateway_contacts,
            gateway_url=cfg["gateway_url"],
            country_code=cfg["country_code"],
            verify=cfg["verify"],
        )
    except (ValueError, WhatsAppGatewayError) as exc:
        await _log_batch(db, data.contacts, "failed", error_message=str(exc))
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    await _log_batch(db, data.contacts, "sent", http_status=result.status_code, response_data=result.response)
    return {
        "ok": result.ok,
        "status_code": result.status_code,
        "sent": len(data.contacts),
        "gateway_response": result.response,
    }


@router.post("/test")
async def test_gateway(data: MessageItem, db: AsyncSession = Depends(get_db)):
    """Prueba el gateway con el número y mensaje indicados por el administrador."""
    s = await db.get(Setting, "system_config")
    cfg = _read_config(s)
    if not str(cfg.get("api_key") or "").strip():
        raise HTTPException(status_code=409, detail="Configure la API Key de AutomatizadoVIP")

    try:
        result = await send_messages(
            api_key=cfg["api_key"],
            contacts=[{"number": data.number, "message": data.message}],
            gateway_url=cfg["gateway_url"],
            country_code=cfg["country_code"],
            verify=cfg["verify"],
        )
    except (ValueError, WhatsAppGatewayError) as exc:
        await _log_batch(db, [data], "failed", error_message=str(exc))
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    await _log_batch(db, [data], "sent", http_status=result.status_code, response_data=result.response)
    return {"ok": result.ok, "status_code": result.status_code, "gateway_response": result.response}
