"""Cliente aislado para el gateway WhatsApp de AutomatizadoVIP.

Este módulo no modifica el flujo existente de WhatsApp Web. Expone una capa
pequeña y testeable para enviar uno o varios contactos mediante el contrato V2.
La API Key se recibe desde configuración en tiempo de ejecución y nunca se
incluye en código fuente, logs ni excepciones.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

import httpx


DEFAULT_GATEWAY_URL = "https://api.automatizado.vip/api/whatsapp/send"
DEFAULT_TIMEOUT_SECONDS = 20.0
MAX_MESSAGE_LENGTH = 1000


class WhatsAppGatewayError(RuntimeError):
    """Error controlado al comunicarse con AutomatizadoVIP."""


@dataclass(frozen=True)
class WhatsAppSendResult:
    ok: bool
    status_code: int
    response: Any


def normalize_phone(phone: str, country_code: str = "51") -> str:
    """Normaliza un número para el campo `number` del gateway."""
    digits = "".join(ch for ch in str(phone or "") if ch.isdigit())
    if not digits:
        raise ValueError("El número de WhatsApp está vacío")

    code = "".join(ch for ch in str(country_code or "") if ch.isdigit())
    if code and not digits.startswith(code):
        digits = f"{code}{digits}"
    return digits


def _clean_message(message: str) -> str:
    text = str(message or "").strip()
    if not text:
        raise ValueError("El mensaje de WhatsApp está vacío")
    if len(text) > MAX_MESSAGE_LENGTH:
        raise ValueError(f"El mensaje supera el límite de {MAX_MESSAGE_LENGTH} caracteres")
    return text


def build_payload(contacts: Iterable[dict[str, str]], country_code: str = "51") -> dict[str, list[dict[str, str]]]:
    prepared: list[dict[str, str]] = []
    for item in contacts:
        prepared.append(
            {
                "message": _clean_message(item.get("message", "")),
                "number": normalize_phone(item.get("number", ""), country_code),
            }
        )
    if not prepared:
        raise ValueError("Debe existir al menos un destinatario")
    return {"contact": prepared}


async def send_messages(
    *,
    api_key: str,
    contacts: Iterable[dict[str, str]],
    gateway_url: str = DEFAULT_GATEWAY_URL,
    country_code: str = "51",
    verify: bool = True,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> WhatsAppSendResult:
    """Envía contactos al endpoint V2 de AutomatizadoVIP."""
    key = str(api_key or "").strip()
    if not key:
        raise WhatsAppGatewayError("La API Key de AutomatizadoVIP no está configurada")

    payload = build_payload(contacts, country_code=country_code)
    headers = {
        "Content-Type": "application/json",
        "Api-key": key,
    }
    params = {"verify": "true" if verify else "false"}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(gateway_url, headers=headers, json=payload, params=params)
    except httpx.HTTPError as exc:
        raise WhatsAppGatewayError(f"No fue posible conectar con AutomatizadoVIP: {exc}") from exc

    try:
        response_data: Any = response.json()
    except ValueError:
        response_data = response.text[:2000]

    if response.status_code >= 400:
        raise WhatsAppGatewayError(
            f"AutomatizadoVIP respondió HTTP {response.status_code}: {response_data}"
        )

    return WhatsAppSendResult(ok=True, status_code=response.status_code, response=response_data)
