"""Plantillas de mensajes consumidas por Mensajería; la edición vive en Ajustes."""
from __future__ import annotations

import re

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.setting import Setting
from app.services.whatsapp_automatizadovip_templates import get_templates

router = APIRouter(prefix="/messaging", tags=["Mensajería"], dependencies=[Depends(get_current_user)])


def _replace_variable(text: str, key: str, value: str) -> str:
    safe = str(value or "")
    result = re.sub(rf"\{{\{{\s*{re.escape(key)}\s*\}}\}}", safe, str(text or ""))
    return re.sub(rf"(?<!\{{)\{{\s*{re.escape(key)}\s*\}}(?!\}})", safe, result)


def _render_global_values(text: str, cfg: dict) -> str:
    values = {
        "empresa": cfg.get("company_name") or "su proveedor de internet",
        "yape": cfg.get("yape_number") or "",
        "telefono": cfg.get("phone") or cfg.get("yape_number") or "",
        "titular_pago": cfg.get("yape_holder") or cfg.get("yape_name") or "",
    }
    result = str(text or "")
    for key, value in values.items():
        result = _replace_variable(result, key, value)
    return result


@router.get("/templates")
async def templates(db: AsyncSession = Depends(get_db)):
    setting = await db.get(Setting, "system_config")
    cfg = (setting.data if setting else {}) or {}
    values = get_templates(cfg)
    return [
        {"id": "tpl_reminder", "name": values["payment_reminder"]["name"], "type": "payment_reminder", "text": _render_global_values(values["payment_reminder"]["text"], cfg)},
        {"id": "tpl_cut_warning", "name": values["cut_warning"]["name"], "type": "cut_warning", "text": _render_global_values(values["cut_warning"]["text"], cfg)},
        {"id": "tpl_payment_confirmation", "name": values["payment_confirmation"]["name"], "type": "payment_receipt", "text": _render_global_values(values["payment_confirmation"]["text"], cfg)},
        {"id": "tpl_maintenance", "name": values["maintenance"]["name"], "type": "general", "text": _render_global_values(values["maintenance"]["text"], cfg)},
    ]
