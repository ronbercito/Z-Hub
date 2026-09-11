"""
Archivo: backend/app/routers/ajustes/router.py
Función: Configuración general del ISP (/api/settings): lectura y actualización de razón
         social, RUC, contacto, cuentas de cobro, políticas operativas, correo y notificaciones.
Trabaja con: backend/app/models/setting.py, frontend/src/modules/ajustes/Settings.jsx,
             backend/app/integrations/mikrotik/service.py (lista de corte)
"""
import asyncio
import base64
import hashlib
import smtplib
from datetime import date
from email.message import EmailMessage
from typing import Any, Dict

from cryptography.fernet import Fernet, InvalidToken
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import APP_ENCRYPTION_KEY, JWT_SECRET
from app.core.database import get_db
from app.core.license_manager import get_license
from app.core.security import get_current_user, require_role
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(prefix="/settings", tags=["Ajustes"], dependencies=[Depends(get_current_user)])
public_router = APIRouter(prefix="/settings", tags=["Ajustes públicos"])

LICENSE_INTERNAL_SETTINGS = {
    "license_key",
    "license_type",
    "license_plan",
    "license_max_clients",
    "license_activated_at",
}

# La API genérica solo puede modificar claves conocidas. Los secretos/contadores internos
# se administran en endpoints específicos y nunca mediante PUT /settings.
PROTECTED_GENERIC_SETTINGS = {
    "smtp_password_encrypted",
    "smtp_sent_date",
    "smtp_sent_count",
    "initial_setup_completed",
    *LICENSE_INTERNAL_SETTINGS,
}
EDITABLE_SETTINGS = set(DEFAULT_SETTINGS) - PROTECTED_GENERIC_SETTINGS


class SystemNotificationsIn(BaseModel):
    system_alert_emails: list[str] = Field(default_factory=list)
    system_alert_phones: list[str] = Field(default_factory=list)
    payment_report_emails: list[str] = Field(default_factory=list)


class MailServerIn(BaseModel):
    host: str = ""
    port: int = Field(default=465, ge=1, le=65535)
    security: str = "ssl"
    authentication: bool = True
    username: str = ""
    password: str = ""
    daily_limit: int = Field(default=1000, ge=1, le=100000)
    logo_url: str = ""
    signature_html: str = ""

    @field_validator("security")
    @classmethod
    def validate_security(cls, value: str) -> str:
        value = value.lower().strip()
        if value not in {"ssl", "starttls", "none"}:
            raise ValueError("Seguridad SMTP no válida")
        return value


class MailTestIn(BaseModel):
    recipient: EmailStr


def _fernet_from_secret(secret: str) -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
    return Fernet(key)


def _fernet() -> Fernet:
    """Usa una clave de cifrado independiente; conserva fallback para instalaciones antiguas."""
    return _fernet_from_secret(APP_ENCRYPTION_KEY or JWT_SECRET)


def _legacy_fernet() -> Fernet:
    return _fernet_from_secret(JWT_SECRET)


def _public_settings(data: dict) -> dict:
    """Nunca exponer secretos ni metadatos internos de licencia en el GET genérico."""
    hidden = {"smtp_password_encrypted", *LICENSE_INTERNAL_SETTINGS}
    return {key: value for key, value in data.items() if key not in hidden}


def _mail_public(data: dict) -> dict:
    today = date.today().isoformat()
    return {
        "host": data.get("smtp_host") or "",
        "port": int(data.get("smtp_port") or 465),
        "security": data.get("smtp_security") or "ssl",
        "authentication": bool(data.get("smtp_authentication", True)),
        "username": data.get("smtp_username") or "",
        "password_set": bool(data.get("smtp_password_encrypted")),
        "daily_limit": int(data.get("smtp_daily_limit") or 1000),
        "sent_today": int(data.get("smtp_sent_count") or 0) if data.get("smtp_sent_date") == today else 0,
        "logo_url": data.get("smtp_logo_url") or "",
        "signature_html": data.get("smtp_signature_html") or "",
    }


