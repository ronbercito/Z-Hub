"""Cliente del License Server de Z-Hub — Etapa 6/7.

La instalación local consulta una API HTTPS privada. El servidor responde con una
autorización JWT RS256 firmada. Si el VPS está temporalmente inaccesible, Z-Hub
puede reutilizar la última autorización firmada hasta que termine su período de
gracia. Un rechazo explícito del servidor nunca se sustituye por caché.
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any
from urllib import error, request

import jwt

from app.core.config import (
    ZHUB_LICENSE_CACHE_FILE,
    ZHUB_LICENSE_SERVER_AUDIENCE,
    ZHUB_LICENSE_SERVER_ISSUER,
    ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE,
    ZHUB_LICENSE_SERVER_TIMEOUT,
    ZHUB_LICENSE_SERVER_URL,
)


class LicenseServerRejected(Exception):
    """El License Server respondió y rechazó explícitamente la licencia."""


class LicenseServerUnavailable(Exception):
    """El License Server no pudo consultarse temporalmente."""


def remote_enabled() -> bool:
    return bool(ZHUB_LICENSE_SERVER_URL and ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE)


def _public_key() -> str:
    if not ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE:
        raise LicenseServerUnavailable("No se configuró la clave pública del License Server")
    try:
        return Path(ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE).read_text(encoding="utf-8")
    except OSError as exc:
        raise LicenseServerUnavailable("No se puede leer la clave pública del License Server") from exc


def _decode_authorization(token: str, *, license_key: str, installation_id: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            _public_key(),
            algorithms=["RS256"],
            audience=ZHUB_LICENSE_SERVER_AUDIENCE,
            issuer=ZHUB_LICENSE_SERVER_ISSUER,
            options={"require": ["exp", "iat", "license_key", "installation_id", "status"]},
        )
    except jwt.PyJWTError as exc:
        raise LicenseServerUnavailable("La autorización firmada del License Server no es válida") from exc

    if str(payload.get("license_key", "")).strip().upper() != license_key.strip().upper():
        raise LicenseServerUnavailable("La autorización firmada pertenece a otra licencia")
    if str(payload.get("installation_id", "")).strip() != installation_id.strip():
        raise LicenseServerUnavailable("La autorización firmada pertenece a otra instalación")
    return payload


def _payload_to_record(payload: dict[str, Any]) -> dict[str, Any] | None:
    status = str(payload.get("status", "")).strip().upper()
    if status != "ACTIVA":
        return None
    license_type = str(payload.get("type", "PAID")).strip().upper() or "PAID"
    plan = str(payload.get("plan", "UNLIMITED")).strip().upper() or "UNLIMITED"
    max_clients = payload.get("max_clients")
    if max_clients not in (None, ""):
        try:
            max_clients = max(0, int(max_clients))
        except (TypeError, ValueError):
            max_clients = None
    else:
        max_clients = None
    return {
        "key": str(payload.get("license_key", "")).strip().upper(),
        "name": str(payload.get("name", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "status": "ACTIVA",
        "type": license_type,
        "plan": plan,
        "max_clients": max_clients,
        "trial_days": payload.get("trial_days"),
    }


def _write_cache(token: str) -> None:
    path = Path(ZHUB_LICENSE_CACHE_FILE)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(token.strip() + "\n", encoding="utf-8")
        path.chmod(0o600)
    except OSError:
        # La validación en línea no debe fallar solo porque no pudo persistirse caché.
        pass


def _read_cache() -> str:
    try:
        return Path(ZHUB_LICENSE_CACHE_FILE).read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def _request_authorization(license_key: str, installation_id: str) -> str:
    endpoint = ZHUB_LICENSE_SERVER_URL.rstrip("/") + "/v1/licenses/validate"
    body = json.dumps({"license_key": license_key, "installation_id": installation_id}).encode("utf-8")
    req = request.Request(endpoint, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=ZHUB_LICENSE_SERVER_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        if 400 <= exc.code < 500:
            try:
                detail = json.loads(exc.read().decode("utf-8")).get("detail")
            except Exception:
                detail = None
            raise LicenseServerRejected(str(detail or "Licencia rechazada por el License Server")) from exc
        raise LicenseServerUnavailable(f"License Server respondió HTTP {exc.code}") from exc
    except (error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise LicenseServerUnavailable("License Server temporalmente inaccesible") from exc

    token = str(payload.get("authorization", "")).strip()
    if not token:
        raise LicenseServerUnavailable("License Server no devolvió una autorización firmada")
    return token


async def resolve_remote_license(license_key: str, installation_id: str) -> tuple[dict[str, Any] | None, dict[str, Any]]:
    """Valida remotamente y aplica caché firmada únicamente ante indisponibilidad."""
    key = str(license_key or "").strip().upper()
    install_id = str(installation_id or "").strip()
    if not remote_enabled() or not key or not install_id:
        return None, {"source": "local", "remote_enabled": remote_enabled(), "server_online": None}

    try:
        token = await asyncio.to_thread(_request_authorization, key, install_id)
        payload = _decode_authorization(token, license_key=key, installation_id=install_id)
        _write_cache(token)
        return _payload_to_record(payload), {
            "source": "remote",
            "remote_enabled": True,
            "server_online": True,
            "grace_until": payload.get("grace_until"),
            "authorization_expires_at": payload.get("exp"),
        }
    except LicenseServerRejected:
        # Rechazo explícito: no se usa una autorización anterior.
        raise
    except LicenseServerUnavailable as online_error:
        cached = _read_cache()
        if not cached:
            raise online_error
        try:
            payload = _decode_authorization(cached, license_key=key, installation_id=install_id)
        except LicenseServerUnavailable:
            raise online_error
        return _payload_to_record(payload), {
            "source": "cache",
            "remote_enabled": True,
            "server_online": False,
            "grace_until": payload.get("grace_until"),
            "authorization_expires_at": payload.get("exp"),
        }
