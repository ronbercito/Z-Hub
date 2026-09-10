"""
Alertas de suspensión prolongada de clientes.

Mantiene una fecha de inicio para el estado `suspended` y expone los clientes que
superaron el umbral configurable de 1 a 6 meses. No cambia ni retira servicios.
"""
import asyncio
import calendar
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.models.client import Client
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(prefix="/client-alerts", tags=["Clientes / Alertas"], dependencies=[Depends(get_current_user)])


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    text = str(value).strip()
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        try:
            return datetime.strptime(text[:10], "%Y-%m-%d").date()
        except ValueError:
            return None


def _add_months(value: date, months: int) -> date:
    total = value.year * 12 + (value.month - 1) + months
    year, month_index = divmod(total, 12)
    month = month_index + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _elapsed_months(start: date, end: date) -> int:
    months = (end.year - start.year) * 12 + (end.month - start.month)
    if end.day < start.day:
        months -= 1
    return max(0, months)


async def _config(db: AsyncSession) -> tuple[bool, int]:
    row = await db.get(Setting, "system_config")
    data = {**DEFAULT_SETTINGS, **((row.data or {}) if row else {})}
    enabled = bool(data.get("long_suspension_alert_enabled", True))
    try:
        months = int(data.get("long_suspension_alert_months", 3))
    except (TypeError, ValueError):
        months = 3
    return enabled, max(1, min(6, months))


async def _ensure_tracking(db: AsyncSession, clients: list[Client]) -> bool:
    """Mantiene el inicio del período suspendido y evita arrastrarlo tras reactivaciones."""
    changed = False
    for client in clients:
        suspended = _parse_date(client.suspended_at)
        last_active = _parse_date(client.last_connection_time)
        if client.status == "suspended":
            if not suspended:
                if last_active:
                    client.suspended_at = f"{last_active.isoformat()}T00:00:00+00:00"
                else:
                    client.suspended_at = now_iso()
                changed = True
            elif last_active and last_active > suspended:
                # Hubo una reactivación posterior a la suspensión anterior; comienza un ciclo nuevo.
                client.suspended_at = f"{last_active.isoformat()}T00:00:00+00:00"
                changed = True
        elif client.suspended_at:
            client.suspended_at = ""
            changed = True
    if changed:
        await db.commit()
    return changed


@router.get("/suspensions")
async def prolonged_suspensions(db: AsyncSession = Depends(get_db)):
    enabled, threshold_months = await _config(db)
    clients = (await db.execute(select(Client).where(Client.status == "suspended").order_by(Client.full_name))).scalars().all()
    await _ensure_tracking(db, clients)
    today = datetime.now(timezone.utc).date()
    alerts = []
    for client in clients:
        started = _parse_date(client.suspended_at)
        if not started:
            continue
        alert_on = _add_months(started, threshold_months)
        if not enabled or today < alert_on:
            continue
        months = _elapsed_months(started, today)
        residual_start = _add_months(started, months)
        extra_days = max(0, (today - residual_start).days)
        alerts.append({
            "id": client.id,
            "full_name": client.full_name,
            "dni_ruc": client.dni_ruc,
            "phone": client.phone,
            "address": client.address,
            "plan_name": client.plan_name,
            "router_name": client.router_name,
            "technology": client.technology,
            "onu_sn": client.onu_sn,
            "ip_address": client.ip_address,
            "suspended_at": client.suspended_at,
            "months_suspended": months,
            "extra_days": extra_days,
            "threshold_months": threshold_months,
            "alert_since": alert_on.isoformat(),
        })
    alerts.sort(key=lambda item: (item["months_suspended"], item["extra_days"]), reverse=True)
    return {
        "enabled": enabled,
        "threshold_months": threshold_months,
        "suspended_total": len(clients),
        "alert_count": len(alerts),
        "alerts": alerts,
    }


async def suspension_alert_worker():
    """Mantiene el inicio de suspensión sincronizado aunque nadie abra Clientes."""
    while True:
        try:
            async with database.SessionLocal() as db:
                clients = (await db.execute(select(Client))).scalars().all()
                await _ensure_tracking(db, clients)
        except Exception:
            # La alerta nunca debe tumbar el backend; se reintenta en la siguiente vuelta.
            pass
        await asyncio.sleep(3600)
