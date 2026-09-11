"""Z-Hub License Server — Etapa 6/7 + License Center web.

Servicio independiente para desplegar en VPS. Mantiene clientes/ISP, licencias e
instalaciones autorizadas en SQLite, registra validaciones y emite autorizaciones
RS256 que las instalaciones Self-Hosted pueden cachear durante el período de gracia.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import secrets
import sqlite3
from typing import Any

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

APP_VERSION = "1.3.0"
BASE_DIR = Path(__file__).resolve().parents[1]
STATIC_DIR = BASE_DIR / "static"
DB_PATH = Path(os.environ.get("ZHUB_LICENSE_DB", "/var/lib/zhub-license-server/licenses.db"))
PRIVATE_KEY_FILE = Path(os.environ.get("ZHUB_LICENSE_PRIVATE_KEY_FILE", "/etc/zhub-license-server/private.pem"))
ADMIN_TOKEN = os.environ.get("ZHUB_LICENSE_ADMIN_TOKEN", "").strip()
ISSUER = os.environ.get("ZHUB_LICENSE_SERVER_ISSUER", "zhub-license-server").strip()
AUDIENCE = os.environ.get("ZHUB_LICENSE_SERVER_AUDIENCE", "zhub-installation").strip()
GRACE_HOURS = max(1, int(os.environ.get("ZHUB_LICENSE_GRACE_HOURS", "72")))
TRIAL_DAYS = max(1, int(os.environ.get("ZHUB_LICENSE_TRIAL_DAYS", "30")))
TRIAL_MAX_CLIENTS = 20
PLAN_LIMITS: dict[str, int | None] = {
    "PLAN_100": 100,
    "PLAN_300": 300,
    "PLAN_500": 500,
    "PLAN_1000": 1000,
    "ILIMITADO": None,
}

app = FastAPI(title="Z-Hub License Server", version=APP_VERSION)
if STATIC_DIR.exists():
    app.mount("/admin-static", StaticFiles(directory=STATIC_DIR), name="admin-static")


class ValidateIn(BaseModel):
    license_key: str = Field(min_length=4, max_length=160)
    installation_id: str = Field(min_length=8, max_length=160)


class CustomerIn(BaseModel):
    company_name: str = Field(min_length=2, max_length=180)
    contact_name: str = ""
    email: str = ""
    phone: str = ""
    tax_id: str = ""
    status: str = "ACTIVA"


class LicenseIn(BaseModel):
    license_key: str = Field(min_length=4, max_length=160)
    customer_id: int | None = None
    name: str = ""
    email: str = ""
    status: str = "ACTIVA"
    type: str = "PAID"
    plan: str = "PLAN_100"
    max_clients: int | None = None


class InstallationIn(BaseModel):
    installation_id: str = Field(min_length=8, max_length=160)
    installation_name: str = ""
    status: str = "ACTIVA"


class TrialRenewIn(BaseModel):
    days: int = Field(default=TRIAL_DAYS, ge=1, le=365)


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def _columns(db: sqlite3.Connection, table: str) -> set[str]:
    return {str(row["name"]) for row in db.execute(f"PRAGMA table_info({table})").fetchall()}


def _ensure_column(db: sqlite3.Connection, table: str, column: str, definition: str) -> None:
    if column not in _columns(db, table):
        db.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")


def _init_db() -> None:
    with _connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                contact_name TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                tax_id TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'ACTIVA',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS licenses (
                license_key TEXT PRIMARY KEY,
                customer_id INTEGER NULL,
                name TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'ACTIVA',
                type TEXT NOT NULL DEFAULT 'PAID',
                plan TEXT NOT NULL DEFAULT 'PLAN_100',
                max_clients INTEGER NULL,
                expires_at TEXT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
            );
            CREATE TABLE IF NOT EXISTS installations (
                license_key TEXT NOT NULL,
                installation_id TEXT NOT NULL,
                installation_name TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'ACTIVA',
                updated_at TEXT NOT NULL,
                PRIMARY KEY (license_key, installation_id),
                FOREIGN KEY (license_key) REFERENCES licenses(license_key) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_key TEXT NOT NULL,
                installation_id TEXT NOT NULL,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_validations_created_at ON validations(created_at);
            CREATE INDEX IF NOT EXISTS idx_installations_license ON installations(license_key);
            """
        )
        _ensure_column(db, "licenses", "customer_id", "INTEGER NULL")
        _ensure_column(db, "licenses", "expires_at", "TEXT NULL")
        _ensure_column(db, "installations", "installation_name", "TEXT NOT NULL DEFAULT ''")


