"""CRUD de plantillas de mensajes dentro de Ajustes → Plantillas configuración."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.setting import Setting
from app.services.whatsapp_automatizadovip_templates import DEFAULT_TEMPLATES, get_templates

router = APIRouter(prefix="/settings/message-templates", tags=["Plantillas de mensajes"], dependencies=[Depends(get_current_user)])

class TemplateUpdate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)

@router.get("/whatsapp")
async def get_whatsapp_templates(db: AsyncSession = Depends(get_db)):
    setting = await db.get(Setting, "system_config")
    root = (setting.data if setting else {}) or {}
    return {"templates": get_templates(root), "max_length": 1000}

@router.put("/whatsapp/{template_key}")
async def update_whatsapp_template(template_key: str, payload: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    if template_key not in DEFAULT_TEMPLATES:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    setting = await db.get(Setting, "system_config")
    if not setting:
        raise HTTPException(status_code=404, detail="Configuración del sistema no encontrada")
    root: dict[str, Any] = dict(setting.data or {})
    templates = dict(root.get("message_templates") or {})
    templates[template_key] = {"text": payload.text.strip()}
    root["message_templates"] = templates
    setting.data = root
    await db.commit()
    await db.refresh(setting)
    return {"key": template_key, "template": get_templates(root)[template_key]}

@router.post("/whatsapp/reset/{template_key}")
async def reset_whatsapp_template(template_key: str, db: AsyncSession = Depends(get_db)):
    if template_key not in DEFAULT_TEMPLATES:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    setting = await db.get(Setting, "system_config")
    if not setting:
        raise HTTPException(status_code=404, detail="Configuración del sistema no encontrada")
    root: dict[str, Any] = dict(setting.data or {})
    templates = dict(root.get("message_templates") or {})
    templates.pop(template_key, None)
    root["message_templates"] = templates
    setting.data = root
    await db.commit()
    return {"key": template_key, "template": get_templates(root)[template_key]}
