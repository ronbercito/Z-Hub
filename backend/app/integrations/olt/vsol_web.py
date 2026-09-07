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


class _TableRowParser(HTMLParser):
    """Extrae filas de tablas HTML sin depender de librerías externas."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self._in_row = False
        self._in_cell = False
        self._parts: list[str] = []
        self._row: list[str] = []
        self.rows: list[list[str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag == "tr":
            self._in_row = True
            self._row = []
        elif tag in ("td", "th") and self._in_row:
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
            self._row.append(html.unescape(value))
            self._in_cell = False
            self._parts = []
        elif tag == "tr" and self._in_row:
            if self._row:
                self.rows.append(self._row)
            self._in_row = False
            self._row = []


def parse_vsol_basic_information(page: str) -> dict[str, str]:
    """
    Lee exclusivamente las etiquetas conocidas de Device Basic Information.
    La página también contiene iconos PON/GE; por eso no se mezclan sus
    celdas con las métricas del sistema.
    """

    if "Device Basic Information" not in (page or ""):
        raise OltWebError(
            "La OLT no devolvió Device Basic Information; "
            "verifica las credenciales web o la sesión."
        )

    parser = _TableRowParser()
    parser.feed(page)
    parser.close()

    expected = {
        "System Name",
        "Serial Number",
        "Hardware Version",
        "Software Version",
        "MAC Address",
        "Temperature",
        "System Time",
        "Running Time",
        "CPU Usage",
        "Memory Usage",
        "License Limit",
        "License Time",
        "Software Created Time",
        "Device Model",
        "Startup Time",
    }
    info: dict[str, str] = {}

    for row in parser.rows:
        for index, cell in enumerate(row[:-1]):
            key = cell.rstrip(":").strip()
            if key in expected:
                value = row[index + 1].strip()
                if value:
                    info[key] = value

    required = {"CPU Usage", "Memory Usage", "Device Model"}
    if not required.issubset(info):
        raise OltWebError(
            "No se pudieron reconocer las métricas de la tabla web VSOL."
        )

    return info

def _fetch_vsol_basic_information(
    host: str,
    username: str,
    password: str,
    web_port: int = 443,
) -> dict[str, str]:
    """
    VSOL V1600G1-B V1.4.x autentica con POST a /action/main.html.
    La contraseña se usa únicamente en memoria y nunca se registra.
    """

    if not host or not username:
        raise OltWebError("Falta la IP o el usuario web de la OLT.")

    port = int(web_port or 443)
    endpoint = host if port == 443 else f"{host}:{port}"
    base_url = f"https://{endpoint}"
    login_url = f"{base_url}/action/login.html"
    main_url = f"{base_url}/action/main.html"
    system_url = f"{base_url}/action/systeminfo.html"
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
    headers = {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "MikroHub-OLT-Monitor/1.0",
    }

    try:
        # La web VSOL crea/corrige la sesión al abrir login.html. Se realiza
        # primero esta lectura y el CookieJar conserva la sesión para el POST.
        opener.open(Request(login_url, headers=headers), timeout=TIMEOUT + 3).read()

        request = Request(
            main_url,
            data=payload,
            headers={
                **headers,
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": base_url,
                "Referer": login_url,
            },
            method="POST",
        )
        # main.html es solo la estructura del panel. systeminfo.html contiene
        # Device Basic Information y reutiliza la cookie obtenida arriba.
        opener.open(request, timeout=TIMEOUT + 3).read()
        with opener.open(
            Request(
                system_url,
                headers={
                    **headers,
                    "Referer": main_url,
                },
            ),
            timeout=TIMEOUT + 3,
        ) as response:
            page = response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        raise OltWebError(f"No se pudo consultar la web de la OLT: {exc}") from exc

    try:
        return parse_vsol_basic_information(page)
    except OltWebError as exc:
        # No se devuelven el HTML ni credenciales; solo una pista segura.
        title = re.search(r"<title[^>]*>\s*(.*?)\s*</title>", page, re.I | re.S)
        hint = re.sub(r"\s+", " ", title.group(1)).strip() if title else "página no identificada"
        raise OltWebError(
            f"La sesión web fue rechazada o cambió de página ({hint})."
        ) from exc


async def get_vsol_web_basic_information(router: Any) -> dict[str, Any]:
    """Obtiene el resumen web real de una OLT VSOL sin bloquear FastAPI."""

    info = await asyncio.to_thread(
        _fetch_vsol_basic_information,
        str(getattr(router, "ip_address", "") or "").strip(),
        str(getattr(router, "web_username", "") or "").strip(),
        str(getattr(router, "web_password", "") or ""),
        int(getattr(router, "web_port", 443) or 443),
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
