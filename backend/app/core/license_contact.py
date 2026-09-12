from __future__ import annotations

"""Consulta los datos comerciales públicos publicados por Web-Licence."""
import asyncio
import json
from urllib import error, request

from app.core.config import ZHUB_LICENSE_SERVER_TIMEOUT, ZHUB_LICENSE_SERVER_URL


def _fetch_contact() -> dict:
    if not ZHUB_LICENSE_SERVER_URL:
        return {}
    endpoint = ZHUB_LICENSE_SERVER_URL.rstrip("/") + "/v1/public/contact"
    req = request.Request(endpoint, headers={"Accept": "application/json"}, method="GET")
    try:
        with request.urlopen(req, timeout=ZHUB_LICENSE_SERVER_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (error.HTTPError, error.URLError, TimeoutError, OSError, ValueError):
        return {}
    if not isinstance(payload, dict):
        return {}
    return {
        "business_name": str(payload.get("business_name") or "").strip(),
        "contact_name": str(payload.get("contact_name") or "").strip(),
        "whatsapp": str(payload.get("whatsapp") or "").strip(),
        "email": str(payload.get("email") or "").strip(),
        "updated_at": str(payload.get("updated_at") or "").strip(),
    }


async def get_commercial_contact() -> dict:
    """Devuelve contacto central; un fallo remoto no impide consultar la licencia."""
    return await asyncio.to_thread(_fetch_contact)
