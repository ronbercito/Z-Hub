"""Motor central de licencias para instalaciones locales de Z-Hub.

Etapa 2/7:
- mantiene compatibilidad con el registro local actual de licencias;
- normaliza plan, tipo y capacidad;
- calcula consumo de abonados localmente;
- prepara la interfaz que usará el futuro License Server.

La Etapa 3 será responsable de aplicar el bloqueo efectivo al alta de abonados.
"""
from __future__ import annotations

from datetime import datetime, timezone
import os
import re
from pathlib import Path
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.setting import DEFAULT_SETTINGS, Setting

REPO_LICENSE_FILE = Path(__file__).resolve().parents[3] / "licencia" / "licencias.txt"
PRIVATE_LICENSE_FILE = Path(os.environ.get("ZHUB_LICENSE_FILE", "/etc/zhub/licencia/licencias.txt"))

PLAN_LIMITS: dict[str, int | None] = {
    "PLAN_100": 100,
    "PLAN_200": 200,
    "PLAN_800": 800,
    "PLAN_1000": 1000,
    "UNLIMITED": None,
}
TRIAL_DAYS = 30

# Regla comercial acordada: todo abonado registrado consume cupo mientras no
# exista una baja definitiva. En el modelo actual `retired` representa esa baja.
NON_COUNTING_CLIENT_STATUSES = {"retired"}


def _license_file() -> Path:
    """Prioriza el registro privado del servidor y conserva fallback legado."""
    if PRIVATE_LICENSE_FILE.is_file():
        return PRIVATE_LICENSE_FILE
    return REPO_LICENSE_FILE


def _normalize_max_clients(value: Any, plan: str) -> int | None:
    raw = str(value or "").strip().upper()
    if raw in {"", "NONE", "NULL", "UNLIMITED", "ILIMITADO", "∞"}:
        # Una licencia antigua sin PLAN/MAX_CLIENTS se conserva ilimitada para no
        # reducir capacidad de instalaciones existentes durante la migración.
        return PLAN_LIMITS.get(plan) if plan in PLAN_LIMITS else None
    try:
        parsed = int(raw)
        return max(0, parsed)
    except (TypeError, ValueError):
        return PLAN_LIMITS.get(plan) if plan in PLAN_LIMITS else None


def _normalize_license(current: dict[str, str]) -> dict[str, Any] | None:
    key = current.get("key", "").strip().upper()
    if not key:
        return None

    status = current.get("status", "ACTIVA").strip().upper()
    license_type = current.get("type", "PAID").strip().upper() or "PAID"
    if license_type not in {"PAID", "TRIAL"}:
        license_type = "PAID"

    plan = current.get("plan", "").strip().upper()
    if license_type == "TRIAL":
        plan = plan or "TRIAL"
        max_clients = None
    else:
        # Licencias históricas sin campos nuevos equivalen a ilimitadas.
        plan = plan or "UNLIMITED"
        max_clients = _normalize_max_clients(current.get("max_clients"), plan)

    return {
        "key": key,
        "name": current.get("name", "").strip(),
        "email": current.get("email", "").strip().lower(),
        "status": status,
        "type": license_type,
        "plan": plan,
        "max_clients": max_clients,
        "trial_days": TRIAL_DAYS if license_type == "TRIAL" else None,
    }


def licenses() -> dict[str, dict[str, Any]]:
    """Lee y normaliza el registro local sin exponerlo por API."""
    try:
        text = _license_file().read_text(encoding="utf-8")
    except OSError:
        return {}

    rows: dict[str, dict[str, Any]] = {}
    current: dict[str, str] = {}
    fields = {
        "LICENCIA": "key",
        "NOMBRE": "name",
        "CORREO": "email",
        "ESTADO": "status",
        "TIPO": "type",
        "PLAN": "plan",
        "MAX_CLIENTS": "max_clients",
        "LIMITE_CLIENTES": "max_clients",
    }

    def flush() -> None:
        row = _normalize_license(current)
        if row:
            rows[row["key"]] = row

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.match(
            r"^(LICENCIA|NOMBRE|CORREO|ESTADO|TIPO|PLAN|MAX_CLIENTS|LIMITE_CLIENTES)\s*:\s*(.*?)\s*$",
            line,
            re.IGNORECASE,
        )
        if not match:
            continue
        field, value = match.groups()
        field = field.upper()
        if field == "LICENCIA" and current.get("key"):
            flush()
            current = {}
        current[fields[field]] = value
    flush()
    return rows


