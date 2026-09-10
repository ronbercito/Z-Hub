"""
Punto de entrada FastAPI de Z-Hub. Monta rutas bajo /api y aplica permisos por módulo.
"""
from app.core.config import CORS_ORIGINS
import asyncio
import logging
import re
from contextlib import asynccontextmanager, suppress

from fastapi import APIRouter, Depends, FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.core import database
from app.core.permissions import require_permission, require_router_access
from app.core.seed import seed_initial_data
from app.models.client import Client
from app.routers.ajustes.router import router as ajustes_router, public_router as ajustes_public_router
from app.routers.ajustes.staff.router import router as staff_router
from app.routers.almacen.router import router as almacen_router
from app.routers.auth.router import router as auth_router
from app.routers.clientes.router import router as clientes_router
from app.routers.clientes.retired import router as retired_clients_router
from app.routers.clientes.pause import router as pause_clients_router, pause_worker
from app.routers.clientes.suspension_alerts import router as suspension_alerts_router, suspension_alert_worker
from app.routers.clientes.registration_settings import router as client_registration_settings_router
from app.routers.clientes.equipment_recoveries import router as equipment_recoveries_router
from app.routers.clientes.services import router as client_services_router
from app.routers.clientes.service_delete_audit import router as client_service_delete_audit_router
from app.routers.clientes.deletion_summary import router as client_deletion_summary_router
from app.routers.clientes.identity_sync import sync_client_identity
from app.routers.clientes.installations import router as installations_router
from app.routers.clientes.zones import router as zones_router
from app.routers.facturacion.router import router as facturacion_router
from app.routers.facturacion.client_balances import router as client_balances_router
from app.routers.facturacion.invoice_actions import router as invoice_actions_router
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
from app.routers.setup.router import router as setup_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("fibraz.server")

@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    await seed_initial_data()
    pause_task = asyncio.create_task(pause_worker())
    suspension_alert_task = asyncio.create_task(suspension_alert_worker())
    try:
        yield
    finally:
        pause_task.cancel()
        suspension_alert_task.cancel()
        with suppress(asyncio.CancelledError):
            await pause_task
        with suppress(asyncio.CancelledError):
            await suspension_alert_task
        await database.engine.dispose()

app = FastAPI(title="Z-Hub ISP API", version="3.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials="*" not in CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def sync_summary_identity(request, call_next):
    match = re.fullmatch(r"/api/clients/([^/]+)/summary", request.url.path) if request.method == "PATCH" else None
    previous = None
    if match:
        async with database.SessionLocal() as db:
            client = await db.get(Client, match.group(1))
            if client:
                previous = (client.dni_ruc or "", client.full_name or "")
    response = await call_next(request)
    if match and previous and 200 <= response.status_code < 300:
        async with database.SessionLocal() as db:
            client = await db.get(Client, match.group(1))
            if client:
                result = await sync_client_identity(db, client, previous[0], previous[1])
                if not result["ok"]:
                    logger.warning("%s %s", result["message"], result["routers"])
    return response

api = APIRouter(prefix="/api")
for router in (olt_traffic_router, olt_onu_power_router, olt_onu_v2_router, olt_onu_descriptions_router, olt_onu_summary_router, olt_onu_inventory_router):
    api.include_router(router, prefix="/routers", dependencies=[Depends(require_permission("olt"))])
for router in (ajustes_public_router, auth_router, system_update_router, setup_router):
    api.include_router(router)
api.include_router(red_router, dependencies=[Depends(require_router_access)])
api.include_router(client_workspace_router, dependencies=[Depends(require_permission("clients"))])

# Importante: registrar primero las rutas estáticas/especializadas de Clientes.
# El CRUD principal contiene /clients/{client_id}; si se registra antes puede capturar
# rutas como /clients/pause-policy o /clients/retirement-policy como si fueran IDs.
for router, module in (
    (inicio_router, "dashboard"),
    (retired_clients_router, "clients"), (pause_clients_router, "clients"), (suspension_alerts_router, "clients"),
    (client_registration_settings_router, "clients"), (equipment_recoveries_router, "clients"), (installations_router, "clients"),
    (client_service_delete_audit_router, "clients"), (client_services_router, "clients"),
    (client_deletion_summary_router, "clients"), (zones_router, "clients"),
    (clientes_router, "clients"),
    (planes_router, "plans"), (ipv4_networks_router, "network"), (nap_boxes_router, "network"),
    (monitoring_router, "monitoring"), (facturacion_router, "billing"), (client_balances_router, "billing"), (invoice_actions_router, "billing"),
    (tickets_router, "tickets"), (almacen_router, "inventory"), (hotspot_router, "hotspot"),
    (tareas_router, "tasks"), (mensajeria_router, "messaging"), (ajustes_router, "settings"), (staff_router, "staff"),
):
    api.include_router(router, dependencies=[Depends(require_permission(module))])

@api.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api)
