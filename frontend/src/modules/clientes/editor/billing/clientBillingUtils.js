/**
 * Archivo: frontend/src/modules/clientes/editor/billing/clientBillingUtils.js
 * Actualización: 2026-09-08 — separación de utilidades de Facturación del cliente.
 * Función: constantes, valores iniciales y metadatos reutilizables sin renderizar UI.
 * Recibe de: ClientBilling.jsx y subcomponentes de billing.
 * Entrega a: estado inicial, formularios y presentación consistente del módulo.
 */

export const DEFAULT_CONFIG = {
  billing_type: "postpaid",
  billing_day: 5,
  billing_invoice_lead_days: 5,
  billing_tax_type: "none",
  billing_grace_days: 5,
  billing_cut_after_months: 1,
  billing_lower_speed: false,
  billing_fixed_date: false,
  billing_fixed_cut: false,
  billing_late_fee: false,
  billing_reconnection_fee: false,
  billing_other_taxes: 0,
  billing_invoice_notification_channel: "none",
  billing_payment_reminder_channel: "none",
  billing_reminder_1_days: 5,
  billing_reminder_2_days: 0,
  billing_reminder_3_days: 0,
  billing_auto_generate: true,
};

export const INPUT_CLASS = "mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500";

export const today = () => new Date().toISOString().slice(0, 10);

export const periodNow = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const statusMeta = status => {
  const map = {
    paid: ["text-emerald-400 bg-emerald-500/10 border-emerald-500/30", "PAGADO"],
    unpaid: ["text-amber-400 bg-amber-500/10 border-amber-500/30", "PENDIENTE"],
    overdue: ["text-rose-400 bg-rose-500/10 border-rose-500/30", "VENCIDO"],
    canceled: ["text-slate-400 bg-slate-500/10 border-slate-500/30", "ANULADO"],
  };
  return map[status] || map.canceled;
};

export const invoiceSortValue = (invoice, key) => {
  if (key === "amount") return Number(invoice?.amount || 0);
  if (key === "status") return statusMeta(invoice?.status)[1];
  return String(invoice?.[key] ?? "").trim().toLocaleLowerCase("es");
};
