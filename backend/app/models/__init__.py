"""
Archivo: backend/app/models/__init__.py
Actualización: 2026-09-10 — registra recuperación persistente de equipos.
Función: registra todos los modelos (tablas SQL) para que SQLAlchemy los conozca al crear la base de datos.
Trabaja con: backend/app/core/database.py y backend/app/models/*.py
"""
from .user import User
from .plan import Plan
from .router import Router
from .client import Client
from .client_service import ClientService
from .installation import Installation
from .ipv4_network import IPv4Network
from .nap_box import NapBox
from .zone import Zone
from .monitoring_equipment import MonitoringEquipment
from .client_activity import ClientActivity
from .invoice import Invoice
from .client_balance import ClientBalance
from .ticket import Ticket
from .client_communication import ClientCommunication
from .client_document import ClientDocument
from .inventory import InventoryItem
from .equipment_recovery import EquipmentRecovery
from .hotspot import HotspotVoucher
from .task import Task
from .setting import Setting

__all__ = [
    "User", "Plan", "Router", "Client", "ClientService", "Installation", "Invoice", "ClientBalance", "Ticket",
    "InventoryItem", "EquipmentRecovery", "HotspotVoucher", "Task", "Setting", "ClientCommunication", "ClientDocument", "IPv4Network", "NapBox", "Zone", "MonitoringEquipment", "ClientActivity",
]
