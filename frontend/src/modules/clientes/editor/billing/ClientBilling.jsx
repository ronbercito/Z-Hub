/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBilling.jsx
 * Actualización: 2026-09-08 — Configuración por cliente sincronizada con los valores usados durante el registro.
 * Función: coordina datos/API/estado; la UI de filtros, tabla, acciones y saldos vive en submódulos independientes.
 * Recibe de: ClientDetail.jsx mediante el wrapper estable del módulo de Clientes.
 * Entrega a: subcomponentes de billing y configuración de facturación del abonado.
 */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { ArrowLeftRight, CalendarDays, FileText, MessageSquare, Save, Settings2, WalletCards, X, Mail, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";
import ClientBillingFilters from "./ClientBillingFilters";
import ClientBillingTable from "./ClientBillingTable";
import ClientBillingBalances from "./ClientBillingBalances";
import { ClientBillingHeaderActions } from "./ClientBillingActions";
import { DEFAULT_CONFIG, INPUT_CLASS, periodNow, today } from "./clientBillingUtils";

const BILLING_TABS = [
  { key: "invoices", label: "Facturas", Icon: FileText },
  { key: "transactions", label: "Transacciones", Icon: ArrowLeftRight },
  { key: "balances", label: "Saldos", Icon: WalletCards },
  { key: "config", label: "Configuración", Icon: Settings2 },
];

function Field({ label, children }) {
  return <label className="block text-xs text-slate-300"><span className="font-semibold">{label}</span>{children}</label>;
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function billingDates(config) {
  const now = new Date();
  const billingDay = Math.min(Math.max(Number(config?.billing_day || 5), 1), 28);
  let due = new Date(now.getFullYear(), now.getMonth(), billingDay);
  if (due < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  }
  const issue = new Date(due);
  issue.setDate(issue.getDate() - Math.max(Number(config?.billing_invoice_lead_days || 0), 0));
  return { issue_date: toIsoDate(issue), due_date: toIsoDate(due) };
}

export default function ClientBilling({ clientId, onBalanceUpdate }) {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [sendInvoice, setSendInvoice] = useState(null);
  const [sendChannel, setSendChannel] = useState("");
  const [invoice, setInvoice] = useState({ id: null, service_id: "", plan_name: "", amount: "", month_period: periodNow(), issue_date: today(), due_date: "", notes: "" });
  const [sendAddress, setSendAddress] = useState("");
  const [paying, setPaying] = useState(null);
  const [pay, setPay] = useState({ method: "Yape", amount: 0, reference: "", notes: "" });
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG, billing_type: "prepaid" });
  const [configSaving, setConfigSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/clients/${clientId}/invoices`, { headers, params: { status: filter !== "all" ? filter : undefined, search: search || undefined } });
      setInvoices(response.data || []);
    } catch (error) { toast.error("Error al cargar facturas del cliente"); }
    finally { setLoading(false); }
  };
  const loadServices = async () => {
    setServicesLoading(true);
    try {
      const response = await axios.get(`${API}/clients/${clientId}/services`, { headers });
      setServices(response.data || []);
    } catch (error) { toast.error("No se pudieron cargar los servicios"); }
    finally { setServicesLoading(false); }
  };
  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await axios.get(`${API}/clients/${clientId}/billing-config`, { headers });
      const data = response.data || {};
      setConfig(value => ({
        ...value,
        billing_type: data.billing_type || "prepaid",
        billing_day: data.billing_day ?? 5,
        billing_invoice_lead_days: data.invoice_lead_days ?? 5,
        billing_grace_days: data.grace_days ?? 5,
        billing_cut_after_months: data.cut_after_months ?? 1,
        billing_invoice_notification_channel: data.invoice_notification_channel || "none",
        billing_payment_reminder_channel: data.payment_reminder_channel || "none",
        billing_reminder_1_days: data.reminder_1_days ?? 0,
        billing_reminder_2_days: data.reminder_2_days ?? 0,
        billing_reminder_3_days: data.reminder_3_days ?? 0,
      }));
    } catch (error) { toast.error("No se pudo cargar la configuración del abonado"); }
    finally { setConfigLoading(false); }
  };
  useEffect(() => { load(); }, [clientId, filter, search]);
  useEffect(() => { loadServices(); loadConfig(); }, [clientId]);

  const openInvoice = mode => {
    const primary = services.find(service => service.is_primary) || services[0];
    const dates = billingDates(config);
    setModal(mode);
    setInvoice({ id: null, service_id: mode === "service" ? (primary?.service_id || "") : "", plan_name: mode === "service" ? (primary?.plan_name || "") : "", amount: mode === "service" ? (primary?.plan_price ?? "") : "", month_period: periodNow(), issue_date: dates.issue_date, due_date: dates.due_date, notes: mode === "service" ? "Factura de servicio" : "Factura libre" });
  };
  const openEdit = inv => {
    if (inv.status === "paid" || inv.status === "canceled" || Number(inv.paid_amount || 0) > 0) return toast.error("Esta factura está protegida y no se puede editar.");
    setModal("edit");
    setInvoice({ id: inv.id, service_id: inv.service_id || "", plan_name: inv.plan_name || "", amount: inv.amount || "", month_period: inv.month_period || periodNow(), issue_date: inv.issue_date || today(), due_date: inv.due_date || "", notes: inv.notes || "" });
  };
  const chooseService = id => {
    const service = services.find(item => item.service_id === id);
    setInvoice(value => ({ ...value, service_id: id, plan_name: service?.plan_name || "", amount: service?.plan_price ?? "" }));
  };
  const createInvoice = async event => {
    event.preventDefault();
    if (modal === "service" && !invoice.service_id) return toast.error("Selecciona el servicio");
    if (Number(invoice.amount) <= 0) return toast.error("Ingresa un monto válido");
    if (!invoice.due_date) return toast.error("Define la fecha de vencimiento");
    try {
      const response = await axios.post(`${API}/invoices`, { client_id: clientId, service_id: modal === "service" ? invoice.service_id : null, plan_name: invoice.plan_name, amount: Number(invoice.amount), month_period: invoice.month_period, issue_date: invoice.issue_date, due_date: invoice.due_date, status: "unpaid", notes: invoice.notes }, { headers });
      const autoPaid = Number(response.data?.paid_amount || 0) > 0 && response.data?.payment_method === "Saldo a favor";
      toast.success(autoPaid ? `${response.data.invoice_number} generado y pagado con saldo a favor` : `${response.data.invoice_number} generado`);
      setModal(null); await load(); onBalanceUpdate?.();
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo generar la factura"); }
  };
  const saveEdit = async event => {
    event.preventDefault();
    if (!invoice.id) return toast.error("Factura no identificada");
    if (Number(invoice.amount) <= 0) return toast.error("Ingresa un monto válido");
    try {
      const response = await axios.put(`${API}/invoices/${invoice.id}`, { plan_name: invoice.plan_name, amount: Number(invoice.amount), month_period: invoice.month_period, issue_date: invoice.issue_date, due_date: invoice.due_date, notes: invoice.notes }, { headers });
      toast.success(`${response.data.invoice_number} actualizada`); setModal(null); await load(); onBalanceUpdate?.();
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo editar la factura"); }
  };
  const viewPdf = async inv => {
    try {
      const response = await axios.get(`${API}/invoices/${inv.id}/pdf`, { headers, responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/html" }));
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) toast.error("El navegador bloqueó la ventana. Permite ventanas emergentes.");
    } catch (error) { toast.error("No se pudo abrir la factura"); }
  };
  const deleteInvoice = async inv => {
    if (inv.status === "paid" || Number(inv.paid_amount || 0) > 0) return toast.error("Factura protegida: tiene un pago registrado.");
    if (!window.confirm(`¿Eliminar definitivamente la factura ${inv.invoice_number}? Esta acción no se puede deshacer.`)) return;
    try { await axios.delete(`${API}/invoices/${inv.id}/permanent`, { headers }); toast.success("Factura eliminada"); await load(); onBalanceUpdate?.(); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudo eliminar la factura"); }
  };
  const annulInvoice = async inv => {
    if (inv.status === "paid" || Number(inv.paid_amount || 0) > 0) return toast.error("Las facturas pagadas o con pagos están protegidas.");
    if (inv.status === "canceled") return;
    if (!window.confirm(`¿Anular la factura ${inv.invoice_number}? Ya no se podrá usar para cobro.`)) return;
    try { await axios.post(`${API}/invoices/${inv.id}/annul`, {}, { headers }); toast.success("Factura anulada"); await load(); onBalanceUpdate?.(); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudo anular la factura"); }
  };
  const openSend = inv => { setSendInvoice(inv); setSendChannel(""); setSendAddress(""); };
  const chooseSend = async () => {
    if (!sendInvoice || !sendChannel) return;
    if (!sendAddress.trim()) return toast.error(sendChannel === "email" ? "Ingresa el correo del destinatario" : "Ingresa el número de WhatsApp");
    try {
      await axios.post(`${API}/invoices/${sendInvoice.id}/send`, null, { params: { channel: sendChannel }, headers });
      const text = `Hola ${sendInvoice.client_name || ""}. Te enviamos la factura ${sendInvoice.invoice_number}. Servicio: ${sendInvoice.service_label || "Servicio 1"}. Periodo: ${sendInvoice.month_period}. Total: S/. ${Number(sendInvoice.amount || 0).toFixed(2)}. Vencimiento: ${sendInvoice.due_date}.`;
      if (sendChannel === "whatsapp") window.open(`https://wa.me/${sendAddress.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      else window.location.href = `mailto:${sendAddress.trim()}?subject=${encodeURIComponent(`Factura ${sendInvoice.invoice_number}`)}&body=${encodeURIComponent(text)}`;
      setSendInvoice(null);
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo preparar el envío"); }
  };
  const startPayment = inv => { setPaying(inv.id); setPay({ method: "Yape", amount: Number(inv.amount || 0) - Number(inv.paid_amount || 0), reference: "", notes: "" }); };
  const cancelPayment = () => setPaying(null);
  const registerPayment = async id => {
    if (Number(pay.amount) <= 0) return toast.error("Ingresa un monto válido");
    setProcessing(true);
    try {
      const response = await axios.post(`${API}/payments`, { invoice_id: id, amount: Number(pay.amount), payment_method: pay.method, operation_reference: pay.reference || undefined, notes: pay.notes || undefined }, { headers });
      toast.success("Pago registrado correctamente"); setPaying(null); setReceipt(response.data.invoice); await load(); onBalanceUpdate?.();
    } catch (error) { toast.error(error.response?.data?.detail || "Error al registrar pago"); }
    finally { setProcessing(false); }
  };
  const saveConfig = async event => {
    event.preventDefault(); setConfigSaving(true);
    try {
      const payload = {
        billing_type: config.billing_type,
        billing_day: Number(config.billing_day),
        invoice_lead_days: Number(config.billing_invoice_lead_days),
        grace_days: Number(config.billing_grace_days),
        cut_after_months: Number(config.billing_cut_after_months),
        invoice_notification_channel: config.billing_invoice_notification_channel,
        payment_reminder_channel: config.billing_payment_reminder_channel,
        reminder_1_days: Number(config.billing_reminder_1_days || 0) || null,
        reminder_2_days: Number(config.billing_reminder_2_days || 0) || null,
        reminder_3_days: Number(config.billing_reminder_3_days || 0) || null,
      };
      const response = await axios.patch(`${API}/clients/${clientId}/billing-config`, payload, { headers });
      const data = response.data || {};
      setConfig(v => ({ ...v, billing_type: data.billing_type, billing_day: data.billing_day, billing_invoice_lead_days: data.invoice_lead_days, billing_grace_days: data.grace_days, billing_cut_after_months: data.cut_after_months, billing_invoice_notification_channel: data.invoice_notification_channel, billing_payment_reminder_channel: data.payment_reminder_channel, billing_reminder_1_days: data.reminder_1_days ?? 0, billing_reminder_2_days: data.reminder_2_days ?? 0, billing_reminder_3_days: data.reminder_3_days ?? 0 }));
      toast.success("Configuración del abonado guardada");
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo guardar la configuración del abonado"); }
    finally { setConfigSaving(false); }
  };

  const shown = useMemo(() => invoices.filter(item => filter === "all" || item.status === filter), [invoices, filter]);
  const facturado = invoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pagado = invoices.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0);
  const cobrar = invoices.filter(item => !["paid", "canceled"].includes(item.status)).reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.paid_amount || 0)), 0);
  const transactions = invoices.filter(item => Number(item.paid_amount || 0) > 0);
  const preview = billingDates(config);

  return <div className="space-y-5">
    <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/60 p-1.5 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
        {BILLING_TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return <button key={key} type="button" onClick={() => setTab(key)} aria-current={active ? "page" : undefined} className={`group relative flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-black transition-all duration-200 ${active ? "bg-cyan-500/20 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.18)] ring-1 ring-cyan-400/70" : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"}`}><Icon className={`w-5 h-5 transition-transform ${active ? "text-cyan-300 scale-110" : "text-slate-500 group-hover:text-cyan-400"}`} /><span>{label}</span>{active && <span className="absolute inset-x-5 -bottom-1 h-0.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />}</button>;
        })}
      </div>
    </div>

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div><p className="text-[10px] uppercase tracking-[0.22em] font-black text-cyan-400">Facturación</p><h3 className="text-xl font-black text-slate-100 flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-400" /> Facturación del cliente</h3><p className="text-[11px] text-slate-500">Gestiona facturas, pagos, saldos y configuración desde las pestañas superiores.</p></div>
      <ClientBillingHeaderActions openInvoice={openInvoice} setTab={setTab} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="bg-slate-800/50 border border-cyan-500/40 rounded-xl p-4"><p className="text-[10px] text-slate-500 uppercase font-bold">Facturado</p><p className="text-xl font-black mt-1 text-slate-100">S/. {facturado.toFixed(2)}</p></div>
      <div className="bg-emerald-900/20 border border-emerald-500/40 rounded-xl p-4"><p className="text-[10px] text-emerald-400 uppercase font-bold">Pagado</p><p className="text-xl font-black text-emerald-400 mt-1">S/. {pagado.toFixed(2)}</p></div>
      <div className="bg-rose-900/20 border border-rose-500/40 rounded-xl p-4"><p className="text-[10px] text-rose-400 uppercase font-bold">Por cobrar</p><p className="text-xl font-black text-rose-400 mt-1">S/. {cobrar.toFixed(2)}</p></div>
    </div>

    {tab === "invoices" && <><ClientBillingFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} /><ClientBillingTable invoices={shown} loading={loading} openEdit={openEdit} viewPdf={viewPdf} deleteInvoice={deleteInvoice} annulInvoice={annulInvoice} openSend={openSend} startPayment={startPayment} paying={paying} pay={pay} setPay={setPay} cancelPayment={cancelPayment} registerPayment={registerPayment} processing={processing} /></>}
    {tab === "transactions" && <div className="border border-slate-800 rounded-xl overflow-hidden"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-400"><tr><th className="p-3">Fecha</th><th className="p-3">Recibo</th><th className="p-3">Servicio</th><th className="p-3">Método</th><th className="p-3">Referencia</th><th className="p-3 text-right">Monto</th></tr></thead><tbody className="divide-y divide-slate-800">{transactions.length ? transactions.map(item => <tr key={item.id}><td className="p-3">{item.payment_date || "—"}</td><td className="p-3 font-mono font-bold">{item.invoice_number}</td><td className="p-3 text-cyan-300">{item.service_label || "Servicio 1"}</td><td className="p-3">{item.payment_method || "—"}</td><td className="p-3 font-mono text-slate-400">{item.operation_reference || "—"}</td><td className="p-3 text-right font-bold text-emerald-400">S/. {Number(item.paid_amount || 0).toFixed(2)}</td></tr>) : <tr><td colSpan="6" className="p-8 text-center text-slate-500">No hay transacciones registradas.</td></tr>}</tbody></table></div>}
    {tab === "balances" && <ClientBillingBalances clientId={clientId} API={API} headers={headers} onBalanceUpdate={onBalanceUpdate} />}

    {tab === "config" && <form onSubmit={saveConfig} className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4"><CalendarDays className="w-5 h-5 text-cyan-400" /><div><h4 className="font-bold">Configuración de facturación</h4><p className="text-[10px] text-slate-500">Estos valores son del abonado y son los mismos que se guardaron durante su registro.</p></div></div>
        {configLoading ? <div className="py-10 text-center text-slate-500">Cargando configuración del abonado...</div> : <>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Tipo de servicio"><select value={config.billing_type} onChange={e => setConfig(v => ({ ...v, billing_type: e.target.value }))} className={INPUT_CLASS}><option value="prepaid">Prepago (adelantado)</option><option value="postpaid">Postpago</option></select></Field>
            <Field label="Día de pago"><select value={config.billing_day} onChange={e => setConfig(v => ({ ...v, billing_day: Number(e.target.value) }))} className={INPUT_CLASS}>{Array.from({ length: 30 }, (_, index) => index + 1).map(day => <option key={day} value={day}>Día {day} de cada mes</option>)}</select></Field>
            <Field label="Crear factura (días antes)"><select value={config.billing_invoice_lead_days} onChange={e => setConfig(v => ({ ...v, billing_invoice_lead_days: Number(e.target.value) }))} className={INPUT_CLASS}>{Array.from({ length: 20 }, (_, index) => index + 1).map(day => <option key={day} value={day}>{day} día{day !== 1 ? "s" : ""} antes</option>)}</select></Field>
            <Field label="Días de gracia"><select value={config.billing_grace_days} onChange={e => setConfig(v => ({ ...v, billing_grace_days: Number(e.target.value) }))} className={INPUT_CLASS}>{Array.from({ length: 20 }, (_, index) => index + 1).map(day => <option key={day} value={day}>{day} día{day !== 1 ? "s" : ""}</option>)}</select></Field>
            <Field label="Aplicar corte (meses vencidos)"><select value={config.billing_cut_after_months} onChange={e => setConfig(v => ({ ...v, billing_cut_after_months: Number(e.target.value) }))} className={INPUT_CLASS}>{Array.from({ length: 6 }, (_, index) => index + 1).map(month => <option key={month} value={month}>{month} mes{month !== 1 ? "es" : ""} vencido{month !== 1 ? "s" : ""}</option>)}</select></Field>
          </div>
          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[11px] text-slate-300"><b className="text-cyan-300">Próxima regla calculada:</b> factura desde <span className="font-mono">{preview.issue_date}</span> y vencimiento <span className="font-mono">{preview.due_date}</span>. Después del vencimiento se respetan los <b>{config.billing_grace_days}</b> días de gracia y el corte se evalúa con <b>{config.billing_cut_after_months}</b> mes(es) vencido(s).</div>
        </>}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-emerald-400" /><div><h4 className="font-bold">Envío de mensajes</h4><p className="text-[10px] text-slate-500">El canal y los días quedan asociados a este abonado, no a la configuración global.</p></div></div>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Aviso de nueva factura"><select value={config.billing_invoice_notification_channel} onChange={e => setConfig(v => ({ ...v, billing_invoice_notification_channel: e.target.value }))} className={INPUT_CLASS}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field>
          <Field label="Recordatorios de pago"><select value={config.billing_payment_reminder_channel} onChange={e => setConfig(v => ({ ...v, billing_payment_reminder_channel: e.target.value }))} className={INPUT_CLASS}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field>
          <Field label="Recordatorio #1 (días)"><input type="number" min="0" max="20" value={config.billing_reminder_1_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_1_days: e.target.value }))} className={INPUT_CLASS} /></Field>
          <Field label="Recordatorio #2 (días)"><input type="number" min="0" max="20" value={config.billing_reminder_2_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_2_days: e.target.value }))} className={INPUT_CLASS} /></Field>
          <Field label="Recordatorio #3 (días)"><input type="number" min="0" max="20" value={config.billing_reminder_3_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_3_days: e.target.value }))} className={INPUT_CLASS} /></Field>
        </div>
      </div>
      <div className="flex justify-end"><button disabled={configSaving || configLoading} className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4" />{configSaving ? "Guardando..." : "Guardar configuración"}</button></div>
    </form>}

    {modal && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={modal === "edit" ? saveEdit : createInvoice} className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"><div className="flex justify-between"><div><h4 className="font-bold">{modal === "edit" ? "Editar factura" : modal === "service" ? "Factura de servicios" : "Factura libre"}</h4><p className="text-[10px] text-slate-500">Cliente: este abonado</p></div><button type="button" onClick={() => setModal(null)}><X className="w-4 h-4" /></button></div>{modal === "service" && <Field label="Servicio"><select required value={invoice.service_id} onChange={e => chooseService(e.target.value)} className={INPUT_CLASS}><option value="">{servicesLoading ? "Cargando..." : "Selecciona un servicio"}</option>{services.map((service, index) => <option key={service.service_id} value={service.service_id}>{service.is_primary ? "Servicio 1" : `Servicio ${index + 1}`} · {service.plan_name || "Sin plan"} · S/. {Number(service.plan_price || 0).toFixed(2)}</option>)}</select></Field>}<div className="grid md:grid-cols-2 gap-3"><Field label="Plan / concepto"><input value={invoice.plan_name} onChange={e => setInvoice(v => ({ ...v, plan_name: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Monto"><input required type="number" step="0.01" min="0.01" value={invoice.amount} onChange={e => setInvoice(v => ({ ...v, amount: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Período"><input value={invoice.month_period} onChange={e => setInvoice(v => ({ ...v, month_period: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Fecha emisión"><input type="date" value={invoice.issue_date} onChange={e => setInvoice(v => ({ ...v, issue_date: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Vencimiento"><input type="date" value={invoice.due_date} onChange={e => setInvoice(v => ({ ...v, due_date: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Notas"><input value={invoice.notes} onChange={e => setInvoice(v => ({ ...v, notes: e.target.value }))} className={INPUT_CLASS} /></Field></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs">Cancelar</button><button className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">{modal === "edit" ? "Guardar cambios" : "Generar factura"}</button></div></form></div>}

    {sendInvoice && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"><div className="flex justify-between items-start"><div><h4 className="font-bold text-slate-100">Enviar factura</h4><p className="text-[10px] text-slate-500">{sendInvoice.invoice_number} · {sendInvoice.service_label || "Servicio 1"}</p></div><button type="button" onClick={() => setSendInvoice(null)}><X className="w-4 h-4" /></button></div>{!sendChannel ? <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => { setSendChannel("email"); setSendAddress(""); }} className="p-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-left"><Mail className="w-5 h-5 text-cyan-400 mb-2" /><b className="text-xs">Correo</b><p className="text-[10px] text-slate-500 mt-1">Abrir correo con el mensaje preparado</p></button><button type="button" onClick={() => { setSendChannel("whatsapp"); setSendAddress(sendInvoice.client_phone || ""); }} className="p-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 text-left"><Smartphone className="w-5 h-5 text-emerald-400 mb-2" /><b className="text-xs">WhatsApp</b><p className="text-[10px] text-slate-500 mt-1">Abrir WhatsApp con el mensaje preparado</p></button></div> : <div><Field label={sendChannel === "email" ? "Correo del destinatario" : "Número de WhatsApp con código de país"}><input autoFocus value={sendAddress} onChange={e => setSendAddress(e.target.value)} placeholder={sendChannel === "email" ? "cliente@correo.com" : "51999999999"} className={INPUT_CLASS} /></Field><div className="flex gap-2 mt-3"><button type="button" onClick={() => setSendChannel("")} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-xs">Atrás</button><button type="button" onClick={chooseSend} className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold">Enviar</button></div></div>}</div></div>}

    {receipt && <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"><div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md"><div className="flex justify-between border-b pb-3 mb-4"><h4 className="font-bold">Recibo {receipt.invoice_number}</h4><button type="button" onClick={() => setReceipt(null)}>✕</button></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Cliente</span><b>{receipt.client_name}</b></div><div className="flex justify-between"><span>Servicio</span><b>{receipt.service_label || "Servicio 1"}</b></div><div className="flex justify-between"><span>Período</span><b>{receipt.month_period}</b></div><div className="flex justify-between"><span>Monto</span><b>S/. {Number(receipt.amount || 0).toFixed(2)}</b></div><div className="flex justify-between"><span>Método</span><b>{receipt.payment_method || "—"}</b></div><div className="flex justify-between text-emerald-700"><span>Estado</span><b>{receipt.status === "paid" ? "PAGADO" : "PENDIENTE"}</b></div></div><button type="button" onClick={() => window.print()} className="mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"><Printer className="w-4 h-4 inline mr-1" />Imprimir</button></div></div>}
  </div>;
}
