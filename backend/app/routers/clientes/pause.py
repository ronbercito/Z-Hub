"""Servicio en pausa: congela temporalmente el acceso sin liberar recursos técnicos."""
import asyncio
import calendar
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal, get_db, now_iso
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.router import Router
from app.models.setting import Setting

router = APIRouter(prefix="/clients", tags=["Servicio en pausa"], dependencies=[Depends(get_current_user)])


class PauseIn(BaseModel):
    months: int = Field(ge=1, le=3)
    reason: str = Field(min_length=10, max_length=250)


class ResumeIn(BaseModel):
    billing_day: int | None = Field(default=None, ge=1, le=30)


def _safe_date(year: int, month: int, day: int) -> date:
    return date(year, month, min(max(day, 1), calendar.monthrange(year, month)[1]))


def _add_months(value: date, months: int) -> date:
    index = value.month - 1 + months
    year = value.year + index // 12
    month = index % 12 + 1
    return _safe_date(year, month, value.day)


def _next_billing_date(client: Client, today: date) -> date:
    billing_day = min(max(int(client.billing_day or 5), 1), 30)
    candidate = _safe_date(today.year, today.month, billing_day)
    if candidate < today:
        candidate = _add_months(candidate, 1)
        candidate = _safe_date(candidate.year, candidate.month, billing_day)
    return candidate


async def _cut_list(db: AsyncSession) -> str:
    setting = await db.get(Setting, "system_config")
    return ((setting.data or {}).get("mikrotik_cut_list") or "morosos") if setting else "morosos"


def _activity(db: AsyncSession, client: Client, action: str, detail: str, operator: str = "Sistema"):
    db.add(ClientActivity(client_id=client.id, action=action, detail=detail, operator_name=operator))


def _decorate(client: Client, today: date | None = None) -> dict:
    item = client.to_dict()
    today = today or datetime.now(timezone.utc).date()
    try:
        until = date.fromisoformat((client.pause_until or "")[:10])
        days_left = max(0, (until - today).days)
    except ValueError:
        days_left = 0
    item["pause_days_left"] = days_left
    item["pause_alert_due"] = client.status == "paused" and days_left <= 5
    return item


async def _resume_client(db: AsyncSession, client: Client, billing_day: int | None = None, operator: str = "Sistema") -> dict:
    router_device = await db.get(Router, client.router_id) if client.router_id else None
    result = await mt.restore_client(client, router_device, await _cut_list(db))
    if not result.get("ok"):
        return {"ok": False, "message": result.get("message", "No se pudo reactivar MikroTik")}

    today = datetime.now(timezone.utc).date()
    saved_days = max(0, int(client.pause_saved_days or 0))
    restored_until = today + timedelta(days=saved_days)
    new_billing_day = billing_day if billing_day is not None else min(restored_until.day, 30)

    client.status = "active"
    client.is_online = True
    client.last_connection_time = now_iso()
    client.billing_day = new_billing_day
    client.pause_resumed_at = now_iso()
    client.pause_billing_day_after = new_billing_day
    client.pause_active = False
    _activity(
        db,
        client,
        "Servicio reactivado desde pausa",
        f"Reactivación {'manual' if operator != 'Sistema' else 'automática'}. Se devolvieron {saved_days} día(s) pendientes. Día de facturación resultante: {new_billing_day}.",
        operator,
    )
    await db.commit()
    await db.refresh(client)
    return {"ok": True, "message": f"Servicio reactivado. Se conservaron {saved_days} día(s) y el día de facturación quedó en {new_billing_day}.", "client": _decorate(client), "mikrotik": result}


@router.get("/paused/list")
async def list_paused(search: str = "", db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Client).where(Client.status == "paused").order_by(Client.pause_until.asc()))).scalars().all()
    term = search.strip().lower()
    if term:
        rows = [c for c in rows if term in " ".join([c.full_name or "", c.dni_ruc or "", c.phone or "", c.address or ""]).lower()]
    return [_decorate(c) for c in rows]


@router.post("/{client_id}/pause")
async def pause_client(client_id: str, payload: PauseIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if client.status != "active":
        raise HTTPException(status_code=409, detail="Solo un cliente activo puede entrar en pausa.")

    reason = payload.reason.strip()
    if len(reason) < 10:
        raise HTTPException(status_code=422, detail="El motivo de la pausa debe tener al menos 10 caracteres.")

    router_device = await db.get(Router, client.router_id) if client.router_id else None
    cut = await mt.cut_client(client, router_device, await _cut_list(db))
    if not cut.get("ok"):
        await db.rollback()
        raise HTTPException(status_code=502, detail=f"No se inició la pausa porque MikroTik no pudo suspender el servicio: {cut.get('message', 'error desconocido')}")

    today = datetime.now(timezone.utc).date()
    next_due = _next_billing_date(client, today)
    saved_days = max(0, (next_due - today).days)
    until = _add_months(today, payload.months)
    operator = current_user.get("name") or current_user.get("username") or "Operador"

    client.status = "paused"
    client.pause_active = True
    client.pause_started_at = now_iso()
    client.pause_until = until.isoformat()
    client.pause_months = payload.months
    client.pause_reason = reason
    client.pause_saved_days = saved_days
    client.pause_original_billing_day = int(client.billing_day or 5)
    client.pause_resumed_at = ""
    client.pause_billing_day_after = 0
    client.is_online = False
    _activity(db, client, "Servicio puesto en pausa", f"Pausa por {payload.months} mes(es) hasta {until.isoformat()}. Se guardaron {saved_days} día(s) de servicio. Motivo: {reason}", operator)
    await db.commit()
    await db.refresh(client)
    return {"ok": True, "message": f"Servicio en pausa hasta {until.strftime('%d/%m/%Y')}. Se guardaron {saved_days} día(s) pendientes.", "client": _decorate(client), "mikrotik": cut}


@router.post("/{client_id}/resume-pause")
async def resume_pause(client_id: str, payload: ResumeIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if client.status != "paused":
        raise HTTPException(status_code=409, detail="El cliente no se encuentra en pausa.")
    operator = current_user.get("name") or current_user.get("username") or "Operador"
    result = await _resume_client(db, client, payload.billing_day, operator)
    if not result.get("ok"):
        await db.rollback()
        raise HTTPException(status_code=502, detail=result.get("message"))
    return result


async def process_due_pauses() -> int:
    """Reactiva las pausas vencidas. Si MikroTik falla, quedan pendientes para el próximo intento."""
    today = datetime.now(timezone.utc).date()
    count = 0
    async with SessionLocal() as db:
        rows = (await db.execute(select(Client).where(Client.status == "paused"))).scalars().all()
        for client in rows:
            try:
                until = date.fromisoformat((client.pause_until or "")[:10])
            except ValueError:
                continue
            if until > today:
                continue
            result = await _resume_client(db, client, None, "Sistema")
            if result.get("ok"):
                count += 1
    return count


async def pause_worker():
    """Revisa una vez por hora las pausas que deben reactivarse automáticamente."""
    while True:
        try:
            await process_due_pauses()
        except Exception:
            # La pausa permanece registrada y se reintentará; nunca se borra el estado por un fallo temporal.
            pass
        await asyncio.sleep(3600)
