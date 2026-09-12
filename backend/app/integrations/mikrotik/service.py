"""
Archivo: backend/app/integrations/mikrotik/service.py
Actualización: 2026-09-12 — el snapshot incluye concesiones DHCP bound para las tarjetas MikroTik.
Función: Capa de negocio MikroTik para aprovisionamiento, corte, restauración y limpieza.
Trabaja con: backend/app/integrations/mikrotik/client.py, modelos de clientes/servicios/planes/routers.
"""
import logging
import re

from sqlalchemy import select

from app.core.database import SessionLocal, now_iso
from app.integrations.mikrotik.client import MikroTikClient, MikroTikError, tcp_latency_ms
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.plan import Plan
from app.models.router import Router

logger = logging.getLogger("fibraz.mikrotik")


def connect(router: Router) -> MikroTikClient:
    return MikroTikClient(router.ip_address, router.username, router.password, router.port, router.use_ssl)


def service_queue_name(dni_ruc: str) -> str:
    """Genera un nombre visible por DNI para las colas de servicios adicionales."""
    dni = re.sub(r"[^A-Za-z0-9_-]", "", (dni_ruc or "").strip()) or "SIN-DNI"
    return f"svc-{dni}"[:100]


def plan_rate_limit(plan: Plan) -> str:
    base = f"{plan.upload_speed_mbps}M/{plan.download_speed_mbps}M"
    if plan.burst_limit and "/" in plan.burst_limit:
        return f"{base} {plan.burst_limit}"
    return base


def plan_profile_name(plan: Plan) -> str:
    return plan.mikrotik_profile or plan.name.replace(" ", "_")


async def snapshot_router(router: Router) -> dict:
    """Lee el estado real del MikroTik y lo guarda en el objeto router (sin commit)."""
    latency = await tcp_latency_ms(router.ip_address, router.port)
    try:
        async with connect(router) as mt:
            res = await mt.system_resource()
            active = await mt.ppp_active()
            queues = await mt.simple_queues()
            ifaces = await mt.interfaces()
            leases = await mt.dhcp_leases()
    except MikroTikError as e:
        router.status = "offline"
        router.last_error = str(e)[:250]
        router.last_sync = now_iso()
        router.dhcp_bound_count = 0
        return {"ok": False, "message": str(e), "dhcp_bound_count": 0}

    dhcp_bound_count = sum(1 for row in leases if str(row.get("status", "")).lower() == "bound")
    router.status = "online"
    router.last_error = ""
    router.identity = res["identity"]
    router.ros_version = res["version"]
    router.board_name = res["board_name"]
    router.uptime = res["uptime"]
    router.cpu_usage_pct = res["cpu_load"]
    router.memory_usage_pct = res["memory_used_pct"]
    router.active_pppoe_count = len(active)
    router.active_queues_count = len(queues)
    router.dhcp_bound_count = dhcp_bound_count
    router.total_download_mbps = round(sum(i["rx_mbps"] for i in ifaces if i["type"] in ("ether", "sfp", "vlan", "bridge") and i["running"]), 2)
    router.total_upload_mbps = round(sum(i["tx_mbps"] for i in ifaces if i["type"] in ("ether", "sfp", "vlan", "bridge") and i["running"]), 2)
    router.ping_ms = latency or 0.0
    router.last_sync = now_iso()
    return {"ok": True, "message": f"Conectado a {res['identity']} (RouterOS {res['version']})",
            "resource": res, "active_pppoe": len(active), "queues": len(queues), "interfaces": len(ifaces),
            "dhcp_bound_count": dhcp_bound_count}


async def provision_client(client: Client, router: Router | None, plan: Plan | None) -> dict:
    if not router or router.device_type != "mikrotik" or not router.password:
        return {"ok": False, "message": "Cliente guardado. Sin router MikroTik con credenciales asignado."}
    try:
        async with connect(router) as mt:
            if client.connection_type == "PPPoE" and client.pppoe_user:
                profile = plan_profile_name(plan) if plan else "default"
                if plan:
                    await mt.upsert_ppp_profile(profile, plan_rate_limit(plan))
                action = await mt.upsert_ppp_secret(
                    client.pppoe_user, client.pppoe_password or client.pppoe_user, profile,
                    comment=f"{client.full_name} | {client.dni_ruc}",
                    remote_address=client.ip_address, disabled=(client.status == "suspended"))
                msg = f"PPP secret '{client.pppoe_user}' {action} en {router.name} (perfil {profile})"
            elif client.ip_address:
                max_limit = plan_rate_limit(plan) if plan else "1M/1M"
                action = await mt.upsert_simple_queue(
                    f"cli-{client.dni_ruc}", f"{client.ip_address}/32", max_limit.split(" ")[0],
                    comment=f"{client.full_name} | {client.plan_name}",
                    burst_limit=plan.burst_limit if plan and "/" in (plan.burst_limit or "") else "")
                msg = f"Cola simple para {client.ip_address} {action} en {router.name} ({max_limit})"
            else:
                return {"ok": False, "message": "Cliente sin usuario PPPoE ni IP: no se aprovisionó en MikroTik."}
    except MikroTikError as e:
        logger.warning("provision_client %s: %s", client.full_name, e)
        return {"ok": False, "message": f"Cliente guardado, pero MikroTik no respondió: {e}"}
    client.mikrotik_status = msg
    return {"ok": True, "message": msg}


