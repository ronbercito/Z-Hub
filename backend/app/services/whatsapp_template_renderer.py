"""Renderizador común de plantillas WhatsApp compatibles con la sintaxis de WispHub.

Soporta variables {{variable}} y {variable}, marcadores %vip% y formato
WhatsApp con asteriscos. La salida conserva el formato visible y evita
acumulaciones accidentales de líneas vacías producidas por combinar saltos
de línea literales con %vip%.
"""
from __future__ import annotations

import re
from typing import Any

VARIABLE_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")
LEGACY_VARIABLE_PATTERN = re.compile(r"(?<!\{)\{\s*([a-zA-Z0-9_]+)\s*\}(?!\})")


def normalize_template(text: str) -> str:
    """Normaliza espaciado sin romper negritas ni saltos intencionales."""
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = value.replace("%vip%", "\n")
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    # %vip%%vip% representa separación de párrafo; junto con los saltos
    # literales de la plantilla no debe convertirse en tres o más líneas.
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def render_whatsapp_template(template: str, values: dict[str, Any] | None = None) -> str:
    """Renderiza una plantilla con sintaxis WispHub y legado de Z-Hub.

    WispHub usa {{variable}}, pero versiones anteriores de Z-Hub y algunas
    plantillas ya guardadas pueden contener {variable}. Ambas formas se
    resuelven aquí para que editor, prueba manual y worker produzcan el mismo
    texto final sin dejar llaves alrededor de los valores.
    """
    values = values or {}

    def replace_double(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key, "")
        return "" if value is None else str(value)

    def replace_legacy(match: re.Match[str]) -> str:
        key = match.group(1)
        value = values.get(key, "")
        return "" if value is None else str(value)

    rendered = VARIABLE_PATTERN.sub(replace_double, str(template or ""))
    rendered = LEGACY_VARIABLE_PATTERN.sub(replace_legacy, rendered)
    return normalize_template(rendered)


def render_legacy_template(template: str, values: dict[str, Any] | None = None) -> str:
    """Compatibilidad explícita con plantillas antiguas de Z-Hub."""
    return render_whatsapp_template(template, values)