@app.on_event("startup")
def startup() -> None:
    _init_db()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _admin(authorization: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Administración no configurada")
    if authorization != f"Bearer {ADMIN_TOKEN}":
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


def _normalize_status(value: str) -> str:
    status = str(value or "").strip().upper()
    if status not in {"ACTIVA", "INACTIVA", "SUSPENDIDA"}:
        raise HTTPException(status_code=422, detail="Estado no permitido")
    return status


def _normalize_license_status(value: str) -> str:
    status = str(value or "").strip().upper()
    if status not in {"ACTIVA", "SUSPENDIDA", "REVOCADA"}:
        raise HTTPException(status_code=422, detail="Estado de licencia no permitido")
    return status


def _normalize_plan(value: str) -> tuple[str, int | None]:
    plan = str(value or "").strip().upper()
    aliases = {"UNLIMITED": "ILIMITADO"}
    plan = aliases.get(plan, plan)
    if plan not in PLAN_LIMITS:
        raise HTTPException(status_code=422, detail="Plan no permitido")
    return plan, PLAN_LIMITS[plan]


def _trial_expired(row: sqlite3.Row) -> bool:
    if str(row["type"]).upper() != "TRIAL" or not row["expires_at"]:
        return False
    try:
        return datetime.fromisoformat(str(row["expires_at"])) <= _now()
    except ValueError:
        return True


def _generate_license_key() -> str:
    year = _now().year
    with _connect() as db:
        for _ in range(64):
            key = f"ZHUB-{year}-{secrets.token_hex(24).upper()}"
            if not db.execute("SELECT 1 FROM licenses WHERE license_key=?", (key,)).fetchone():
                return key
    raise HTTPException(status_code=503, detail="No se pudo generar una clave única")


@app.get("/")
def root() -> dict[str, Any]:
    return {"ok": True, "service": "zhub-license-server", "version": APP_VERSION, "admin": "/admin-ui"}


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "zhub-license-server", "version": APP_VERSION}


@app.get("/admin-ui", include_in_schema=False)
def admin_ui():
    index = STATIC_DIR / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="Interfaz administrativa no instalada")
    return FileResponse(index)


@app.post("/v1/licenses/validate")
def validate_license(payload: ValidateIn) -> dict[str, Any]:
    key = payload.license_key.strip().upper()
    installation_id = payload.installation_id.strip()
    row = _license_row(key)
    if not row:
        _log_validation(key, installation_id, "LICENSE_NOT_FOUND")
        raise HTTPException(status_code=404, detail="Licencia no registrada")
    if _trial_expired(row):
        _log_validation(key, installation_id, "TRIAL_EXPIRED")
        raise HTTPException(status_code=403, detail="Licencia TRIAL vencida")
    if str(row["status"]).upper() != "ACTIVA":
        _log_validation(key, installation_id, "LICENSE_BLOCKED")
        raise HTTPException(status_code=403, detail="Licencia suspendida o revocada")
    if not _installation_allowed(key, installation_id):
        _log_validation(key, installation_id, "INSTALLATION_NOT_AUTHORIZED")
        raise HTTPException(status_code=403, detail="Instalación no autorizada para esta licencia")

    now = _now()
    grace_until = now + timedelta(hours=GRACE_HOURS)
    if row["expires_at"]:
        try:
            trial_end = datetime.fromisoformat(str(row["expires_at"]))
            if trial_end < grace_until:
                grace_until = trial_end
        except ValueError:
            pass
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
        "expires_at": row["expires_at"],
        "trial_days": TRIAL_DAYS if str(row["type"]).upper() == "TRIAL" else None,
    }
    token = jwt.encode(claims, _private_key(), algorithm="RS256")
    _log_validation(key, installation_id, "AUTHORIZED")
    return {
        "valid": True,
        "authorization": token,
        "grace_until": grace_until.isoformat(),
        "plan": claims["plan"],
        "max_clients": claims["max_clients"],
        "type": claims["type"],
        "status": claims["status"],
        "expires_at": claims["expires_at"],
    }


