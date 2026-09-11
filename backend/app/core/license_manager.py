"""Motor central de licencias para instalaciones locales de Z-Hub.

Etapas 2-6/7:
- mantiene compatibilidad temporal con el registro local privado;
- normaliza plan, tipo y capacidad;
- calcula consumo de abonados localmente;
- controla Trial de 30 días;
- consulta el License Server remoto cuando está configurado;
- conserva continuidad mediante autorización firmada/caché durante caídas temporales.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
import os
import re
import uuid
from pathlib import Path
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.license_remote import (
    LicenseServerRejected,
    LicenseServerUnavailable,
    remote_enabled,
    resolve_remote_license,
)
from app.models.client import Client
from app.models.setting import DEFAULT_SETTINGS, Setting

PRIVATE_LICENSE_FILE = Path(os.environ.get("ZHUB_LICENSE_FILE", "/etc/zhub/licencia/licencias.txt"))

PLAN_LIMITS: dict[str, int | None] = {
    "PLAN_100": 100,
    "PLAN_200": 200,
    "PLAN_800": 800,
    "PLAN_1000": 1000,
    "UNLIMITED": None,
}
TRIAL_DAYS = 30
TRIAL_MAX_CLIENTS = 20
NON_COUNTING_CLIENT_STATUSES = {"retired"}

ACTIVE_LICENSE_STATUSES = {"ACTIVA", "ACTIVO", "ACTIVE", "VALIDA", "VÁLIDA"}
BLOCKED_LICENSE_STATUSES = {
    "INACTIVA", "INACTIVO", "INACTIVE",
    "SUSPENDIDA", "SUSPENDIDO", "SUSPENDED",
    "REVOCADA", "REVOCADO", "REVOKED",
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
        return max(0, int(raw))
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
        max_clients = TRIAL_MAX_CLIENTS
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
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return {}
    rows: dict[str, dict[str, Any]] = {}
    current: dict[str, str] = {}
    fields = {
        "LICENCIA": "key", "NOMBRE": "name", "CORREO": "email",
        "ESTADO": "status", "TIPO": "type", "PLAN": "plan",
        "MAX_CLIENTS": "max_clients", "LIMITE_CLIENTES": "max_clients",
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
    """Registro local privado. El catálogo demo empaquetado ya no autoriza producción."""
    return _parse_license_file(PRIVATE_LICENSE_FILE)


def get_license_row(key: str | None) -> dict[str, Any] | None:
    normalized = str(key or "").strip().upper()
    if not normalized:
        return None
    return licenses().get(normalized)


def get_license_record(key: str | None) -> dict[str, Any] | None:
    """Compatibilidad local. Nuevas rutas deben preferir resolve_license_record()."""
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


async def _ensure_installation_id(db: AsyncSession, setting: Setting, data: dict[str, Any]) -> str:
    installation_id = str(data.get("license_installation_id") or "").strip()
    if installation_id:
        return installation_id
    installation_id = str(uuid.uuid4())
    data["license_installation_id"] = installation_id
    setting.data = dict(data)
    await db.commit()
    return installation_id


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


def get_status(data: dict[str, Any]) -> str:
    key = str(data.get("license_key") or "").strip().upper()
    if not key:
        return "missing"
    row = get_license_row(key)
    if row is not None and _is_blocked_license_status(row.get("status")):
        return "invalid"
    if is_trial(data) and trial_days_remaining(data) == 0:
        return "trial_expired"
    if row is not None and _is_active_license_status(row.get("status")):
        return "active"
    # Un snapshot guardado en la BD describe la última licencia conocida, pero
    # no constituye una autorización. Sin registro local válido, autorización
    # remota o caché firmada, la instalación debe pedir una nueva licencia.
    return "invalid"


def get_client_limit(data: dict[str, Any]) -> int | None:
    if is_trial(data):
        return TRIAL_MAX_CLIENTS
    value = data.get("license_max_clients")
    if value in (None, "", "unlimited", "UNLIMITED"):
        return None
    try:
        return max(0, int(value))
    except (TypeError, ValueError):
        return None


async def get_client_usage(db: AsyncSession) -> int:
    query = select(func.count(Client.id)).where(Client.status.notin_(NON_COUNTING_CLIENT_STATUSES))
    return int((await db.scalar(query)) or 0)


def apply_license_metadata(data: dict[str, Any], record: dict[str, Any], *, now: datetime | None = None) -> dict[str, Any]:
    result = dict(data)
    result["license_key"] = record["key"]
    result["license_type"] = record["type"]
    result["license_plan"] = record["plan"]
    result["license_max_clients"] = TRIAL_MAX_CLIENTS if record["type"] == "TRIAL" else record["max_clients"]
    if record["type"] == "TRIAL" and not result.get("license_activated_at"):
        current = now or datetime.now(timezone.utc)
        result["license_activated_at"] = current.astimezone(timezone.utc).isoformat()
    elif record["type"] != "TRIAL":
        result["license_activated_at"] = ""
    return result


async def resolve_license_record(db: AsyncSession, key: str | None) -> tuple[dict[str, Any] | None, dict[str, Any]]:
    normalized = str(key or "").strip().upper()
    if not normalized:
        return None, {"source": "local", "remote_enabled": remote_enabled(), "server_online": None}
    setting, data = await get_setting_data(db)
    installation_id = await _ensure_installation_id(db, setting, data)
    if remote_enabled():
        try:
            return await resolve_remote_license(normalized, installation_id)
        except LicenseServerRejected as exc:
            return None, {"source": "remote", "remote_enabled": True, "server_online": True, "rejected": True, "message": str(exc)}
        except LicenseServerUnavailable as exc:
            return get_license_record(normalized), {"source": "local-transition", "remote_enabled": True, "server_online": False, "message": str(exc)}
    return get_license_record(normalized), {"source": "local", "remote_enabled": False, "server_online": None}


async def get_license(db: AsyncSession) -> dict[str, Any]:
    setting, data = await get_setting_data(db)
    installation_id = await _ensure_installation_id(db, setting, data)
    key = str(data.get("license_key") or "").strip().upper()
    validation_meta: dict[str, Any] = {"source": "local", "remote_enabled": remote_enabled(), "server_online": None}
    record: dict[str, Any] | None = None
    remote_rejected = False

    if key and remote_enabled():
        try:
            record, validation_meta = await resolve_remote_license(key, installation_id)
            if record:
                updated = apply_license_metadata(data, record)
                updated["license_installation_id"] = installation_id
                if updated != data:
                    setting.data = updated
                    await db.commit()
                    data = updated
        except LicenseServerRejected as exc:
            remote_rejected = True
            validation_meta = {"source": "remote", "remote_enabled": True, "server_online": True, "rejected": True, "message": str(exc)}
        except LicenseServerUnavailable as exc:
            record = get_license_record(key)
            validation_meta = {"source": "local-transition", "remote_enabled": True, "server_online": False, "message": str(exc)}
    elif key:
        record = get_license_record(key)

    if remote_rejected:
        status = "invalid"
    elif record is not None:
        status = "trial_expired" if is_trial(data) and trial_days_remaining(data) == 0 else "active"
    else:
        status = get_status(data)

    usage = await get_client_usage(db)
    limit = get_client_limit(data)
    remaining = None if limit is None else max(0, limit - usage)
    started = trial_started_at(data)
    expires = trial_expires_at(data)
    active_record = record if record and _is_active_license_status(record.get("status")) else None

    return {
        "key": data.get("license_key", ""),
        "status": status,
        "type": data.get("license_type") or (active_record or {}).get("type") or "",
        "plan": data.get("license_plan") or (active_record or {}).get("plan") or "",
        "max_clients": limit,
        "client_usage": usage,
        "available_clients": remaining,
        "trial_days_remaining": trial_days_remaining(data),
        "trial_started_at": started.isoformat() if started else None,
        "trial_expires_at": expires.isoformat() if expires else None,
        "trial_warning_level": trial_warning_level(data),
        "read_only": status in {"invalid", "missing", "trial_expired"},
        "owner": (active_record or {}).get("name", ""),
        "email": (active_record or {}).get("email", ""),
        "installation_id": installation_id,
        "validation_source": validation_meta.get("source"),
        "license_server_enabled": bool(validation_meta.get("remote_enabled")),
        "license_server_online": validation_meta.get("server_online"),
        "grace_until": validation_meta.get("grace_until"),
    }


async def can_create_client(db: AsyncSession) -> bool:
    info = await get_license(db)
    if info.get("status") != "active":
        return False
    limit = info.get("max_clients")
    if limit is None:
        return True
    return int(info.get("client_usage") or 0) < int(limit)
