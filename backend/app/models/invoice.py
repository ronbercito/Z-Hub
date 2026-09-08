"""
Archivo: backend/app/models/invoice.py
Actualización: 2026-09-08 — conserva y genera automáticamente la identificación del servicio y plan en cada factura.
Función: Tabla `invoices` — facturas / recibos mensuales de cada abonado con su estado y pago,
         permitiendo identificar si corresponde al servicio principal o a un servicio adicional
         incluso si posteriormente se elimina el servicio.
Trabaja con: backend/app/routers/facturacion/router.py, backend/app/models/client.py,
             backend/app/models/client_service.py, backend/app/routers/clientes/services.py
"""
from sqlalchemy import Float, String, Text, event, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    invoice_number: Mapped[str] = mapped_column(String(40), index=True)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    service_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    service_label: Mapped[str] = mapped_column(String(180), default="Servicio 1 · Principal")
    service_type: Mapped[str] = mapped_column(String(30), default="principal")
    client_name: Mapped[str] = mapped_column(String(150), default="")
    client_dni_ruc: Mapped[str] = mapped_column(String(20), default="")
    client_address: Mapped[str] = mapped_column(String(255), default="")
    client_phone: Mapped[str] = mapped_column(String(30), default="")
    plan_name: Mapped[str] = mapped_column(String(120), default="")
    amount: Mapped[float] = mapped_column(Float)
    month_period: Mapped[str] = mapped_column(String(40))
    issue_date: Mapped[str] = mapped_column(String(20))
    due_date: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="unpaid")
    payment_method: Mapped[str | None] = mapped_column(String(60), nullable=True)
    payment_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    paid_amount: Mapped[float] = mapped_column(Float, default=0.0)
    operator_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    operation_reference: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


@event.listens_for(Invoice, "before_insert")
def _snapshot_service_identity(mapper, connection, target):
    """Guarda una etiqueta estable para que una factura conserve su servicio histórico."""
    plan = (target.plan_name or "").strip()
    plan_suffix = f" · {plan}" if plan else ""
    if not target.service_id:
        target.service_label = f"Servicio 1 · Principal{plan_suffix}"
        target.service_type = "principal"
        return

    row = connection.execute(
        text("SELECT client_id, created_at FROM client_services WHERE id = :service_id"),
        {"service_id": target.service_id},
    ).mappings().first()
    if not row:
        target.service_label = f"Servicio adicional{plan_suffix}"
        target.service_type = "adicional"
        return

    rows = connection.execute(
        text("SELECT id, created_at FROM client_services WHERE client_id = :client_id ORDER BY created_at ASC, id ASC"),
        {"client_id": row["client_id"]},
    ).mappings().all()
    number = next((index for index, item in enumerate(rows, start=2) if item["id"] == target.service_id), 2)
    target.service_label = f"Servicio {number} · Adicional{plan_suffix}"
    target.service_type = "adicional"
