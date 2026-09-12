"""Cliente de activación automática de TRIAL contra Web-Licence.

La UI todavía no lo invoca en Etapa 3/7; el wizard se conectará en Etapa 4/7.
"""
from __future__ import annotations

import asyncio
import json
from urllib import error, request

from app.core.config import ZHUB_LICENSE_SERVER_TIMEOUT, ZHUB_LICENSE_SERVER_URL
from app.core.hardware_id import hardware_id


class AutoTrialRejected(Exception):
    pass


class AutoTrialUnavailable(Exception):
    pass


def _activate(email: str, installation_id: str, installation_name: str) -> dict:
    if not ZHUB_LICENSE_SERVER_URL:
        raise AutoTrialUnavailable("License Server no configurado")
    endpoint = ZHUB_LICENSE_SERVER_URL.rstrip("/") + "/v1/public/trials/activate"
    body = json.dumps({
        "email": str(email or "").strip().lower(),
        "hardware_id": hardware_id(),
        "installation_id": str(installation_id or "").strip(),
        "installation_name": str(installation_name or "Z-Hub").strip() or "Z-Hub",
    }).encode("utf-8")
    req = request.Request(endpoint, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=ZHUB_LICENSE_SERVER_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        try:
            detail = json.loads(exc.read().decode("utf-8")).get("detail")
        except Exception:
            detail = None
        if 400 <= exc.code < 500:
            raise AutoTrialRejected(str(detail or "Auto-TRIAL rechazado por Web-Licence")) from exc
        raise AutoTrialUnavailable(f"Web-Licence respondió HTTP {exc.code}") from exc
    except (error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise AutoTrialUnavailable("Web-Licence temporalmente inaccesible") from exc

    key = str(payload.get("license_key") or "").strip().upper()
    if not key:
        raise AutoTrialUnavailable("Web-Licence no devolvió la licencia vinculada")
    return payload


async def activate_auto_trial(email: str, installation_id: str, installation_name: str = "Z-Hub") -> dict:
    """Activa o recupera el mismo TRIAL para el HW-ID local."""
    return await asyncio.to_thread(_activate, email, installation_id, installation_name)
