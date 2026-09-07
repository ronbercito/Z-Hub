"""
Archivo: backend/app/integrations/olt/vsol_web.py
Pertenece a: Red > OLT VSOL > lectura web del resumen.
Función: Inicia sesión en la interfaz web VSOL y obtiene métricas reales
         de Device Basic Information. No ejecuta cambios de configuración.
"""

import asyncio
import html
import re
import ssl
from html.parser import HTMLParser
from http.cookiejar import CookieJar
from typing import Any
from urllib.parse import urlencode
from urllib.request import HTTPSHandler, HTTPCookieProcessor, Request, build_opener

from app.core.config import MIKROTIK_TIMEOUT as TIMEOUT


class OltWebError(Exception):
    """La lectura web de la OLT no pudo completarse."""


class _TableCellParser(HTMLParser):
    """Extrae textos de celdas HTML sin depender de librerías externas."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._in_cell = False
        self._parts: list[str] = []
        self.cells: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag in ("td", "th"):
            self._in_cell = True
            self._parts = []
        elif tag == "input" and self._in_cell:
            value = dict(attrs).get("value", "")
            if value:
                self._parts.append(value)

    def handle_data(self, data: str):
        if self._in_cell:
            self._parts.append(data)

    def handle_endtag(self, tag: str):
        if tag in ("td", "th") and self._in_cell:
            value = re.sub(r"\s+", " ", " ".join(self._parts)).strip()
            self.cells.append(html.unescape(value))
            self._in_cell = False
            self._parts = []


def parse_vsol_basic_information(page: str) -> dict[str, str]:
    """
    Convierte la tabla Device Basic Information de VSOL en pares clave/valor.
    Solo acepta la página autenticada correcta; evita mostrar datos falsos.
    """

    if "Device Basic Information" not in (page or ""):
        raise OltWebError(
            "La OLT no devolvió Device Basic Information; "
            "verifica las credenciales web o la sesión."
        )

    parser = _TableCellParser()
    parser.feed(page)
    parser.close()

    cells = [cell for cell in parser.cells if cell]
    info: dict[str, str] = {}

    # La página VSOL muestra dos pares por fila: etiqueta, valor, etiqueta, valor.
    for index in range(0, len(cells) - 1, 2):
        key = cells[index].rstrip(":").strip()
        value = cells[index + 1].strip()
        if key and value and len(key) <= 80:
            info[key] = value

    required = {"CPU Usage", "Memory Usage", "Device Model"}
    if not required.intersection(info):
        raise OltWebError(
            "No se pudieron reconocer las métricas de la tabla web VSOL."
        )

    return info


def _fetch_vsol_basic_information(
    host: str,
    username: str,
    password: str,
) -> dict[str, str]:
    """
    VSOL V1600G1-B V1.4.x autentica con POST a /action/main.html.
    La contraseña se usa únicamente en memoria y nunca se registra.
    """

    if not host or not username:
        raise OltWebError("Falta la IP o el usuario web de la OLT.")

    url = f"https://{host}/action/main.html"
    payload = urlencode(
        {
            "user": username,
            "pass": password or "",
            "button": "Login",
            "who": "100",
        }
    ).encode("utf-8")

    jar = CookieJar()
    context = ssl._create_unverified_context()
    opener = build_opener(
        HTTPCookieProcessor(jar),
        HTTPSHandler(context=context),
    )
    request = Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml",
            "User-Agent": "MikroHub-OLT-Monitor/1.0",
        },
        method="POST",
    )

    try:
        with opener.open(request, timeout=TIMEOUT + 3) as response:
            page = response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        raise OltWebError(f"No se pudo consultar la web de la OLT: {exc}") from exc

    return parse_vsol_basic_information(page)


async def get_vsol_web_basic_information(router: Any) -> dict[str, Any]:
    """Obtiene el resumen web real de una OLT VSOL sin bloquear FastAPI."""

    info = await asyncio.to_thread(
        _fetch_vsol_basic_information,
        str(getattr(router, "ip_address", "") or "").strip(),
        str(getattr(router, "username", "") or "").strip(),
        str(getattr(router, "password", "") or ""),
    )

    raw = "\n".join(f"{key}: {value}" for key, value in info.items())

    return {
        "ok": True,
        "message": "Resumen web VSOL actualizado",
        "error": "",
        "raw": raw,
        "rows": [],
        "info": info,
        "commands": ["HTTPS POST /action/main.html"],
        "log": ["Lectura web VSOL completada"],
        "source": "vsol_web",
    }
