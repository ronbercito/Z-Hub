/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingActions.jsx
 * Actualización: 2026-09-08 — separación de acciones de Facturación.
 * Función: acciones superiores y acciones disponibles por factura.
 * Recibe de: ClientBilling.jsx y ClientBillingTable.jsx.
 * Entrega a: callbacks del controlador de Facturación sin modificar API ni reglas de negocio.
 */
import React from "react";
import { Ban, Pencil, Plus, Printer, Receipt, Send, Settings, Trash2 } from "lucide-react";

const ACTION_CLASSES = {
  default: "bg-slate-800 border-slate-700 text-slate-300",
  edit: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  delete: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  annul: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  send: "bg-violet-500/10 border-violet-500/30 text-violet-300",
};

export function ActionButton({ title, icon: Icon, onClick, disabled = false, kind = "default" }) {
  const className = ACTION_CLASSES[kind] || ACTION_CLASSES.default;
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-lg border ${className} disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-125`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export function ClientBillingHeaderActions({ openInvoice, setTab }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button type="button" onClick={() => openInvoice("free")} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold flex items-center gap-1">
        <Plus className="w-3.5 h-3.5" /> Factura libre
      </button>
      <button type="button" onClick={() => openInvoice("service")} className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-1">
        <Receipt className="w-3.5 h-3.5" /> Factura de servicios
      </button>
      <button type="button" onClick={() => setTab("config")} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1">
        <Settings className="w-3.5 h-3.5" /> Configuración
      </button>
    </div>
  );
}

export function ClientBillingRowActions({ invoice, openEdit, viewPdf, deleteInvoice, annulInvoice, openSend, startPayment }) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <ActionButton title="Editar" icon={Pencil} kind="edit" disabled={invoice.status === "paid" || invoice.status === "canceled" || Number(invoice.paid_amount || 0) > 0} onClick={() => openEdit(invoice)} />
      <ActionButton title="Ver factura" icon={Printer} onClick={() => viewPdf(invoice)} />
      <ActionButton title="Eliminar" icon={Trash2} kind="delete" disabled={invoice.status === "paid" || Number(invoice.paid_amount || 0) > 0} onClick={() => deleteInvoice(invoice)} />
      <ActionButton title="Anular" icon={Ban} kind="annul" disabled={invoice.status === "paid" || invoice.status === "canceled" || Number(invoice.paid_amount || 0) > 0} onClick={() => annulInvoice(invoice)} />
      <ActionButton title="Enviar" icon={Send} kind="send" onClick={() => openSend(invoice)} />
      {invoice.status !== "paid" && invoice.status !== "canceled" && (
        <button type="button" onClick={() => startPayment(invoice)} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">Pagar</button>
      )}
    </div>
  );
}
