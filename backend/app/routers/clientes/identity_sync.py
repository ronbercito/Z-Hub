"""
Archivo: backend/app/routers/clientes/identity_sync.py
Actualización: 2026-09-08 — sincroniza nombre y DNI del cliente con las colas simples y secrets PPPoE existentes.
Función: actualiza comentarios de MikroTik después de guardar Resumen, sin reprovisionar ni crear servicios duplicados.
Trabaja con: clientes/router.py, modelos Client/ClientService/Router y la integración MikroTik.
"""
import re
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.router import Router

logger = logging.getLogger("fibraz.mikrotik.identity_sync")


def _clean_dni(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]", "", (value or "").strip()) or "SIN-DNI"


def _queue_matches(queue: dict, dni_values: set[str], old_name: str, ip_address: str | None, primary: bool) -> bool:
    name = str(queue.get("name") or "")
    comment = str(queue.get("comment") or "")
    target = str(queue.get("target") or "")
    if ip_address and target == f"{ip_address}/32":
        return True
    if primary:
        return any(name == f"cli-{dni}" for dni in dni_values) or (old_name and old_name in comment and name.startswith("cli-"))
    return (
        any(name == f"svc-{dni}" or name.startswith(f"svc-{dni}-") for dni in dni_values)
        or any(dni in comment for dni in dni_values if dni)
        or (old_name and old_name in comment and name.startswith("svc-"))
    )


async def _service_queue_name(mikrotik, dni: str, service_index: int, current_name: str) -> str:
    """Mantiene la convención actual: servicio 2 usa svc-DNI; servicio 3 usa -2, etc."""
    base = f"svc-{_clean_dni(dni)}"
    desired = base if service_index == 2 else f"{base}-{service_index - 1}"
    queues = await mikrotik.simple_queues()
    names = {str(q.get("name") or "") for q in queues}
    if desired not in names or desired == current_name:
        return desired
    return current_name


async def _sync_router_identity(
    mikrotik,
    client: Client,
    services: list[ClientService],
    router_id: str,
    old_dni: str,
    old_name: str,
) -> None:
    queues = await mikrotik.simple_queues()
    secrets = await mikrotik.ppp_secrets()
    dni_values = {_clean_dni(old_dni), _clean_dni(client.dni_ruc)}

    if client.router_id == router_id:
        if client.connection_type == "PPPoE" and client.pppoe_user:
            secret = next((item for item in secrets if str(item.get("name") or "") == client.pppoe_user), None)
            if secret and secret.get("id"):
                await mikrotik.set("ppp", "secret", **{".id": secret["id"], "comment": f"{client.full_name} | {client.plan_name}"})
        elif client.ip_address:
            queue = next((item for item in queues if _queue_matches(item, dni_values, old_name, client.ip_address, True)), None)
            if queue and queue.get("id"):
                desired_name = f"cli-{_clean_dni(client.dni_ruc)}"
                if any(item.get("name") == desired_name and item.get("id") != queue.get("id") for item in queues):
                    desired_name = str(queue.get("name") or desired_name)
                await mikrotik.set(
                    "queue", "simple",
                    **{".id": queue["id"], "name": desired_name, "comment": f"{client.full_name} | {client.plan_name}"},
                )

    for service_index, row in enumerate(services, start=2):
        if row.router_id != router_id:
            continue
        service_comment = f"{client.full_name} | {row.plan_name} | serv {service_index}"
        if row.connection_type == "PPPoE" and row.pppoe_user:
            secret = next((item for item in secrets if str(item.get("name") or "") == row.pppoe_user), None)
            if secret and secret.get("id"):
                await mikrotik.set(
                    "ppp", "secret",
                    **{".id": secret["id"], "comment": service_comment},
                )
            continue
        if not row.ip_address:
            continue
        queue = next((item for item in queues if _queue_matches(item, dni_values, old_name, row.ip_address, False)), None)
        if queue and queue.get("id"):
            desired_name = await _service_queue_name(mikrotik, client.dni_ruc, service_index, str(queue.get("name") or ""))
            await mikrotik.set(
                "queue", "simple",
                **{
                    ".id": queue["id"],
                    "name": desired_name,
                    "comment": service_comment,
                },
            )


async def sync_client_identity(db: AsyncSession, client: Client, old_dni: str, old_name: str) -> dict:
    """Sincroniza identidad en MikroTik sin volver a aprovisionar el servicio."""
    services = (
        await db.execute(
            select(ClientService)
            .where(ClientService.client_id == client.id)
            .order_by(ClientService.created_at.asc(), ClientService.id.asc())
        )
    ).scalars().all()

    router_ids = {row.router_id for row in services if row.router_id}
    if client.router_id:
        router_ids.add(client.router_id)

    results = []
    for router_id in router_ids:
        router_obj = await db.get(Router, router_id)
        if not router_obj or router_obj.device_type != "mikrotik" or not router_obj.password:
            continue
        try:
            async with mt.connect(router_obj) as mikrotik:
                await _sync_router_identity(mikrotik, client, services, router_id, old_dni, old_name)
            results.append({"router": router_obj.name, "ok": True})
        except mt.MikroTikError as exc:
            logger.warning("No se pudo sincronizar identidad del cliente %s en %s: %s", client.id, router_obj.name, exc)
            results.append({"router": router_obj.name, "ok": False, "message": str(exc)})
        except Exception as exc:
            logger.exception("Error sincronizando identidad del cliente %s en %s", client.id, router_obj.name)
            results.append({"router": router_obj.name, "ok": False, "message": str(exc)})

    failed = [item for item in results if not item["ok"]]
    return {
        "ok": not failed,
        "routers": results,
        "message": "Identidad sincronizada en MikroTik." if not failed else "El cliente se guardó, pero una o más sincronizaciones MikroTik fallaron.",
    }
