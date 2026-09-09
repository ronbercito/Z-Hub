"""
Archivo: backend/app/models/setting.py
Función: Tabla `settings` — configuración general del ISP en una sola fila guardada como JSON.
Trabaja con: backend/app/routers/ajustes/router.py, Ajustes > General y frontend/src/modules/appearance/.
"""
from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

DEFAULT_SETTINGS = {
    "company_name": "Z-Hub",
    "logo_data": "",
    "panel_theme": "dark",
    "ruc": "",
    "phone": "",
    "email": "",
    "address": "",
    "currency": "PEN",
    "currency_symbol": "S/.",
    "auto_cut_enabled": True,
    "grace_days": 3,
    "billing_day": 5,
    "billing_invoice_lead_days": 5,
    "billing_grace_days": 5,
    "billing_cut_after_months": 1,
    "billing_invoice_notification_channel": "none",
    "billing_payment_reminder_channel": "none",
    "billing_reminder_1_days": 5,
    "billing_reminder_2_days": 0,
    "billing_reminder_3_days": 0,
    "billing_auto_generate": True,
    "yape_number": "",
    "plin_number": "",
    "bcp_account": "",
    "bbva_account": "",
    "mikrotik_cut_list": "morosos",
    "technician_client_visibility_minutes": 720,
    "google_maps_api_key": "",
    "system_alert_emails": [],
    "system_alert_phones": [],
    "payment_report_emails": [],
    "smtp_host": "",
    "smtp_port": 465,
    "smtp_security": "ssl",
    "smtp_authentication": True,
    "smtp_username": "",
    "smtp_daily_limit": 1000,
    "smtp_logo_url": "",
    "smtp_signature_html": "",
    "smtp_sent_date": "",
    "smtp_sent_count": 0,
    "initial_setup_completed": False,
    "license_key": "",
}


class Setting(Base):
    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default="system_config")
    data: Mapped[dict] = mapped_column(JSON, default=dict)
