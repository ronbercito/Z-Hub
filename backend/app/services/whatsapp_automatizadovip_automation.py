"""Renderizado de mensajes de automatización usando el motor común de plantillas."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from app.services.whatsapp_template_renderer import render_whatsapp_template


def _name_parts(client_name: str) -> tuple[str, str]:
    parts = str(client_name or "").strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def _date(value: date | datetime | str | None) -> str:
    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y")
    if isinstance(value, date):
        return value.strftime("%d/%m/%Y")
    text = str(value or "").strip()
    if not text:
        return ""
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).strftime("%d/%m/%Y")
    except ValueError:
        return text


def _money(value: Decimal | float | int | str | None) -> str:
    return f"S/.{Decimal(str(value or 0)):.2f}"


def render_automation_template(
    template: str,
    *,
    client_name: str = "",
    amount: Decimal | float | int | str | None = 0,
    plan: str = "",
    due_date: date | str | None = None,
    company: str = "",
    yape: str = "",
    phone: str = "",
    receipt: str = "",
    cutoff_date: date | str | None = None,
    payment_date: date | str | None = None,
    titular_pago: str = "",
    extra: dict[str, Any] | None = None,
) -> str:
    first_name, last_names = _name_parts(client_name)
    values: dict[str, Any] = {
        "cliente": client_name,
        "cliente_nombre": first_name,
        "cliente_apellidos": last_names,
        "empresa": company,
        "total": _money(amount),
        "monto": f"{Decimal(str(amount or 0)):.2f}",
        "plan": plan,
        "fecha_pago": _date(payment_date or due_date),
        "fecha_vencimiento": _date(due_date),
        "fecha_corte": _date(cutoff_date or due_date),
        "vencimiento": _date(due_date),
        "yape": yape,
        "telefono": phone,
        "factura": receipt,
        "recibo": receipt,
        "titular_pago": titular_pago,
    }
    if extra:
        values.update(extra)
    return render_whatsapp_template(template, values)


def payment_reminder(template: str, client_name: str, amount: Decimal | float | int | str, plan: str, due_date: date | str, **kwargs: Any) -> str:
    return render_automation_template(template, client_name=client_name, amount=amount, plan=plan, due_date=due_date, **kwargs)


def cut_warning(template: str, client_name: str, amount: Decimal | float | int | str, **kwargs: Any) -> str:
    return render_automation_template(template, client_name=client_name, amount=amount, **kwargs)


def payment_confirmation(template: str, client_name: str, amount: Decimal | float | int | str, receipt: str, **kwargs: Any) -> str:
    return render_automation_template(template, client_name=client_name, amount=amount, receipt=receipt, **kwargs)