@app.get("/admin/dashboard", dependencies=[Depends(_admin)])
def admin_dashboard() -> dict[str, Any]:
    since = (_now() - timedelta(hours=24)).isoformat()
    next_7d = (_now() + timedelta(days=7)).isoformat()
    now = _now().isoformat()
    with _connect() as db:
        customers = db.execute("SELECT COUNT(*) AS n FROM customers").fetchone()["n"]
        active_licenses = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA'").fetchone()["n"]
        active_installations = db.execute("SELECT COUNT(*) AS n FROM installations WHERE status='ACTIVA'").fetchone()["n"]
        validations_24h = db.execute("SELECT COUNT(*) AS n FROM validations WHERE created_at >= ?", (since,)).fetchone()["n"]
        paid_active = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='PAID'").fetchone()["n"]
        trial_active = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='TRIAL' AND (expires_at IS NULL OR expires_at > ?)", (now,)).fetchone()["n"]
        suspended_licenses = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status IN ('SUSPENDIDA','REVOCADA')").fetchone()["n"]
        expiring_trials_7d = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='TRIAL' AND expires_at IS NOT NULL AND expires_at > ? AND expires_at <= ?", (now, next_7d)).fetchone()["n"]
        rejected_validations_24h = db.execute("SELECT COUNT(*) AS n FROM validations WHERE created_at >= ? AND result <> 'AUTHORIZED'", (since,)).fetchone()["n"]
    return {
        "customers": customers,
        "active_licenses": active_licenses,
        "active_installations": active_installations,
        "validations_24h": validations_24h,
        "paid_active": paid_active,
        "trial_active": trial_active,
        "suspended_licenses": suspended_licenses,
        "expiring_trials_7d": expiring_trials_7d,
        "rejected_validations_24h": rejected_validations_24h,
    }


@app.get("/admin/customers", dependencies=[Depends(_admin)])
def list_customers() -> dict[str, Any]:
    with _connect() as db:
        rows = db.execute(
            """SELECT c.*, COUNT(l.license_key) AS license_count
               FROM customers c LEFT JOIN licenses l ON l.customer_id=c.id
               GROUP BY c.id ORDER BY c.company_name COLLATE NOCASE"""
        ).fetchall()
    return {"rows": [dict(row) for row in rows]}


@app.post("/admin/customers", dependencies=[Depends(_admin)])
def create_customer(payload: CustomerIn) -> dict[str, Any]:
    status = _normalize_status(payload.status)
    now = _now().isoformat()
    with _connect() as db:
        cur = db.execute(
            """INSERT INTO customers (company_name,contact_name,email,phone,tax_id,status,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?)""",
            (payload.company_name.strip(), payload.contact_name.strip(), payload.email.strip().lower(), payload.phone.strip(), payload.tax_id.strip(), status, now, now),
        )
        customer_id = int(cur.lastrowid)
    return {"ok": True, "id": customer_id}


