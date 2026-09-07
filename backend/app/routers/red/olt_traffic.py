"""
Módulo aislado: API de tráfico OLT VSOL.
Esta ruta no usa service.py ni router.py de OLT; un fallo se devuelve como lectura no
disponible y no altera el estado de conexión de la OLT.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.utils import get_or_404
from app.integrations.olt.traffic_vsol_web import OltTrafficError, get_vsol_web_traffic
from app.models.router import Router

router = APIRouter(
    prefix="/{router_id}/olt-traffic",
    tags=["OLT / Tráfico"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
async def olt_traffic_summary(router_id: str, db: AsyncSession = Depends(get_db)):
    device = await get_or_404(db, Router, router_id, "Router")
    if device.device_type != "olt":
        return {"ok": False, "error": "Este equipo no es una OLT.", "info": None}
    try:
        return await get_vsol_web_traffic(device)
    except OltTrafficError as exc:
        # Nunca propaga el fallo al módulo principal de OLT.
        return {"ok": False, "error": str(exc), "info": None}
