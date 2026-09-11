"""Helpers para automatizaciones de WhatsApp AutomatizadoVIP.

La ejecución automática se mantiene separada del módulo existente. Este servicio
contiene únicamente reglas de selección y renderizado; un scheduler externo o
una tarea de aplicación puede invocarlo sin duplicar la lógica del gateway.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal


def render_template(template: str, values: dict[str, object]) -> str:
    """Reemplaza variables {campo} sin romper el texto si falta una variable."""
    text = str(template or "")
    for key, value in values.items():
        text = text.replace("{" + key + "}", str(value if value is not None else ""))
    return text


def build_payment_reminder_message(
    template: str,
    *,
    client_name: str,
    amount: Decimal | float | int | str,
    plan: str,
    due_date: date | str,
) -> str:
    return render_template(
        template,
        {
            "cliente": client_name,
            "monto": f"{Decimal(str(amount or 0)):.2f}",
            "plan": plan,
            "vencimiento": due_date,
        },
    )


def build_cut_warning_message(
    template: str,
    *,
    client_name: str,
    amount: Decimal | float | int | str,
) -> str:
    return render_template(
        template,
        {
            "cliente": client_name,
            "monto": f"{Decimal(str(amount or 0)):.2f}",
        },
    )


def build_payment_confirmation_message(
    template: str,
    *,
    client_name: str,
    amount: Decimal | float | int | str,
    receipt: str,
) -> str:
    return render_template(
        template,
        {
            "cliente": client_name,
            "monto": f"{Decimal(str(amount or 0)):.2f}",
            "recibo": receipt,
        },
    )
