"""
Módulo aislado: lector web de tráfico para OLT VSOL.
No importa ni modifica los lectores existentes de resumen/CLI. Si esta lectura falla,
el resto del panel OLT continúa funcionando normalmente.
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


class OltTrafficError(Exception):
    """La lectura aislada de contadores de tráfico no pudo completarse."""


class _Rows(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_row = self.in_cell = False
        self.parts, self.row, self.rows = [], [], []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.in_row, self.row = True, []
        elif tag in ("td", "th") and self.in_row:
            self.in_cell, self.parts = True, []

    def handle_data(self, data):
        if self.in_cell:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.in_cell:
            value = re.sub(r"\s+", " ", " ".join(self.parts)).strip()
            self.row.append(html.unescape(value))
            self.in_cell, self.parts = False, []
        elif tag == "tr" and self.in_row:
            if self.row:
                self.rows.append(self.row)
            self.in_row, self.row = False, []


def _number(value: str) -> int:
    digits = re.sub(r"[^0-9]", "", str(value or ""))
    return int(digits) if digits else 0


def parse_vsol_traffic(page: str) -> dict[str, Any]:
    if "Traffic Statistics" not in (page or ""):
        raise OltTrafficError("La OLT no devolvió la página de estadísticas de tráfico.")
    parser = _Rows()
    parser.feed(page)
    parser.close()

    ports = []
    for row in parser.rows:
        # Filas de datos: GE1, estado, velocidad, Rx Bytes, ..., Tx Bytes, ...
        if len(row) >= 9 and re.fullmatch(r"(?:GE|XGE)\d+", row[0].strip(), re.I):
            status = row[1].strip().lower()
            ports.append({
                "port": row[0].strip().upper(),
                "status": "up" if status == "up" else "down",
                "speed": row[2].strip(),
                "rx_bytes": _number(row[3]),
                "tx_bytes": _number(row[8]),
            })

    active = [item for item in ports if item["status"] == "up"]
    # Se suma solo puertos activos: evita contar puertos sin cable/contador en cero.
    return {
        "ports": ports,
        "active_ports": [item["port"] for item in active],
        "rx_bytes": sum(item["rx_bytes"] for item in active),
        "tx_bytes": sum(item["tx_bytes"] for item in active),
    }


def _fetch(host: str, username: str, password: str, web_port: int = 443) -> dict[str, Any]:
    if not host or not username:
        raise OltTrafficError("Falta la IP o el usuario web de la OLT.")
    port = int(web_port or 443)
    endpoint = host if port == 443 else f"{host}:{port}"
    base = f"https://{endpoint}"
    login_url, main_url, traffic_url = f"{base}/action/login.html", f"{base}/action/main.html", f"{base}/action/geinfo.html"
    jar = CookieJar()
    opener = build_opener(HTTPCookieProcessor(jar), HTTPSHandler(context=ssl._create_unverified_context()))
    headers = {"Accept": "text/html,application/xhtml+xml", "User-Agent": "MikroHub-OLT-Traffic/1.0"}

    try:
        opener.open(Request(login_url, headers=headers), timeout=TIMEOUT + 3).read()
        payload = urlencode({"user": username, "pass": password or "", "button": "Login", "who": "100"}).encode()
        opener.open(Request(main_url, data=payload, method="POST", headers={**headers, "Content-Type": "application/x-www-form-urlencoded", "Origin": base, "Referer": login_url}), timeout=TIMEOUT + 3).read()
        with opener.open(Request(traffic_url, headers={**headers, "Referer": main_url}), timeout=TIMEOUT + 3) as response:
            return parse_vsol_traffic(response.read().decode("utf-8", errors="replace"))
    except OltTrafficError:
        raise
    except Exception as exc:
        raise OltTrafficError("No se pudo consultar el tráfico web de la OLT.") from exc


async def get_vsol_web_traffic(router: Any) -> dict[str, Any]:
    info = await asyncio.to_thread(
        _fetch,
        str(getattr(router, "ip_address", "") or "").strip(),
        str(getattr(router, "web_username", "") or "").strip(),
        str(getattr(router, "web_password", "") or ""),
        int(getattr(router, "web_port", 443) or 443),
    )
    return {"ok": True, "info": info, "source": "vsol_web_traffic"}