@app.put("/admin/customers/{customer_id}", dependencies=[Depends(_admin)])
def update_customer(customer_id: int, payload: CustomerIn) -> dict[str, Any]:
    status = _normalize_status(payload.status)
    with _connect() as db:
        cur = db.execute(
            """UPDATE customers SET company_name=?,contact_name=?,email=?,phone=?,tax_id=?,status=?,updated_at=? WHERE id=?""",
            (payload.company_name.strip(), payload.contact_name.strip(), payload.email.strip().lower(), payload.phone.strip(), payload.tax_id.strip(), status, _now().isoformat(), customer_id),
        )
        if not cur.rowcount:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"ok": True, "id": customer_id}


@app.delete("/admin/customers/{customer_id}", dependencies=[Depends(_admin)])
def delete_customer(customer_id: int) -> dict[str, Any]:
    with _connect() as db:
        count = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE customer_id=?", (customer_id,)).fetchone()["n"]
        if count:
            raise HTTPException(status_code=409, detail="El cliente tiene licencias asociadas; reasígnelas o elimínelas primero")
        cur = db.execute("DELETE FROM customers WHERE id=?", (customer_id,))
        if not cur.rowcount:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"ok": True}


@app.get("/admin/licenses", dependencies=[Depends(_admin)])
def list_licenses() -> dict[str, Any]:
    with _connect() as db:
        rows = db.execute(
            """SELECT l.*, c.company_name, COUNT(i.installation_id) AS installation_count
               FROM licenses l
               LEFT JOIN customers c ON c.id=l.customer_id
               LEFT JOIN installations i ON i.license_key=l.license_key
               GROUP BY l.license_key ORDER BY l.updated_at DESC"""
        ).fetchall()
    return {"rows": [dict(row) for row in rows]}


@app.get("/admin/licenses/generate-key", dependencies=[Depends(_admin)])
def generate_license_key() -> dict[str, Any]:
    return {"license_key": _generate_license_key()}


@app.put("/admin/licenses/{license_key}", dependencies=[Depends(_admin)])
def upsert_license(license_key: str, payload: LicenseIn) -> dict[str, Any]:
    key = license_key.strip().upper()
    if key != payload.license_key.strip().upper():
        raise HTTPException(status_code=422, detail="La clave de la ruta y del cuerpo no coinciden")
    status = _normalize_license_status(payload.status)
    license_type = payload.type.strip().upper()
    if license_type not in {"PAID", "TRIAL"}:
        raise HTTPException(status_code=422, detail="Tipo no permitido")
    if license_type == "TRIAL":
        plan, plan_limit = "TRIAL", TRIAL_MAX_CLIENTS
    else:
        plan, plan_limit = _normalize_plan(payload.plan)
    if payload.customer_id is not None:
        with _connect() as db:
            if not db.execute("SELECT 1 FROM customers WHERE id=?", (payload.customer_id,)).fetchone():
                raise HTTPException(status_code=404, detail="Cliente/ISP no encontrado")

    with _connect() as db:
        current = db.execute("SELECT type, expires_at FROM licenses WHERE license_key=?", (key,)).fetchone()
        expires_at = None
        if license_type == "TRIAL":
            if current and str(current["type"]).upper() == "TRIAL" and current["expires_at"]:
                expires_at = current["expires_at"]
            else:
                expires_at = (_now() + timedelta(days=TRIAL_DAYS)).isoformat()
        db.execute(
            """INSERT INTO licenses (license_key,customer_id,name,email,status,type,plan,max_clients,expires_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(license_key) DO UPDATE SET
               customer_id=excluded.customer_id,name=excluded.name,email=excluded.email,status=excluded.status,
               type=excluded.type,plan=excluded.plan,max_clients=excluded.max_clients,
               expires_at=excluded.expires_at,updated_at=excluded.updated_at""",
            (key, payload.customer_id, payload.name.strip(), payload.email.strip().lower(), status, license_type, plan, plan_limit, expires_at, _now().isoformat()),
        )
    return {"ok": True, "license_key": key, "plan": plan, "max_clients": plan_limit, "expires_at": expires_at}