def _recipients(values: list[str]) -> list[str]:
    """Normaliza destinatarios, elimina vacíos y evita duplicados."""
    result: list[str] = []
    for value in values:
        item = str(value).strip()
        if item and item not in result:
            result.append(item)
    return result


def _mask_license_key(value: str) -> str:
    key = str(value or "").strip()
    if not key:
        return ""
    if len(key) <= 8:
        return "•" * max(4, len(key) - 2) + key[-2:]
    return f"{key[:4]}-••••-••••-{key[-4:]}"


async def _get(db: AsyncSession) -> Setting:
    s = await db.get(Setting, "system_config")
    if not s:
        s = Setting(id="system_config", data=dict(DEFAULT_SETTINGS))
        db.add(s)
        await db.commit()
    return s


@public_router.get("/public")
async def get_public_branding(db: AsyncSession = Depends(get_db)):
    """Datos visuales necesarios antes de iniciar sesión; no expone datos fiscales."""
    s = await _get(db)
    data = {**DEFAULT_SETTINGS, **(s.data or {})}
    return {
        "company_name": (data.get("company_name") or "Z-Hub").strip() or "Z-Hub",
        "logo_data": data.get("logo_data") or "",
        "panel_theme": data.get("panel_theme") or "dark",
    }


@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    s = await _get(db)
    return {"id": s.id, **_public_settings({**DEFAULT_SETTINGS, **(s.data or {})})}


@router.get("/license-info")
async def get_license_info(db: AsyncSession = Depends(get_db)):
    """Resumen de licencia para Ajustes sin exponer la clave completa."""
    info = await get_license(db)
    key = info.pop("key", "")
    return {**info, "license_key_masked": _mask_license_key(key)}


