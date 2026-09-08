/**
 * Archivo: backend/app/routers/clientes/schemas.py
 * Actualización: 2026-09-08 — admite potencia ONU manual al editar la configuración técnica y refuerza datos obligatorios del Resumen.
 * Función: Esquemas Pydantic del módulo Clientes (datos de entrada para crear/editar abonados).
 * Trabaja con: backend/app/routers/clientes/router.py, backend/app/models/client.py
 */
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ClientIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    full_name: str
    dni_ruc: str
    phone: str = ""
    email: str = ""
    address: str = ""
    reference: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    ip_address: str = ""
    mac_address: str = ""
    onu_sn: str = ""
    connection_type: str = "PPPoE"  # PPPoE | IP Estática | DHCP
    pppoe_user: str = ""
    pppoe_password: str = ""
    plan_id: str = ""
    router_id: str = ""
    ipv4_network_id: str = ""
    nap_box: str = ""
    nap_box_id: str = ""
    nap_port: Optional[int] = None
    optical_power_dbm: Optional[float] = None
    installation_date: str = ""
    technology: str = "fiber"
    zone_id: str = ""
    zone_name: str = ""
    monitoring_equipment_id: str = ""
    monitoring_equipment_name: str = ""
    antenna_type: str = ""
    management_ip: str = ""
    status: str = "active"
    billing_day: int = Field(default=5, ge=1, le=30)
    billing_type: str = "prepaid"
    invoice_lead_days: int = Field(default=5, ge=1, le=20)
    grace_days: int = Field(default=5, ge=1, le=20)
    cut_after_months: int = Field(default=1, ge=1, le=6)
    invoice_notification_channel: str = "none"
    payment_reminder_channel: str = "none"
    reminder_1_days: Optional[int] = Field(default=None, ge=1, le=20)
    reminder_2_days: Optional[int] = Field(default=None, ge=1, le=20)
    reminder_3_days: Optional[int] = Field(default=None, ge=1, le=20)
    create_first_invoice: bool = True


class ClientServiceUpdate(BaseModel):
    """
    Schema para actualización de Servicio del cliente (pestaña Servicio).
    Solo incluye campos técnicos de configuración de servicio.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    model_config = ConfigDict(extra="ignore")

    plan_id: Optional[str] = None
    router_id: Optional[str] = None
    connection_type: Optional[str] = None
    ipv4_network_id: Optional[str] = None
    ip_address: Optional[str] = None
    pppoe_user: Optional[str] = None
    pppoe_password: Optional[str] = None
    technology: Optional[str] = None
    zone_id: Optional[str] = None
    nap_box_id: Optional[str] = None
    nap_port: Optional[int] = None
    onu_sn: Optional[str] = None
    optical_power_dbm: Optional[float] = None
    monitoring_equipment_id: Optional[str] = None
    antenna_type: Optional[str] = None
    management_ip: Optional[str] = None


class ClientSummaryUpdate(BaseModel):
    """Actualiza el formulario completo de Resumen; identidad y contacto son obligatorios."""
    model_config = ConfigDict(extra="ignore")

    full_name: str
    dni_ruc: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    reference: Optional[str] = None
    installation_date: Optional[str] = None
    zone_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