async def _apply_cut(client: Client, router: Router | None, cut_list: str, cut: bool) -> dict:
    if not router or router.device_type != "mikrotik" or not router.password:
        return {"ok": False, "message": "Estado actualizado en el panel. Sin router MikroTik asignado."}
    verb = "CORTADO" if cut else "REACTIVADO"
    try:
        async with connect(router) as mt:
            if client.connection_type == "PPPoE" and client.pppoe_user:
                found = await mt.set_ppp_secret_disabled(client.pppoe_user, cut)
                if not found:
                    return {"ok": False, "message": f"El secret PPPoE '{client.pppoe_user}' no existe en {router.name}."}
                msg = f"Servicio {verb}: secret PPPoE '{client.pppoe_user}' {'deshabilitado y sesión cerrada' if cut else 'habilitado'} en {router.name}"
            elif client.ip_address:
                if cut:
                    await mt.address_list_add(cut_list, client.ip_address, comment=f"{client.full_name} | {client.dni_ruc}")
                else:
                    await mt.address_list_remove(cut_list, client.ip_address)
                msg = f"Servicio {verb}: IP {client.ip_address} {'agregada a' if cut else 'quitada de'} address-list '{cut_list}' en {router.name}"
            else:
                return {"ok": False, "message": "Cliente sin usuario PPPoE ni IP configurada."}
    except MikroTikError as e:
        return {"ok": False, "message": f"Estado actualizado en el panel, pero MikroTik no respondió: {e}"}
    client.mikrotik_status = msg
    return {"ok": True, "message": msg}


async def cut_client(client: Client, router: Router | None, cut_list: str) -> dict:
    return await _apply_cut(client, router, cut_list, True)


async def restore_client(client: Client, router: Router | None, cut_list: str) -> dict:
    return await _apply_cut(client, router, cut_list, False)


async def remove_client(client: Client, router: Router | None, cut_list: str) -> dict:
    if not router or router.device_type != "mikrotik" or not router.password:
        return {"ok": False, "message": "Sin router MikroTik asignado."}
    try:
        async with connect(router) as mt:
            if client.pppoe_user:
                await mt.remove_ppp_secret(client.pppoe_user)
            if client.ip_address:
                await mt.remove_simple_queue(f"cli-{client.dni_ruc}")
                await mt.address_list_remove(cut_list, client.ip_address)

            dni_marker = f"| {client.dni_ruc} |"
            name_marker = client.full_name.strip()
            for secret in await mt.ppp_secrets():
                comment = str(secret.get("comment") or "")
                if dni_marker in comment and secret.get("name") != client.pppoe_user:
                    await mt.remove_ppp_secret(secret.get("name") or "")
            for queue in await mt.simple_queues():
                name = str(queue.get("name") or "")
                comment = str(queue.get("comment") or "")
                if (name.startswith(f"svc-{re.sub(r'[^A-Za-z0-9_-]', '', (client.dni_ruc or '').strip())}") or
                        (name.startswith("svc-") and name_marker and name_marker in comment and "Servicio" in comment)):
                    await mt.remove_simple_queue(name)

        async with SessionLocal() as cleanup_db:
            services = (await cleanup_db.execute(select(ClientService).where(ClientService.client_id == client.id))).scalars().all()
            router_ids = {row.router_id for row in services if row.router_id and row.router_id != (router.id if router else None)}
            for service_router_id in router_ids:
                service_router = await cleanup_db.get(Router, service_router_id)
                if not service_router or service_router.device_type != "mikrotik" or not service_router.password:
                    continue
                try:
                    async with connect(service_router) as service_mt:
                        for row in services:
                            if row.router_id != service_router_id:
                                continue
                            if row.pppoe_user:
                                await service_mt.remove_ppp_secret(row.pppoe_user)
                            if row.ip_address:
                                await service_mt.remove_simple_queue(service_queue_name(client.dni_ruc))
                                await service_mt.remove_simple_queue(f"svc-{row.id}")
                except MikroTikError as service_error:
                    return {"ok": False, "message": f"No se pudo limpiar el servicio adicional en {service_router.name}: {service_error}"}
    except MikroTikError as e:
        return {"ok": False, "message": str(e)}
    return {"ok": True, "message": "Configuración del cliente y sus servicios eliminada en MikroTik"}


async def sync_plans(router: Router, plans: list[Plan]) -> dict:
    try:
        async with connect(router) as mt:
            results = []
            for p in plans:
                action = await mt.upsert_ppp_profile(plan_profile_name(p), plan_rate_limit(p))
                results.append({"plan": p.name, "profile": plan_profile_name(p), "rate_limit": plan_rate_limit(p), "action": action})
    except MikroTikError as e:
        return {"ok": False, "message": str(e), "results": []}
    return {"ok": True, "message": f"{len(results)} perfiles PPP sincronizados en {router.name}", "results": results}
