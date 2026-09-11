"""Motor aislado de reglas de automatización para WhatsApp.

Este archivo prepara el punto único desde el que las tareas programadas pueden
crear mensajes. No ejecuta trabajos por sí solo, evitando envíos inesperados al
instalar la funcionalidad.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal


def payment_reminder(template: str, client_name: str, amount: Decimal | float | int | str, plan: str, due_date: date | str) -> str:
    values = {
        "cliente": client_name,
        "monto": f"{Decimal(str(amount or 0)):.2f}",
        "plan": plan,
        "vencimiento": due_date,
    }
    return _render(template, values)


def cut_warning(template: str, client_name: str, amount: Decimal | float | int | str) -> str:
    return _render(template, {"cliente": client_name, "monto": f"{Decimal(str(amount or 0)):.2f}"})


def payment_confirmation(template: str, client_name: str, amount: Decimal | float | int | str, receipt: str) -> str:
    return _render(template, {"cliente": client_name, "monto": f"{Decimal(str(amount or 0)):.2f}", "recibo": receipt})


def _render(template: str, values: dict[str, object]) -> str:
    text = str(template or "")
    for key, value in values.items():
        text = text.replace("{" + key + "}", str(value if value is not None else ""))
    return text
