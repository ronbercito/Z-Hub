"""Z-Hub License Server — Etapa 6/7.

Servicio independiente para desplegar en VPS. Mantiene licencias e instalaciones
autorizadas en SQLite, registra validaciones y emite autorizaciones RS256 que las
instalaciones Self-Hosted pueden cachear durante el período de gracia.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import sqlite3
from typing import Any

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

APP_VERSION = "1.0.0"
DB_PATH = Path(os.environ.get("ZHUB_LICENSE_DB", "/var/lib/zhub-license-server/licenses.db"))
PRIVATE_KEY_FILE = Path(os.environ.get("ZHUB_LICENSE_PRIVATE_KEY_FILE", "/etc/zhub-license-server/private.pem"))
ADMIN_TOKEN = os.environ.get("ZHUB_LICENSE_ADMIN_TOKEN", "").strip()
ISSUER = os.environ.get("ZHUB_LICENSE_SERVER_ISSUER", "zhub-license-server").strip()
AUDIENCE = os.environ.get("ZHUB_LICENSE_SERVER_AUDIENCE", "zhub-installation").strip()
GRACE_HOURS = max(1, int(os.environ.get("ZHUB_LICENSE_GRACE_HOURS", "72")))

app = FastAPI(title="Z-Hub License Server", version=APP_VERSION)


class ValidateIn(BaseModel):
    license_key: str = Field(min_length=4, max_length=160)
    installation_id: str = Field(min_length=8, max_length=160)


class LicenseIn(BaseModel):
    license_key: str = Field(min_length=4, max_length=160)
    name: str = ""
    email: str = ""
    status: str = "ACTIVA"
    type: str = "PAID"
    plan: str = "UNLIMITED"
    max_clients: int | None = None


class InstallationIn(BaseModel):
    installation_id: str = Field(min_length=8, max_length=160)
    status: str = "ACTIVA"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    with _connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS licenses (
                license_key TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'ACTIVA',
                type TEXT NOT NULL DEFAULT 'PAID',
                plan TEXT NOT NULL DEFAULT 'UNLIMITED',
                max_clients INTEGER NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS installations (
                license_key TEXT NOT NULL,
                installation_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'ACTIVA',
                updated_at TEXT NOT NULL,
                PRIMARY KEY (license_key, installation_id),
                FOREIGN KEY (license_key) REFERENCES licenses(license_key)
            );
            CREATE TABLE IF NOT EXISTS validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_key TEXT NOT NULL,
                installation_id TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )


@app.on_event("startup")
def startup() -> None:
    _init_db()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _admin(authorization: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Administración no configurada")
    expected = f"Bearer {ADMIN_TOKEN}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="No autorizado")


def _private_key() -> str:
    try:
        return PRIVATE_KEY_FILE.read_text(encoding="utf-8")
    except OSError as exc:
        raise HTTPException(status_code=503, detail="Clave privada de firma no disponible") from exc


def _log_validation(key: str, installation_id: str, result: str) -> None:
    with _connect() as db:
        db.execute(
            "INSERT INTO validations (license_key, installation_id, result, created_at) VALUES (?, ?, ?, ?)",
            (key, installation_id, result, _now().isoformat()),
        )


def _license_row(key: str) -> sqlite3.Row | None:
    with _connect() as db:
        return db.execute("SELECT * FROM licenses WHERE license_key = ?", (key,)).fetchone()


def _installation_allowed(key: str, installation_id: str) -> bool:
    with _connect() as db:
        row = db.execute(
            "SELECT status FROM installations WHERE license_key = ? AND installation_id = ?",
            (key, installation_id),
        ).fetchone()
    return bool(row and str(row["status"]).upper() == "ACTIVA")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "zhub-license-server", "version": APP_VERSION}


@app.post("/v1/licenses/validate")
def validate_license(payload: ValidateIn) -> dict[str, Any]:
    key = payload.license_key.strip().upper()
    installation_id = payload.installation_id.strip()
    row = _license_row(key)
    if not row:
        _log_validation(key, installation_id, "LICENSE_NOT_FOUND")
        raise HTTPException(status_code=404, detail="Licencia no registrada")
    if str(row["status"]).upper() != "ACTIVA":
        _log_validation(key, installation_id, "LICENSE_BLOCKED")
        raise HTTPException(status_code=403, detail="Licencia inactiva o suspendida")
    if not _installation_allowed(key, installation_id):
        _log_validation(key, installation_id, "INSTALLATION_NOT_AUTHORIZED")
        raise HTTPException(status_code=403, detail="Instalación no autorizada para esta licencia")

    now = _now()
    grace_until = now + timedelta(hours=GRACE_HOURS)
    claims = {
        "iss": ISSUER,
        "aud": AUDIENCE,
        "iat": int(now.timestamp()),
        "exp": int(grace_until.timestamp()),
        "grace_until": grace_until.isoformat(),
        "license_key": key,
        "installation_id": installation_id,
        "status": "ACTIVA",
        "type": str(row["type"]).upper(),
        "plan": str(row["plan"]).upper(),
        "max_clients": row["max_clients"],
        "name": row["name"],
        "email": row["email"],
        "trial_days": 30 if str(row["type"]).upper() == "TRIAL" else None,
    }
    token = jwt.encode(claims, _private_key(), algorithm="RS256")
    _log_validation(key, installation_id, "AUTHORIZED")
    return {"valid": True, "authorization": token, "grace_until": grace_until.isoformat()}


@app.put("/admin/licenses/{license_key}", dependencies=[Depends(_admin)])
def upsert_license(license_key: str, payload: LicenseIn) -> dict[str, Any]:
    key = license_key.strip().upper()
    if key != payload.license_key.strip().upper():
        raise HTTPException(status_code=422, detail="La clave de la ruta y del cuerpo no coinciden")
    status = payload.status.strip().upper()
    license_type = payload.type.strip().upper()
    plan = payload.plan.strip().upper()
    if status not in {"ACTIVA", "INACTIVA", "SUSPENDIDA"}:
        raise HTTPException(status_code=422, detail="Estado no permitido")
    if license_type not in {"PAID", "TRIAL"}:
        raise HTTPException(status_code=422, detail="Tipo no permitido")
    with _connect() as db:
        db.execute(
            """INSERT INTO licenses (license_key,name,email,status,type,plan,max_clients,updated_at)
               VALUES (?,?,?,?,?,?,?,?)
               ON CONFLICT(license_key) DO UPDATE SET
               name=excluded.name,email=excluded.email,status=excluded.status,type=excluded.type,
               plan=excluded.plan,max_clients=excluded.max_clients,updated_at=excluded.updated_at""",
            (key, payload.name.strip(), payload.email.strip().lower(), status, license_type, plan,
             payload.max_clients, _now().isoformat()),
        )
    return {"ok": True, "license_key": key}


@app.put("/admin/licenses/{license_key}/installations/{installation_id}", dependencies=[Depends(_admin)])
def authorize_installation(license_key: str, installation_id: str, payload: InstallationIn) -> dict[str, Any]:
    key = license_key.strip().upper()
    install_id = installation_id.strip()
    if install_id != payload.installation_id.strip():
        raise HTTPException(status_code=422, detail="La instalación de la ruta y del cuerpo no coincide")
    if not _license_row(key):
        raise HTTPException(status_code=404, detail="Licencia no registrada")
    status = payload.status.strip().upper()
    if status not in {"ACTIVA", "INACTIVA", "SUSPENDIDA"}:
        raise HTTPException(status_code=422, detail="Estado no permitido")
    with _connect() as db:
        db.execute(
            """INSERT INTO installations (license_key,installation_id,status,updated_at)
               VALUES (?,?,?,?)
               ON CONFLICT(license_key,installation_id) DO UPDATE SET
               status=excluded.status,updated_at=excluded.updated_at""",
            (key, install_id, status, _now().isoformat()),
        )
    return {"ok": True, "license_key": key, "installation_id": install_id, "status": status}


@app.get("/admin/validations", dependencies=[Depends(_admin)])
def validation_history(limit: int = 100) -> dict[str, Any]:
    size = min(500, max(1, int(limit)))
    with _connect() as db:
        rows = db.execute(
            "SELECT license_key, installation_id, result, created_at FROM validations ORDER BY id DESC LIMIT ?",
            (size,),
        ).fetchall()
    return {"rows": [dict(row) for row in rows]}
