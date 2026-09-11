"""Plantillas editables de mensajes para automatizaciones de WhatsApp."""
from __future__ import annotations

DEFAULT_TEMPLATES = {
    "payment_reminder": {
        "name": "Recordatorio de pago",
        "text": "Hola {cliente}, le saludamos de {empresa}. Le recordamos que su recibo por S/. {monto} del plan {plan} vence el {vencimiento}. Puede pagar por Yape/Plin al {yape} o transferencia bancaria. ¡Gracias por preferirnos!",
        "variables": ["cliente", "empresa", "monto", "plan", "vencimiento", "yape"],
    },
    "cut_warning": {
        "name": "Aviso de corte por deuda vencida",
        "text": "Estimado(a) {cliente}, {empresa} le informa que su servicio presenta facturas vencidas por S/. {monto}. Para evitar el corte automático, regularice su pago hoy. Soporte: {telefono}.",
        "variables": ["cliente", "empresa", "monto", "telefono"],
    },
    "payment_confirmation": {
        "name": "Confirmación de pago",
        "text": "¡Pago recibido! Estimado(a) {cliente}, {empresa} confirma el cobro de S/. {monto} con comprobante {recibo}. Su servicio se encuentra ACTIVO. Gracias por su puntualidad.",
        "variables": ["cliente", "empresa", "monto", "recibo"],
    },
    "maintenance": {
        "name": "Aviso de mantenimiento",
        "text": "Estimado cliente de {empresa}: realizaremos trabajos de mantenimiento en la red el día {fecha} de {hora_inicio} a {hora_fin}. Agradecemos su comprensión.",
        "variables": ["empresa", "fecha", "hora_inicio", "hora_fin"],
    },
}


def get_templates(root: dict) -> dict:
    saved = root.get("message_templates") or {}
    result = {}
    for key, default in DEFAULT_TEMPLATES.items():
        current = saved.get(key) or {}
        result[key] = {**default, "text": current.get("text") or default["text"]}
    return result
