"""Motor central de licencias para instalaciones locales de Z-Hub.

Etapas 2-5/7:
- mantiene compatibilidad con el registro local actual de licencias;
- normaliza plan, tipo y capacidad;
- calcula consumo de abonados localmente;
- controla Trial de 30 días y su estado de solo lectura al vencer;
- prepara la interfaz que usará el futuro License Server.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
import os
import re
from pathlib import Path
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.setting import DEFAULT_SETTINGS, Setting

# Fallback empaquetado dentro del backend. A diferencia del antiguo
# `<repo>/licencia/licencias.txt`, este archivo no es eliminado por deploy/install.sh
# y por tanto sigue disponible después de cada actualización del servidor.
REPO_LICENSE_FILE = Path(__file__).resolve().parent / "license_fallback.txt"
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

# Compatibilidad temporal con registros históricos creados antes de Etapa 6.
# Solo los estados explícitamente bloqueados deben invalidar una instalación ya
# activada. Estados activos equivalentes se normalizan a ACTIVA; un valor legado
# desconocido no puede tumbar un snapshot pagado ya persistido, pero tampoco
# permite activar una licencia nueva.
ACTIVE_LICENSE_STATUSES = {"ACTIVA", "ACTIVO", "ACTIVE", "VALIDA", "VÁLIDA"}
BLOCKED_LICENSE_STATUSES = {
    "INACTIVA",
    "INACTIVO",
    "INACTIVE",
    "SUSPENDIDA",
    "SUSPENDIDO",
    "SUSPENDED",
    "REVOCADA",
    "REVOCADO",
    "REVOKED",
}


def _normalize_license_status(value: Any) -> str:
    raw = str(value or "ACTIVA").strip().upper()
    if raw in ACTIVE_LICENSE_STATUSES:
        return "ACTIVA"
    if raw in BLOCKED_LICENSE_STATUSES:
        return raw
    return raw or "ACTIVA"


def _is_active_license_status(value: Any) -> bool:
    return _normalize_license_status(value) == "ACTIVA"


def _is_blocked_license_status(value: Any) -> bool:
    return str(value or "").strip().upper() in BLOCKED_LICENSE_STATUSES


def _normalize_max_clients(value: Any, plan: str) -> int | None:
    raw = str(value or "").strip().upper()
    if raw in {"", "NONE", "NULL", "UNLIMITED", "ILIMITADO", "∞"}:
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

    status = _normalize_license_status(current.get("status", "ACTIVA"))
    license_type = current.get("type", "PAID").strip().upper() or "PAID"
    if license_type not in {"PAID", "TRIAL"}:
        license_type = "PAID"

    plan = current.get("plan", "").strip().upper()
    if license_type == "TRIAL":
        plan = plan or "TRIAL"
        max_clients = None
    else:
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


def _parse_license_file(path: Path) -> dict[str, dict[str, Any]]:
    """Parsea un registro de licencias. Un archivo inexistente equivale a vacío."""
    try:
        text = path.read_text(encoding="utf-8")
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


def licenses() -> dict[str, dict[str, Any]]:
    """Combina fallback empaquetado con el registro privado del servidor.

    El registro privado tiene prioridad cuando define la misma clave, por lo que
    un ESTADO=INACTIVA/SUSPENDIDA privado nunca puede ser reactivado por el fallback.
    Si el archivo privado existe pero no contiene una licencia histórica, el
    fallback empaquetado sigue disponible durante la transición a Etapa 6.
    """
    rows = _parse_license_file(REPO_LICENSE_FILE)
    rows.update(_parse_license_file(PRIVATE_LICENSE_FILE))
    return rows


def get_license_row(key: str | None) -> dict[str, Any] | None:
    """Obtiene el registro local aunque esté suspendido/inactivo."""
    normalized = str(key or "").strip().upper()
    if not normalized:
        return None
    return licenses().get(normalized)


def get_license_record(key: str | None) -> dict[str, Any] | None:
    """Obtiene una licencia activa por clave; las suspendidas no validan."""
    row = get_license_row(key)
    if not row or not _is_active_license_status(row.get("status")):
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


def trial_started_at(data: dict[str, Any]) -> datetime | None:
    if not is_trial(data):
        return None
    return _parse_datetime(data.get("license_activated_at"))


def trial_expires_at(data: dict[str, Any]) -> datetime | None:
    started = trial_started_at(data)
    return started + timedelta(days=TRIAL_DAYS) if started else None


def trial_days_remaining(data: dict[str, Any], now: datetime | None = None) -> int | None:
    if not is_trial(data):
        return None
    expires = trial_expires_at(data)
    if not expires:
        return TRIAL_DAYS
    current = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    seconds = (expires - current).total_seconds()
    if seconds <= 0:
        return 0
    return min(TRIAL_DAYS, max(1, math.ceil(seconds / 86400)))


def trial_warning_level(data: dict[str, Any], now: datetime | None = None) -> str | None:
    remaining = trial_days_remaining(data, now=now)
    if remaining is None:
        return None
    if remaining == 0:
        return "expired"
    if remaining <= 1:
        return "critical"
    if remaining <= 3:
        return "urgent"
    if remaining <= 7:
        return "warning"
    return "normal"


def is_trial(data: dict[str, Any]) -> bool:
    return str(data.get("license_type", "")).upper() == "TRIAL"


def _has_persisted_snapshot(data: dict[str, Any]) -> bool:
    """Reconoce instalaciones ya activadas aunque el registro legado cambie."""
    license_type = str(data.get("license_type", "")).upper()
    return bool(data.get("license_key") and license_type in {"PAID", "TRIAL"} and data.get("license_plan"))


def get_status(data: dict[str, Any]) -> str:
    key = str(data.get("license_key") or "").strip().upper()
    if not key:
        return "missing"

    row = get_license_row(key)

    # Una revocación o suspensión explícita del registro privado/local siempre
    # prevalece. Este caso sí invalida incluso un snapshot histórico.
    if row is not None and _is_blocked_license_status(row.get("status")):
        return "invalid"

    if is_trial(data) and trial_days_remaining(data) == 0:
        return "trial_expired"

    # Los estados activos históricos (ACTIVA/ACTIVO/ACTIVE/VÁLIDA) se aceptan.
    if row is not None and _is_active_license_status(row.get("status")):
        return "active"

    # Durante la transición a Etapa 6, un valor de estado legado desconocido no
    # debe convertir en inválida una licencia pagada ya activada y persistida.
    # Sin snapshot previo, el mismo registro desconocido continúa sin validar.
    if _has_persisted_snapshot(data):
        return "active"
    return "invalid"


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
    row = get_license_row(data.get("license_key"))
    record = row if row and _is_active_license_status(row.get("status")) else None
    usage = await get_client_usage(db)
    limit = get_client_limit(data)
    remaining = None if limit is None else max(0, limit - usage)
    status = get_status(data)
    started = trial_started_at(data)
    expires = trial_expires_at(data)
    return {
        "key": data.get("license_key", ""),
        "status": status,
        "type": data.get("license_type") or (record or {}).get("type") or "",
        "plan": data.get("license_plan") or (record or {}).get("plan") or "",
        "max_clients": limit,
        "client_usage": usage,
        "available_clients": remaining,
        "trial_days_remaining": trial_days_remaining(data),
        "trial_started_at": started.isoformat() if started else None,
        "trial_expires_at": expires.isoformat() if expires else None,
        "trial_warning_level": trial_warning_level(data),
        "read_only": status == "trial_expired",
        "owner": (record or {}).get("name", ""),
        "email": (record or {}).get("email", ""),
    }


async def can_create_client(db: AsyncSession) -> bool:
    """Decide si la licencia permite aumentar el número de abonados contabilizados."""
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
