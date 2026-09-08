/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingTable.jsx
 * Actualización: 2026-09-08 — tabla de Facturación extraída del controlador.
 * Función: renderiza y ordena facturas; mantiene las filas auxiliares de pago junto a su factura.
 * Recibe de: ClientBilling.jsx.
 * Entrega a: UI de Facturas y callbacks de acciones/pagos.
 */
import React, { useMemo, useState } from "react";
import { Clock, Loader, CheckCircle2, AlertTriangle, Ban } from "lucide-react";
import { ClientBillingRowActions } from "./ClientBillingActions";
import { INPUT_CLASS, invoiceSortValue, statusMeta } from "./clientBillingUtils";

const COLUMNS = [
  ["invoice_number", "Recibo", "text-left"],
  ["service_label", "Servicio", "text-left"],
  ["month_period", "Período", "text-left"],
  ["amount", "Monto", "text-right"],
  ["due_date", "Vencimiento", "text-left"],
  ["status", "Estado", "text-left"],
];

const STATUS_ICONS = { paid: CheckCircle2, unpaid: Clock, overdue: AlertTriangle, canceled: Ban };

function StatusBadge({ status }) {
  const [className, label] = statusMeta(status);
  const Icon = STATUS_ICONS[status] || Clock;
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${className}`}><Icon className="w-3 h-3" />{label}</span>;
}

function Field({ label, children }) {
  return <label className="block text-xs text-slate-300"><span className="font-semibold">{label}</span>{children}</label>;
}

export default function ClientBillingTable({
  invoices,
  loading,
  openEdit,
  viewPdf,
  deleteInvoice,
  annulInvoice,
  openSend,
  startPayment,
  paying,
  pay,
  setPay,
  cancelPayment,
  registerPayment,
  processing,
}) {
  const [sort, setSort] = useState({ key: null, direction: "asc" });

  const sortedInvoices = useMemo(() => {
    if (!sort.key) return invoices;
    return [...invoices].sort((left, right) => {
      const a = invoiceSortValue(left, sort.key);
      const b = invoiceSortValue(right, sort.key);
      let result;
      if (typeof a === "number" && typeof b === "number") result = a - b;
      else result = String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
      return sort.direction === "asc" ? result : -result;
    });
  }, [invoices, sort]);

  const toggleSort = key => {
    setSort(current => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              {COLUMNS.map(([key, label, align]) => {
                const active = sort.key === key;
                return (
                  <th key={key} className={`p-3 ${align}`}>
                    <button type="button" onClick={() => toggleSort(key)} className="font-bold inline-flex items-center gap-1 hover:text-cyan-300 focus:outline-none focus:text-cyan-300" aria-label={`Ordenar por ${label}`}>
                      {label}{active ? (sort.direction === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  </th>
                );
              })}
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Cargando...</td></tr>
            ) : sortedInvoices.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">No hay facturas para este cliente.</td></tr>
            ) : sortedInvoices.map(invoice => (
              <React.Fragment key={invoice.id}>
                <tr>
                  <td className="p-3 font-mono font-bold">{invoice.invoice_number}</td>
                  <td className="p-3 text-cyan-300 font-semibold">{invoice.service_label || "Servicio 1"}</td>
                  <td className="p-3">{invoice.month_period}</td>
                  <td className="p-3 text-right font-bold">S/. {Number(invoice.amount || 0).toFixed(2)}</td>
                  <td className="p-3 text-slate-400">{invoice.due_date}</td>
                  <td className="p-3"><StatusBadge status={invoice.status} /></td>
                  <td className="p-3"><ClientBillingRowActions invoice={invoice} openEdit={openEdit} viewPdf={viewPdf} deleteInvoice={deleteInvoice} annulInvoice={annulInvoice} openSend={openSend} startPayment={startPayment} /></td>
                </tr>
                {paying === invoice.id && (
                  <tr className="bg-slate-950">
                    <td colSpan="7" className="p-4">
                      <div className="grid md:grid-cols-4 gap-2">
                        <Field label="Método">
                          <select value={pay.method} onChange={event => setPay(value => ({ ...value, method: event.target.value }))} className={INPUT_CLASS}>
                            <option>Yape</option><option>Plin</option><option>Efectivo</option><option>Transferencia BCP</option><option>BBVA</option><option>Interbank</option>
                          </select>
                        </Field>
                        <Field label="Monto"><input type="number" step="0.01" value={pay.amount} onChange={event => setPay(value => ({ ...value, amount: event.target.value }))} className={INPUT_CLASS} /></Field>
                        <Field label="Referencia"><input value={pay.reference} onChange={event => setPay(value => ({ ...value, reference: event.target.value }))} className={INPUT_CLASS} /></Field>
                        <div className="flex items-end gap-2">
                          <button type="button" onClick={cancelPayment} className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-xs">Cancelar</button>
                          <button type="button" disabled={processing} onClick={() => registerPayment(invoice.id)} className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">{processing ? "Guardando..." : "Confirmar"}</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
