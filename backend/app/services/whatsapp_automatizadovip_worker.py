"""Worker conservador para automatizaciones de WhatsApp mediante AutomatizadoVIP."""
from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.client import Client
from app.models.invoice import Invoice
from app.models.setting import Setting
from app.models.whatsapp_automatizadovip_log import WhatsAppAutomatizadoVIPLog
from app.services.whatsapp_automatizadovip import WhatsAppGatewayError, send_messages
from app.services.whatsapp_automatizadovip_automation import cut_warning, payment_confirmation, payment_reminder
from app.services.whatsapp_automatizadovip_templates import get_templates

SETTINGS_KEY = "whatsapp_automatizadovip"
DEFAULT_AUTOMATION = {
    "enabled": False,
    "reminder_enabled": True,
    "reminder_days_before": 3,
    "cut_warning_enabled": True,
    "payment_confirmation_enabled": True,
    "run_interval_minutes": 30,
    "max_batch": 50,
}


def _cfg(setting: Setting | None) -> dict[str, Any]:
    raw = ((setting.data if setting else {}) or {}).get(SETTINGS_KEY) or {}
    automation = raw.get("automation") or {}
    return {**DEFAULT_AUTOMATION, **automation}


def _parse_date(value: str | None) -> date | None:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
    except ValueError:
        pass
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


async def _already_sent(db, client_id: str, message: str) -> bool:
    today = date.today().isoformat()
    result = await db.execute(
        select(WhatsAppAutomatizadoVIPLog.id)
        .where(WhatsAppAutomatizadoVIPLog.client_id == client_id)
        .where(WhatsAppAutomatizadoVIPLog.message == message)
        .where(WhatsAppAutomatizadoVIPLog.created_at >= datetime.fromisoformat(f"{today}T00:00:00+00:00"))
        .limit(1)
    )
    return result.scalar_one_or_none() is not None


async def _send_one(db, cfg, client, message) -> bool:
    if not client.phone or await _already_sent(db, client.id, message):
        return False
    try:
        result = await send_messages(
            api_key=cfg.get("api_key", ""),
            contacts=[{"number": client.phone, "message": message}],
            gateway_url=cfg.get("gateway_url"),
            country_code=cfg.get("country_code", "51"),
            verify=bool(cfg.get("verify", True)),
        )
        db.add(WhatsAppAutomatizadoVIPLog(client_id=client.id, phone=client.phone, message=message, status="sent", http_status=result.status_code, response_data=result.response))
        await db.commit()
        return True
    except (ValueError, WhatsAppGatewayError) as exc:
        db.add(WhatsAppAutomatizadoVIPLog(client_id=client.id, phone=client.phone, message=message, status="failed", error_message=str(exc)))
        await db.commit()
        return False


async def run_automation_cycle() -> int:
    async with SessionLocal() as db:
        setting = await db.get(Setting, "system_config")
        system_data = ((setting.data if setting else {}) or {})
        root = system_data.get(SETTINGS_KEY) or {}
        cfg = {**root, "automation": _cfg(setting)}
        automation = cfg["automation"]
        if not automation.get("enabled") or not cfg.get("enabled") or not str(cfg.get("api_key") or "").strip():
            return 0

        company = system_data.get("company_name") or "su proveedor de internet"
        yape = system_data.get("yape_number") or ""
        phone = system_data.get("phone") or yape
        titular_pago = system_data.get("yape_holder") or system_data.get("yape_name") or ""
        templates = get_templates(system_data)
        sent = 0
        today = date.today()
        max_batch = max(1, min(int(automation.get("max_batch", 50)), 200))

        invoices = (await db.execute(select(Invoice).where(Invoice.status.in_(["unpaid", "pending", "overdue"])).limit(500))).scalars().all()
        clients = (await db.execute(select(Client))).scalars().all()
        clients_by_id = {c.id: c for c in clients}

        for invoice in invoices:
            if sent >= max_batch:
                break
            client = clients_by_id.get(invoice.client_id)
            if not client or client.status in {"retired", "paused"}:
                continue
            due = _parse_date(invoice.due_date)
            if not due:
                continue

            if automation.get("reminder_enabled"):
                days_before = max(0, int(automation.get("reminder_days_before", 3)))
                if due == today + timedelta(days=days_before):
                    message = payment_reminder(
                        templates["payment_reminder"]["text"],
                        client.full_name,
                        invoice.amount,
                        invoice.plan_name or client.plan_name,
                        invoice.due_date,
                        company=company,
                        yape=yape,
                        phone=phone,
                        titular_pago=titular_pago,
                        cutoff_date=invoice.due_date,
                    )
                    sent += int(await _send_one(db, cfg, client, message))
                    if sent >= max_batch:
                        break

            if automation.get("cut_warning_enabled") and due < today and (today - due).days >= max(0, int(client.grace_days or 0)):
                message = cut_warning(
                    templates["cut_warning"]["text"],
                    client.full_name,
                    invoice.amount,
                    company=company,
                    phone=phone,
                    yape=yape,
                    due_date=invoice.due_date,
                    cutoff_date=invoice.due_date,
                )
                sent += int(await _send_one(db, cfg, client, message))

        if automation.get("payment_confirmation_enabled") and sent < max_batch:
            paid = (await db.execute(select(Invoice).where(Invoice.status.in_(["paid", "pagado"])).limit(500))).scalars().all()
            for invoice in paid:
                if sent >= max_batch:
                    break
                paid_day = _parse_date(invoice.payment_date)
                client = clients_by_id.get(invoice.client_id)
                if not client or paid_day != today:
                    continue
                message = payment_confirmation(
                    templates["payment_confirmation"]["text"],
                    client.full_name,
                    invoice.paid_amount or invoice.amount,
                    invoice.invoice_number,
                    company=company,
                    phone=phone,
                    yape=yape,
                    payment_date=invoice.payment_date,
                    due_date=invoice.due_date,
                )
                sent += int(await _send_one(db, cfg, client, message))

        return sent


async def whatsapp_automatizadovip_worker() -> None:
    while True:
        interval = 30
        try:
            async with SessionLocal() as db:
                setting = await db.get(Setting, "system_config")
                interval = max(5, int(_cfg(setting).get("run_interval_minutes", 30)))
            await run_automation_cycle()
        except asyncio.CancelledError:
            raise
        except Exception:
            pass
        await asyncio.sleep(interval * 60)
