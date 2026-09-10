"""
Archivo: backend/app/models/client.py
Función: Tabla `clients` — datos personales, servicio activo e historiales de retiro, pausa y suspensión.
"""
from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(150), index=True)
    dni_ruc: Mapped[str] = mapped_column(String(20), index=True)
    phone: Mapped[str] = mapped_column(String(30), default="")
    email: Mapped[str] = mapped_column(String(190), default="")
    address: Mapped[str] = mapped_column(String(255), default="")
    reference: Mapped[str] = mapped_column(String(255), default="")
    latitude: Mapped[float] = mapped_column(Float, default=0.0)
    longitude: Mapped[float] = mapped_column(Float, default=0.0)

    ip_address: Mapped[str] = mapped_column(String(60), default="", index=True)
    mac_address: Mapped[str] = mapped_column(String(40), default="")
    onu_sn: Mapped[str] = mapped_column(String(60), default="")
    connection_type: Mapped[str] = mapped_column(String(30), default="PPPoE")
    pppoe_user: Mapped[str] = mapped_column(String(80), default="")
    pppoe_password: Mapped[str] = mapped_column(String(80), default="")

    plan_id: Mapped[str] = mapped_column(String(36), default="")
    plan_name: Mapped[str] = mapped_column(String(120), default="")
    plan_price: Mapped[float] = mapped_column(Float, default=0.0)
    router_id: Mapped[str] = mapped_column(String(36), default="")
    router_name: Mapped[str] = mapped_column(String(120), default="")
    ipv4_network_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    nap_box: Mapped[str] = mapped_column(String(80), default="")
    nap_box_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    nap_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    optical_power_dbm: Mapped[float | None] = mapped_column(Float, nullable=True)
    installation_date: Mapped[str] = mapped_column(String(10), default="")
    technology: Mapped[str] = mapped_column(String(20), default="fiber")
    zone_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    zone_name: Mapped[str] = mapped_column(String(120), default="")
    monitoring_equipment_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    monitoring_equipment_name: Mapped[str] = mapped_column(String(120), default="")
    antenna_type: Mapped[str] = mapped_column(String(80), default="")
    management_ip: Mapped[str] = mapped_column(String(60), default="")

    status: Mapped[str] = mapped_column(String(30), default="active")  # active | suspended | paused | retired | pending_install
    suspended_at: Mapped[str] = mapped_column(String(40), default="", index=True)
    retired_at: Mapped[str] = mapped_column(String(40), default="", index=True)
    retirement_reason: Mapped[str] = mapped_column(String(250), default="")
    retirement_technical_snapshot: Mapped[str] = mapped_column(Text, default="")

    pause_active: Mapped[bool] = mapped_column(Boolean, default=False)
    pause_started_at: Mapped[str] = mapped_column(String(40), default="", index=True)
    pause_until: Mapped[str] = mapped_column(String(10), default="", index=True)
    pause_months: Mapped[int] = mapped_column(Integer, default=0)
    pause_reason: Mapped[str] = mapped_column(String(250), default="")
    pause_saved_days: Mapped[int] = mapped_column(Integer, default=0)
    pause_original_billing_day: Mapped[int] = mapped_column(Integer, default=0)
    pause_resumed_at: Mapped[str] = mapped_column(String(40), default="")
    pause_billing_day_after: Mapped[int] = mapped_column(Integer, default=0)

    billing_day: Mapped[int] = mapped_column(Integer, default=5)
    billing_type: Mapped[str] = mapped_column(String(20), default="prepaid")
    invoice_lead_days: Mapped[int] = mapped_column(Integer, default=5)
    grace_days: Mapped[int] = mapped_column(Integer, default=5)
    cut_after_months: Mapped[int] = mapped_column(Integer, default=1)
    invoice_notification_channel: Mapped[str] = mapped_column(String(20), default="none")
    payment_reminder_channel: Mapped[str] = mapped_column(String(20), default="none")
    reminder_1_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reminder_2_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reminder_3_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unpaid_invoices_count: Mapped[int] = mapped_column(Integer, default=0)
    balance_due: Mapped[float] = mapped_column(Float, default=0.0)
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    last_connection_time: Mapped[str] = mapped_column(String(40), default="")
    mikrotik_status: Mapped[str] = mapped_column(Text, default="")
    created_by_user_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
