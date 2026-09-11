"""Plantillas editables de mensajes para automatizaciones de WhatsApp.

Las plantillas usan la sintaxis compatible con WispHub: {{variable}}, %vip% y
formato WhatsApp con *negritas*. El renderizador común se encarga de convertirlas
en el texto final antes de enviarlas por cualquier pasarela.
"""
from __future__ import annotations

DEFAULT_TEMPLATES = {
    "payment_reminder": {
        "name": "Recordatorio de pago",
        "text": "👋 *¡Hola, {{cliente_nombre}}!*\n\n💙 Somos *{{empresa}}* y queremos avisarte que tu recibo de internet ya está disponible.\n\n💰 *Total a pagar:* {{total}}\n📅 *Fecha de vencimiento:* {{fecha_pago}}\n\n💳 *Puedes realizar tu pago por:*\n\n📱 *YAPE / PLIN*\n👉 {{yape}}\n{{titular_pago}}\n\n🏦 *Transferencia bancaria*\n\n📸 Si realizas una transferencia o depósito, envíanos una *captura del comprobante* para validar tu pago.\n\n✅ *Si ya realizaste el pago, puedes ignorar este mensaje.*\n\n🙏 *¡Gracias por seguir confiando en {{empresa}}!*",
        "variables": ["cliente_nombre", "empresa", "total", "fecha_pago", "yape", "titular_pago"],
    },
    "cut_warning": {
        "name": "Aviso de corte por deuda vencida",
        "text": "👋 *Hola, {{cliente_nombre}}*\n\n⚠️ Queremos ayudarte a mantener tu servicio de *{{empresa}}* activo.\n\n💰 *Saldo pendiente:* {{total}}\n📅 *Vencimiento:* {{fecha_pago}}\n\n⏰ Tu pago se encuentra vencido. Para evitar una interrupción del servicio, te recomendamos regularizarlo lo antes posible.\n\n📱 *YAPE / PLIN:* {{yape}}\n📞 *Soporte:* {{telefono}}\n\n📸 Después de realizar el pago, envíanos tu comprobante para validarlo.\n\n💙 *Gracias por tu atención y por seguir con {{empresa}}.*",
        "variables": ["cliente_nombre", "empresa", "total", "fecha_pago", "yape", "telefono"],
    },
    "payment_confirmation": {
        "name": "Confirmación de pago",
        "text": "🎉 *¡Pago recibido, {{cliente_nombre}}!*\n\n💙 *{{empresa}}* confirma que hemos recibido tu pago.\n\n💰 *Monto:* {{total}}\n🧾 *Comprobante:* {{factura}}\n\n✅ *Tu servicio se encuentra ACTIVO.*\n\n🙏 ¡Gracias por realizar tu pago y por seguir confiando en nosotros!",
        "variables": ["cliente_nombre", "empresa", "total", "factura"],
    },
    "maintenance": {
        "name": "Aviso de mantenimiento",
        "text": "🔧 *Aviso importante, {{cliente_nombre}}*\n\n💙 *{{empresa}}* realizará un mantenimiento de red.\n\n📅 *Fecha:* {{fecha}}\n🕐 *Horario:* {{hora_inicio}} a {{hora_fin}}\n\nDurante este periodo podrías experimentar una interrupción temporal del servicio.\n\n🙏 Agradecemos tu comprensión y paciencia.\n\n💙 *{{empresa}}*",
        "variables": ["cliente_nombre", "empresa", "fecha", "hora_inicio", "hora_fin"],
    },
}


def get_templates(root: dict) -> dict:
    saved = root.get("message_templates") or {}
    result = {}
    for key, default in DEFAULT_TEMPLATES.items():
        current = saved.get(key) or {}
        result[key] = {**default, "text": current.get("text") or default["text"]}
    return result
