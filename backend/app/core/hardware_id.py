"""Identidad estable del host para el flujo Auto-TRIAL de Z-Hub.

Nunca expone los identificadores crudos al License Server: combina señales locales
estables y devuelve únicamente SHA-256 hexadecimal. La MAC se usa solo si no hay
ninguna señal persistente disponible, para que cambiar una NIC no altere el HW-ID.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
import uuid


IDENTITY_FILES = (
    ("machine_id", Path("/etc/machine-id")),
    ("product_uuid", Path("/sys/class/dmi/id/product_uuid")),
    ("product_serial", Path("/sys/class/dmi/id/product_serial")),
)


def _read_identity(path: Path) -> str:
    try:
        value = path.read_text(encoding="utf-8", errors="ignore").strip().lower()
    except OSError:
        return ""
    if value in {"", "none", "unknown", "not specified", "to be filled by o.e.m."}:
        return ""
    return value


def _mac_identity() -> str:
    node = uuid.getnode()
    return f"{node:012x}" if node else ""


def hardware_identity_components() -> list[str]:
    components: list[str] = []
    for label, path in IDENTITY_FILES:
        value = _read_identity(path)
        if value:
            components.append(f"{label}={value}")
    if components:
        return components
    mac = _mac_identity()
    return [f"mac={mac}"] if mac else []


def hardware_id() -> str:
    """Devuelve un SHA-256 determinista; falla si no hay identidad utilizable."""
    components = hardware_identity_components()
    if not components:
        raise RuntimeError("No se pudo obtener identidad estable del servidor")
    canonical = "\n".join(sorted(components))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
