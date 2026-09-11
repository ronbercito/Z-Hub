"""Endpoints de historial para WhatsApp AutomatizadoVIP."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.whatsapp_automatizadovip_log import WhatsAppAutomatizadoVIPLog

router = APIRouter(
    prefix="/whatsapp/automatizadovip/logs",
    tags=["WhatsApp AutomatizadoVIP"],
    dependencies=[Depends(get_current_user)],
)


@router.get("")
async def list_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    limit = max(1, min(int(limit), 200))
    result = await db.execute(
        select(WhatsAppAutomatizadoVIPLog)
        .order_by(WhatsAppAutomatizadoVIPLog.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()
    return [
        {
            "id": row.id,
            "client_id": row.client_id,
            "phone": row.phone,
            "message": row.message,
            "status": row.status,
            "http_status": row.http_status,
            "response_data": row.response_data,
            "error_message": row.error_message,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]