def get_license_record(key: str | None) -> dict[str, Any] | None:
    """Obtiene una licencia activa por clave; las suspendidas no validan."""
    normalized = str(key or "").strip().upper()
    if not normalized:
        return None
    row = licenses().get(normalized)
    if not row or row.get("status") != "ACTIVA":
        return None
    return row


async def get_setting_data(db: AsyncSession) -> tuple[Setting, dict[str, Any]]:
    setting = await db.get(Setting, "system_config")
    if not setting:
        setting = Setting(id="system_config", data=dict(DEFAULT_SETTINGS))
        db.add(setting)
        await db.flush()
    data = dict(DEFAULT_SETTINGS)
    if setting.data:
        data.update(setting.data)
    return setting, data


def _parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def trial_days_remaining(data: dict[str, Any], now: datetime | None = None) -> int | None:
    if str(data.get("license_type", "")).upper() != "TRIAL":
        return None
    started = _parse_datetime(data.get("license_activated_at"))
    if not started:
        return TRIAL_DAYS
    current = now or datetime.now(timezone.utc)
    elapsed_days = max(0, (current.astimezone(timezone.utc) - started).days)
    return max(0, TRIAL_DAYS - elapsed_days)


def is_trial(data: dict[str, Any]) -> bool:
    return str(data.get("license_type", "")).upper() == "TRIAL"


def get_status(data: dict[str, Any]) -> str:
    if not data.get("license_key"):
        return "missing"
    if not get_license_record(data.get("license_key")):
        return "invalid"
    if is_trial(data) and trial_days_remaining(data) == 0:
        return "trial_expired"
    return "active"


def get_client_limit(data: dict[str, Any]) -> int | None:
    if is_trial(data):
        return None
    value = data.get("license_max_clients")
    if value in (None, "", "unlimited", "UNLIMITED"):
        return None
    try:
        return max(0, int(value))
    except (TypeError, ValueError):
        return None


async def get_client_usage(db: AsyncSession) -> int:
    """Cuenta clientes registrados salvo baja definitiva (`retired`)."""
    query = select(func.count(Client.id)).where(Client.status.notin_(NON_COUNTING_CLIENT_STATUSES))
    return int((await db.scalar(query)) or 0)


async def get_license(db: AsyncSession) -> dict[str, Any]:
    """Vista normalizada del estado de licencia de la instalación."""
    _, data = await get_setting_data(db)
    record = get_license_record(data.get("license_key"))
    usage = await get_client_usage(db)
    limit = get_client_limit(data)
    remaining = None if limit is None else max(0, limit - usage)
    return {
        "key": data.get("license_key", ""),
        "status": get_status(data),
        "type": data.get("license_type") or (record or {}).get("type") or "",
        "plan": data.get("license_plan") or (record or {}).get("plan") or "",
        "max_clients": limit,
        "client_usage": usage,
        "available_clients": remaining,
        "trial_days_remaining": trial_days_remaining(data),
        "owner": (record or {}).get("name", ""),
        "email": (record or {}).get("email", ""),
    }


async def can_create_client(db: AsyncSession) -> bool:
    """Prepara la decisión de capacidad; la Etapa 3 la aplicará al endpoint de alta."""
    _, data = await get_setting_data(db)
    if get_status(data) != "active":
        return False
    if is_trial(data):
        return True
    limit = get_client_limit(data)
    if limit is None:
        return True
    return await get_client_usage(db) < limit


def apply_license_metadata(data: dict[str, Any], record: dict[str, Any], *, now: datetime | None = None) -> dict[str, Any]:
    """Guarda un snapshot compatible con el futuro License Server."""
    result = dict(data)
    result["license_key"] = record["key"]
    result["license_type"] = record["type"]
    result["license_plan"] = record["plan"]
    result["license_max_clients"] = record["max_clients"]
    if record["type"] == "TRIAL" and not result.get("license_activated_at"):
        current = now or datetime.now(timezone.utc)
        result["license_activated_at"] = current.astimezone(timezone.utc).isoformat()
    elif record["type"] != "TRIAL":
        result["license_activated_at"] = ""
    return result