@router.put("")
async def update_settings(data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    s = await _get(db)
    data.pop("id", None)
    # Settings.jsx mezcla la respuesta de GET en su estado y puede conservar claves
    # heredadas de instalaciones antiguas. Las claves no reconocidas nunca se escriben,
    # pero tampoco deben bloquear una actualización válida como panel_theme.
    for key in PROTECTED_GENERIC_SETTINGS:
        data.pop(key, None)
    data = {key: value for key, value in data.items() if key in EDITABLE_SETTINGS}
    s.data = {**(s.data or {}), **data}
    await db.commit()
    return {"id": s.id, **_public_settings({**DEFAULT_SETTINGS, **s.data})}


@router.get("/mail-server", dependencies=[Depends(require_role("admin"))])
async def get_mail_server(db: AsyncSession = Depends(get_db)):
    s = await _get(db)
    return _mail_public({**DEFAULT_SETTINGS, **(s.data or {})})


@router.put("/mail-server", dependencies=[Depends(require_role("admin"))])
async def update_mail_server(data: MailServerIn, db: AsyncSession = Depends(get_db)):
    s = await _get(db)
    values = data.model_dump()
    if values["authentication"] and (not values["host"].strip() or not values["username"].strip()):
        raise HTTPException(status_code=422, detail="Host y usuario/correo son obligatorios con autenticación SMTP")
    saved = dict(s.data or {})
    saved.update({
        "smtp_host": values["host"].strip(), "smtp_port": values["port"], "smtp_security": values["security"],
        "smtp_authentication": values["authentication"], "smtp_username": values["username"].strip(),
        "smtp_daily_limit": values["daily_limit"], "smtp_logo_url": values["logo_url"].strip(),
        "smtp_signature_html": values["signature_html"],
    })
    if values["password"]:
        saved["smtp_password_encrypted"] = _fernet().encrypt(values["password"].encode("utf-8")).decode("utf-8")
    s.data = saved
    await db.commit()
    return _mail_public({**DEFAULT_SETTINGS, **saved})


def _smtp_password(data: dict) -> str:
    encrypted = data.get("smtp_password_encrypted") or ""
    if not encrypted:
        return ""
    raw = encrypted.encode("utf-8")
    try:
        return _fernet().decrypt(raw).decode("utf-8")
    except InvalidToken:
        if APP_ENCRYPTION_KEY:
            try:
                return _legacy_fernet().decrypt(raw).decode("utf-8")
            except InvalidToken:
                pass
        raise HTTPException(status_code=500, detail="No se pudo descifrar la contraseña SMTP; revise APP_ENCRYPTION_KEY/JWT_SECRET")


def _send_smtp(config: dict, username: str, password: str, message: EmailMessage) -> None:
    host = (config.get("smtp_host") or "").strip()
    port = int(config.get("smtp_port") or (465 if config.get("smtp_security") == "ssl" else 587))
    if config.get("smtp_security") == "ssl":
        client = smtplib.SMTP_SSL(host, port, timeout=15)
    else:
        client = smtplib.SMTP(host, port, timeout=15)
        client.ehlo()
        if config.get("smtp_security") == "starttls":
            client.starttls()
            client.ehlo()
    with client:
        if config.get("smtp_authentication"):
            client.login(username, password)
        client.send_message(message)


@router.post("/mail-server/test", dependencies=[Depends(require_role("admin"))])
async def test_mail_server(data: MailTestIn, db: AsyncSession = Depends(get_db)):
    s = await _get(db)
    config = {**DEFAULT_SETTINGS, **(s.data or {})}
    host, username = (config.get("smtp_host") or "").strip(), (config.get("smtp_username") or "").strip()
    if not host:
        raise HTTPException(status_code=422, detail="Primero guarde un servidor SMTP válido")
    password = _smtp_password(config)
    if config.get("smtp_authentication") and not password:
        raise HTTPException(status_code=422, detail="Ingrese y guarde la contraseña de aplicación antes de probar")
    today = date.today().isoformat()
    sent = int(config.get("smtp_sent_count") or 0) if config.get("smtp_sent_date") == today else 0
    if sent >= int(config.get("smtp_daily_limit") or 1000):
        raise HTTPException(status_code=429, detail="Se alcanzó el límite diario de correo")
    recipient = str(data.recipient).strip()
    message = EmailMessage()
    message["Subject"] = "Prueba SMTP · Z-Hub"
    message["From"] = username or "Z-Hub"
    message["To"] = recipient
    message.set_content("La configuración SMTP de Z-Hub funciona correctamente.")
    message.add_alternative(f"<h2>Prueba SMTP correcta</h2><p>La configuración de correo de Z-Hub funciona correctamente.</p>{config.get('smtp_signature_html') or ''}", subtype="html")
    try:
        await asyncio.to_thread(_send_smtp, config, username, password, message)
    except (OSError, smtplib.SMTPException) as exc:
        raise HTTPException(status_code=502, detail=f"No se pudo enviar la prueba SMTP: {exc}") from exc
    saved = dict(s.data or {})
    saved["smtp_sent_date"], saved["smtp_sent_count"] = today, sent + 1
    s.data = saved
    await db.commit()
    return {"message": f"Correo de prueba enviado a {recipient}", "sent_today": sent + 1}


@router.get("/system-notifications")
async def get_system_notifications(db: AsyncSession = Depends(get_db)):
    """Destinatarios usados por alertas de equipos y reportes de pago."""
    s = await _get(db)
    data = {**DEFAULT_SETTINGS, **(s.data or {})}
    return {
        "system_alert_emails": _recipients(data.get("system_alert_emails") or []),
        "system_alert_phones": _recipients(data.get("system_alert_phones") or []),
        "payment_report_emails": _recipients(data.get("payment_report_emails") or []),
    }


@router.put("/system-notifications")
async def update_system_notifications(data: SystemNotificationsIn, db: AsyncSession = Depends(get_db)):
    """Actualiza únicamente los destinatarios de notificaciones operativas."""
    s = await _get(db)
    s.data = {
        **(s.data or {}),
        "system_alert_emails": _recipients(data.system_alert_emails),
        "system_alert_phones": _recipients(data.system_alert_phones),
        "payment_report_emails": _recipients(data.payment_report_emails),
    }
    await db.commit()
    return await get_system_notifications(db)
