"""
Punto de entrada FastAPI. Monta rutas bajo /api y aplica permisos por módulo.
Las rutas OLT específicas se registran antes del router genérico de red.
"""
from app.core.config import CORS_ORIGINS
import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.core import database
from app.core.permissions import require_permission, require_router_access
from app.core.seed import seed_initial_data
from app.routers.ajustes.router import router as ajustes_router, public_router as ajustes_public_router
from app.routers.ajustes.staff.router import router as staff_router
from app.routers.almacen.router import router as almacen_router
from app.routers.auth.router import router as auth_router
from app.routers.clientes.router import router as clientes_router
from app.routers.clientes.zones import router as zones_router
from app.routers.facturacion.router import router as facturacion_router
from app.routers.hotspot.router import router as hotspot_router
from app.routers.inicio.router import router as inicio_router
from app.routers.mensajeria.router import router as mensajeria_router
from app.routers.planes.router import router as planes_router
from app.routers.red.router import router as red_router
from app.routers.red.ipv4_networks import router as ipv4_networks_router
from app.routers.red.nap_boxes import router as nap_boxes_router
from app.routers.red.monitoring import router as monitoring_router
from app.routers.red.olt_onu_summary import router as olt_onu_summary_router
from app.routers.red.olt_onu_inventory import router as olt_onu_inventory_router
from app.routers.red.olt_onu_power import router as olt_onu_power_router
from app.routers.red.olt_onu_v2 import router as olt_onu_v2_router
from app.routers.red.olt_onu_descriptions import router as olt_onu_descriptions_router
from app.routers.red.olt_traffic import router as olt_traffic_router
from app.routers.tareas.router import router as tareas_router
from app.routers.tickets.router import router as tickets_router
from app.modules.system_update.router import router as system_update_router
from app.modules.client_workspace.router import router as client_workspace_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    await seed_initial_data()
    yield
    await database.engine.dispose()

app = FastAPI(title="FibraZ / MikroSmart ISP API", version="3.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials="*" not in CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])
api = APIRouter(prefix="/api")

# OLT: rutas específicas antes de /routers genérico.
for router in (olt_traffic_router, olt_onu_power_router, olt_onu_v2_router, olt_onu_descriptions_router, olt_onu_summary_router, olt_onu_inventory_router):
    api.include_router(router, prefix="/routers", dependencies=[Depends(require_permission("olt"))])

# Públicas o de sesión; no pasan por control de módulo.
for router in (ajustes_public_router, auth_router, system_update_router):
    api.include_router(router)

# Cada grupo aplica autorización real antes de ejecutar sus endpoints.
api.include_router(red_router, dependencies=[Depends(require_router_access)])
api.include_router(client_workspace_router, dependencies=[Depends(require_permission("clients"))])

for router, module in (
    (inicio_router, "dashboard"), (clientes_router, "clients"), (zones_router, "clients"),
    (planes_router, "plans"), (ipv4_networks_router, "network"), (nap_boxes_router, "network"),
    (monitoring_router, "monitoring"), (facturacion_router, "billing"),
    (tickets_router, "tickets"), (almacen_router, "inventory"), (hotspot_router, "hotspot"),
    (tareas_router, "tasks"), (mensajeria_router, "messaging"), (ajustes_router, "settings"),
    (staff_router, "staff"),
):
    api.include_router(router, dependencies=[Depends(require_permission(module))])

@api.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api)
