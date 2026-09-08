"""
Archivo: backend/app/models/client_balance.py
Actualización: 2026-09-08 — nuevo libro mayor de saldos a favor y deudas del cliente.
Función: registra ajustes firmados de saldo y sus aplicaciones a facturas, manteniendo trazabilidad de origen y destino.
Trabaja con: backend/app/routers/facturacion/balances.py, invoice.py y frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx.
"""
from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class ClientBalance(Base):
    __tablename__ = "client_balances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    source_invoice_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    target_invoice_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    parent_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    amount: Mapped[float] = mapped_column(Float)
    remaining_amount: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text, default="")
    operator_name: Mapped[str] = mapped_column(String(150), default="Sistema")
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)

    def to_dict(self, source_number: str | None = None, target_number: str | None = None) -> dict:
        original = float(self.amount or 0)
        remaining = float(self.remaining_amount or 0)
        if self.parent_id:
            status = "APLICADO"
        elif abs(remaining) < 0.005:
            status = "CONSUMIDO"
        elif abs(remaining - original) < 0.005:
            status = "DISPONIBLE"
        else:
            status = "APLICADO PARCIAL"
        return {
            "id": self.id,
            "client_id": self.client_id,
            "source_invoice_id": self.source_invoice_id,
            "target_invoice_id": self.target_invoice_id,
            "parent_id": self.parent_id,
            "amount": original,
            "remaining_amount": remaining,
            "description": self.description or "",
            "operator_name": self.operator_name or "Sistema",
            "created_at": self.created_at,
            "source_invoice_number": source_number,
            "target_invoice_number": target_number,
            "status": status,
        }
