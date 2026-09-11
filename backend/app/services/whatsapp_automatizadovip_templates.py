"""Plantillas editables de mensajes para automatizaciones de WhatsApp.

Las plantillas usan la sintaxis compatible con WispHub: {{variable}}, %vip% y
formato WhatsApp con *negritas*. El renderizador común se encarga de convertirlas
en el texto final antes de enviarlas por cualquier pasarela.
"""
from __future__ import annotations

DEFAULT_TEMPLATES = {
    "payment_reminder": {
        "name": "Recordatorio de pago",
        "text": "Estimado(a): *{{cliente_nombre}} {{cliente_apellidos}}* .\n%vip%%vip%\nSu recibo ya se encuentra disponible.\n%vip%%vip%\nTotal a pagar *{{total}}*.\n%vip%%vip%\nFecha de Vencimiento *{{fecha_pago}}*\n%vip%\nDia de Corte: *{{fecha_corte}}*\n%vip%%vip%\n*¿DÓNDE PAGAR?*\n%vip%\n*YAPE/PLIN*\n%vip%\n{{yape}}\n%vip%\n({{titular_pago}})\n%vip%%vip%\nSi ya pago, omita este mensaje.\n%vip%%vip%\n*Enviar captura de pantalla de deposito para su validacion*",
        "variables": ["cliente_nombre", "cliente_apellidos", "total", "fecha_pago", "fecha_corte", "yape", "titular_pago"],
    },
    "cut_warning": {
        "name": "Aviso de corte por deuda vencida",
        "text": "Estimado(a): *{{cliente_nombre}} {{cliente_apellidos}}* .\n%vip%%vip%\nSu servicio presenta una deuda vencida por *{{total}}*.\n%vip%%vip%\nFecha de Vencimiento: *{{fecha_pago}}*\n%vip%%vip%\n*Evite el corte regularizando su pago.*\n%vip%%vip%\nSoporte: {{telefono}}",
        "variables": ["cliente_nombre", "cliente_apellidos", "total", "fecha_pago", "telefono"],
    },
    "payment_confirmation": {
        "name": "Confirmación de pago",
        "text": "Estimado(a): *{{cliente_nombre}} {{cliente_apellidos}}* .\n%vip%%vip%\nHemos recibido su pago por *{{total}}*.\n%vip%%vip%\nComprobante: *{{factura}}*\n%vip%%vip%\nSu servicio se encuentra *ACTIVO*.\n%vip%%vip%\nGracias por su pago.",
        "variables": ["cliente_nombre", "cliente_apellidos", "total", "factura"],
    },
    "maintenance": {
        "name": "Aviso de mantenimiento",
        "text": "Estimado(a): *{{cliente_nombre}} {{cliente_apellidos}}* .\n%vip%%vip%\n{{empresa}} informa que se realizará mantenimiento de red el *{{fecha}}* de *{{hora_inicio}}* a *{{hora_fin}}*.\n%vip%%vip%\nAgradecemos su comprensión.",
        "variables": ["cliente_nombre", "cliente_apellidos", "empresa", "fecha", "hora_inicio", "hora_fin"],
    },
}


def get_templates(root: dict) -> dict:
    saved = root.get("message_templates") or {}
    result = {}
    for key, default in DEFAULT_TEMPLATES.items():
        current = saved.get(key) or {}
        result[key] = {**default, "text": current.get("text") or default["text"]}
    return result
