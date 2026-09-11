"""Plantillas de mensajes consumidas por Mensajería; la edición vive en Ajustes."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.setting import Setting
from app.services.whatsapp_automatizadovip_templates import get_templates
router=APIRouter(prefix="/messaging",tags=["Mensajería"],dependencies=[Depends(get_current_user)])
@router.get("/templates")
async def templates(db:AsyncSession=Depends(get_db)):
    setting=await db.get(Setting,"system_config"); cfg=(setting.data if setting else {}) or {}; values=get_templates(cfg)
    return [
      {"id":"tpl_reminder","name":values["payment_reminder"]["name"],"type":"payment_reminder","text":values["payment_reminder"]["text"].replace("{empresa}",cfg.get("company_name") or "su proveedor de internet").replace("{yape}",cfg.get("yape_number") or "")},
      {"id":"tpl_cut_warning","name":values["cut_warning"]["name"],"type":"cut_warning","text":values["cut_warning"]["text"].replace("{empresa}",cfg.get("company_name") or "su proveedor de internet").replace("{telefono}",cfg.get("phone") or cfg.get("yape_number") or "")},
      {"id":"tpl_payment_confirmation","name":values["payment_confirmation"]["name"],"type":"payment_receipt","text":values["payment_confirmation"]["text"].replace("{empresa}",cfg.get("company_name") or "su proveedor de internet")},
      {"id":"tpl_maintenance","name":values["maintenance"]["name"],"type":"general","text":values["maintenance"]["text"].replace("{empresa}",cfg.get("company_name") or "su proveedor de internet")},
    ]