@app.post("/admin/licenses/{license_key}/renew-trial", dependencies=[Depends(_admin)])
def renew_trial(license_key: str, payload: TrialRenewIn) -> dict[str, Any]:
    key = license_key.strip().upper()
    with _connect() as db:
        row = db.execute("SELECT type FROM licenses WHERE license_key=?", (key,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Licencia no encontrada")
        if str(row["type"]).upper() != "TRIAL":
            raise HTTPException(status_code=409, detail="Solo las licencias TRIAL pueden renovar su período de prueba")
        expires_at = (_now() + timedelta(days=payload.days)).isoformat()
        db.execute(
            "UPDATE licenses SET expires_at=?, status='ACTIVA', updated_at=? WHERE license_key=?",
            (expires_at, _now().isoformat(), key),
        )
    return {"ok": True, "license_key": key, "expires_at": expires_at, "days": payload.days}


@app.delete("/admin/licenses/{license_key}", dependencies=[Depends(_admin)])
def delete_license(license_key: str) -> dict[str, Any]:
    key = license_key.strip().upper()
    with _connect() as db:
        db.execute("DELETE FROM installations WHERE license_key=?", (key,))
        cur = db.execute("DELETE FROM licenses WHERE license_key=?", (key,))
        if not cur.rowcount:
            raise HTTPException(status_code=404, detail="Licencia no encontrada")
    return {"ok": True}


@app.get("/admin/installations", dependencies=[Depends(_admin)])
def list_installations() -> dict[str, Any]:
    with _connect() as db:
        rows = db.execute(
            """SELECT i.*, c.company_name
               FROM installations i
               JOIN licenses l ON l.license_key=i.license_key
               LEFT JOIN customers c ON c.id=l.customer_id
               ORDER BY i.updated_at DESC"""
        ).fetchall()
    return {"rows": [dict(row) for row in rows]}


@app.put("/admin/licenses/{license_key}/installations/{installation_id}", dependencies=[Depends(_admin)])
def authorize_installation(license_key: str, installation_id: str, payload: InstallationIn) -> dict[str, Any]:
    key = license_key.strip().upper()
    install_id = installation_id.strip()
    if install_id != payload.installation_id.strip():
        raise HTTPException(status_code=422, detail="La instalación de la ruta y del cuerpo no coincide")
    if not _license_row(key):
        raise HTTPException(status_code=404, detail="Licencia no registrada")
    status = _normalize_status(payload.status)
    with _connect() as db:
        db.execute(
            """INSERT INTO installations (license_key,installation_id,installation_name,status,updated_at)
               VALUES (?,?,?,?,?)
               ON CONFLICT(license_key,installation_id) DO UPDATE SET
               installation_name=excluded.installation_name,status=excluded.status,updated_at=excluded.updated_at""",
            (key, install_id, payload.installation_name.strip(), status, _now().isoformat()),
        )
    return {"ok": True, "license_key": key, "installation_id": install_id, "status": status}


@app.delete("/admin/licenses/{license_key}/installations/{installation_id}", dependencies=[Depends(_admin)])
def delete_installation(license_key: str, installation_id: str) -> dict[str, Any]:
    with _connect() as db:
        cur = db.execute(
            "DELETE FROM installations WHERE license_key=? AND installation_id=?",
            (license_key.strip().upper(), installation_id.strip()),
        )
        if not cur.rowcount:
            raise HTTPException(status_code=404, detail="Instalación no encontrada")
    return {"ok": True}


@app.get("/admin/validations", dependencies=[Depends(_admin)])
def validation_history(limit: int = 100) -> dict[str, Any]:
    size = min(500, max(1, int(limit)))
    with _connect() as db:
        rows = db.execute(
            """SELECT v.license_key, v.installation_id, v.result, v.created_at, c.company_name
               FROM validations v
               LEFT JOIN licenses l ON l.license_key=v.license_key
               LEFT JOIN customers c ON c.id=l.customer_id
               ORDER BY v.id DESC LIMIT ?""",
            (size,),
        ).fetchall()
    return {"rows": [dict(row) for row in rows]}
