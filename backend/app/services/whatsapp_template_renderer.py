"""Renderizador común de plantillas WhatsApp compatibles con la sintaxis de WispHub.

Soporta variables {{variable}}, marcadores %vip% y formato WhatsApp con asteriscos.
La salida conserva el texto visible y normaliza únicamente los marcadores de espaciado.
"""
from __future__ import annotations

import re
from typing import Any

VARIABLE_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


def normalize_template(text: str) -> str:
    """Convierte marcadores %vip% en saltos de línea sin eliminar formato WhatsApp."""
    value = str(text or "").replace("%vip%", "\n")
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    return value.strip()


def render_whatsapp_template(template: str, values: dict[str, Any] | None = None) -> str:
    """Renderiza una plantilla con variables WispHub y formato WhatsApp."""
    values = values or {}

    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key, "")
        return "" if value is None else str(value)

    rendered = VARIABLE_PATTERN.sub(replace, str(template or ""))
    return normalize_template(rendered)


def render_legacy_template(template: str, values: dict[str, Any] | None = None) -> str:
    """Compatibilidad con plantillas antiguas de Z-Hub que usan {variable}."""
    values = values or {}
    rendered = str(template or "")
    for key, value in values.items():
        rendered = rendered.replace("{" + key + "}", "" if value is None else str(value))
    return normalize_template(rendered)
