/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBilling.jsx
 * Actualización: 2026-09-08 — integra Facturación con el submódulo aislado de Saldos.
 * Función: coordina datos/API/estado; la UI de filtros, tabla, acciones y saldos vive en submódulos independientes.
 * Recibe de: ClientDetail.jsx mediante el wrapper estable del módulo de Clientes.
 * Entrega a: subcomponentes de billing y endpoints existentes.
 */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { DollarSign, CalendarDays, MessageSquare, Save, X, Mail, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";
import ClientBillingFilters from "./ClientBillingFilters";
import ClientBillingTable from "./ClientBillingTable";
import ClientBillingBalances from "./ClientBillingBalances";
import { ClientBillingHeaderActions } from "./ClientBillingActions";
import { DEFAULT_CONFIG, INPUT_CLASS, periodNow, today } from "./clientBillingUtils";

function Field({ label, children }) {
  return <label className="block text-xs text-slate-300"><span className="font-semibold">{label}</span>{children}</label>;
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
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configSaving, setConfigSaving] = useState(false);

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
    try {
      const response = await axios.get(`${API}/settings`, { headers });
      setConfig({ ...DEFAULT_CONFIG, ...(response.data || {}) });
    } catch (error) { toast.error("No se pudo cargar la configuración"); }
  };
  useEffect(() => { load(); }, [clientId, filter, search]);
  useEffect(() => { loadServices(); loadConfig(); }, [clientId]);

  const openInvoice = mode => {
    const primary = services.find(service => service.is_primary) || services[0];
    setModal(mode);
    setInvoice({ id: null, service_id: mode === "service" ? (primary?.service_id || "") : "", plan_name: mode === "service" ? (primary?.plan_name || "") : "", amount: mode === "service" ? (primary?.plan_price ?? "") : "", month_period: periodNow(), issue_date: today(), due_date: "", notes: mode === "service" ? "Factura de servicio" : "Factura libre" });
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
    try { const response = await axios.put(`${API}/settings`, config, { headers }); setConfig({ ...DEFAULT_CONFIG, ...(response.data || {}) }); toast.success("Configuración guardada"); }
    catch (error) { toast.error(error.response?.data?.detail || "No se pudo guardar"); }
    finally { setConfigSaving(false); }
  };

  const shown = useMemo(() => invoices.filter(item => filter === "all" || item.status === filter), [invoices, filter]);
  const facturado = invoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pagado = invoices.reduce((sum, item) => sum + Number(item.paid_amount || 0), 0);
  const cobrar = invoices.filter(item => !["paid", "canceled"].includes(item.status)).reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.paid_amount || 0)), 0);
  const transactions = invoices.filter(item => Number(item.paid_amount || 0) > 0);

  return <div className="space-y-4">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" /> Facturación del cliente</h3><p className="text-[11px] text-slate-500">Toda la cobranza queda ligada a este cliente y a su servicio.</p></div><ClientBillingHeaderActions openInvoice={openInvoice} setTab={setTab} /></div>
    <div className="grid grid-cols-3 gap-3"><div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase font-bold">Facturado</p><p className="text-lg font-black mt-1">S/. {facturado.toFixed(2)}</p></div><div className="bg-emerald-900/20 border border-emerald-500/40 rounded-xl p-3"><p className="text-[10px] text-emerald-400 uppercase font-bold">Pagado</p><p className="text-lg font-black text-emerald-400 mt-1">S/. {pagado.toFixed(2)}</p></div><div className="bg-rose-900/20 border border-rose-500/40 rounded-xl p-3"><p className="text-[10px] text-rose-400 uppercase font-bold">Por cobrar</p><p className="text-lg font-black text-rose-400 mt-1">S/. {cobrar.toFixed(2)}</p></div></div>
    <div className="flex gap-1 overflow-x-auto border-b border-slate-800">{[["invoices", "Facturas"], ["transactions", "Transacciones"], ["balances", "Saldos"], ["config", "Configuración"]].map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap ${tab === key ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500"}`}>{label}</button>)}</div>

    {tab === "invoices" && <><ClientBillingFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} /><ClientBillingTable invoices={shown} loading={loading} openEdit={openEdit} viewPdf={viewPdf} deleteInvoice={deleteInvoice} annulInvoice={annulInvoice} openSend={openSend} startPayment={startPayment} paying={paying} pay={pay} setPay={setPay} cancelPayment={cancelPayment} registerPayment={registerPayment} processing={processing} /></>}
    {tab === "transactions" && <div className="border border-slate-800 rounded-xl overflow-hidden"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-400"><tr><th className="p-3">Fecha</th><th className="p-3">Recibo</th><th className="p-3">Servicio</th><th className="p-3">Método</th><th className="p-3">Referencia</th><th className="p-3 text-right">Monto</th></tr></thead><tbody className="divide-y divide-slate-800">{transactions.length ? transactions.map(item => <tr key={item.id}><td className="p-3">{item.payment_date || "—"}</td><td className="p-3 font-mono font-bold">{item.invoice_number}</td><td className="p-3 text-cyan-300">{item.service_label || "Servicio 1"}</td><td className="p-3">{item.payment_method || "—"}</td><td className="p-3 font-mono text-slate-400">{item.operation_reference || "—"}</td><td className="p-3 text-right font-bold text-emerald-400">S/. {Number(item.paid_amount || 0).toFixed(2)}</td></tr>) : <tr><td colSpan="6" className="p-8 text-center text-slate-500">No hay transacciones registradas.</td></tr>}</tbody></table></div>}
    {tab === "balances" && <ClientBillingBalances clientId={clientId} API={API} headers={headers} onBalanceUpdate={onBalanceUpdate} />}

    {tab === "config" && <form onSubmit={saveConfig} className="space-y-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2 mb-4"><CalendarDays className="w-5 h-5 text-cyan-400" /><div><h4 className="font-bold">Configuración de facturación</h4><p className="text-[10px] text-slate-500">Las reglas son generales del ISP y quedan disponibles desde la ficha del cliente.</p></div></div><div className="grid md:grid-cols-2 gap-4"><Field label="Tipo"><select value={config.billing_type} onChange={e => setConfig(v => ({ ...v, billing_type: e.target.value }))} className={INPUT_CLASS}><option value="postpaid">Postpago (Vencido)</option><option value="prepaid">Prepago</option></select></Field><Field label="Día pago"><input type="number" min="1" max="28" value={config.billing_day} onChange={e => setConfig(v => ({ ...v, billing_day: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Crear factura (días antes)"><input type="number" min="0" value={config.billing_invoice_lead_days} onChange={e => setConfig(v => ({ ...v, billing_invoice_lead_days: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Tipo impuesto"><select value={config.billing_tax_type} onChange={e => setConfig(v => ({ ...v, billing_tax_type: e.target.value }))} className={INPUT_CLASS}><option value="none">Sin impuesto</option><option value="igv">IGV</option><option value="other">Otro</option></select></Field><Field label="Días de gracia"><input type="number" min="0" value={config.billing_grace_days} onChange={e => setConfig(v => ({ ...v, billing_grace_days: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Aplicar corte (meses vencidos)"><input type="number" min="1" value={config.billing_cut_after_months} onChange={e => setConfig(v => ({ ...v, billing_cut_after_months: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Otros impuestos"><input type="number" step="0.01" min="0" value={config.billing_other_taxes} onChange={e => setConfig(v => ({ ...v, billing_other_taxes: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Aviso nueva factura"><select value={config.billing_invoice_notification_channel} onChange={e => setConfig(v => ({ ...v, billing_invoice_notification_channel: e.target.value }))} className={INPUT_CLASS}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field><Field label="Recordatorios"><select value={config.billing_payment_reminder_channel} onChange={e => setConfig(v => ({ ...v, billing_payment_reminder_channel: e.target.value }))} className={INPUT_CLASS}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field><Field label="Recordatorio #1"><input type="number" min="0" value={config.billing_reminder_1_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_1_days: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Recordatorio #2"><input type="number" min="0" value={config.billing_reminder_2_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_2_days: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Recordatorio #3"><input type="number" min="0" value={config.billing_reminder_3_days} onChange={e => setConfig(v => ({ ...v, billing_reminder_3_days: e.target.value }))} className={INPUT_CLASS} /></Field></div></div><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-emerald-400" /><h4 className="font-bold">Reglas adicionales</h4></div><div className="grid md:grid-cols-2 gap-2">{[["billing_lower_speed", "Bajar velocidad"], ["billing_fixed_date", "Fecha fija"], ["billing_fixed_cut", "Corte fijo programado"], ["billing_late_fee", "Aplicar mora"], ["billing_reconnection_fee", "Aplicar reconexión"], ["billing_auto_generate", "Generar automáticamente"]].map(([key, label]) => <label key={key} className="flex justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"><span>{label}</span><input type="checkbox" checked={Boolean(config[key])} onChange={e => setConfig(v => ({ ...v, [key]: e.target.checked }))} /></label>)}</div></div><div className="flex justify-end"><button disabled={configSaving} className="px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4" />{configSaving ? "Guardando..." : "Guardar configuración"}</button></div></form>}

    {modal && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={modal === "edit" ? saveEdit : createInvoice} className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"><div className="flex justify-between"><div><h4 className="font-bold">{modal === "edit" ? "Editar factura" : modal === "service" ? "Factura de servicios" : "Factura libre"}</h4><p className="text-[10px] text-slate-500">Cliente: este abonado</p></div><button type="button" onClick={() => setModal(null)}><X className="w-4 h-4" /></button></div>{modal === "service" && <Field label="Servicio"><select required value={invoice.service_id} onChange={e => chooseService(e.target.value)} className={INPUT_CLASS}><option value="">{servicesLoading ? "Cargando..." : "Selecciona un servicio"}</option>{services.map((service, index) => <option key={service.service_id} value={service.service_id}>{service.is_primary ? "Servicio 1" : `Servicio ${index + 1}`} · {service.plan_name || "Sin plan"} · S/. {Number(service.plan_price || 0).toFixed(2)}</option>)}</select></Field>}<div className="grid md:grid-cols-2 gap-3"><Field label="Plan / concepto"><input value={invoice.plan_name} onChange={e => setInvoice(v => ({ ...v, plan_name: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Monto"><input required type="number" step="0.01" min="0.01" value={invoice.amount} onChange={e => setInvoice(v => ({ ...v, amount: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Período"><input value={invoice.month_period} onChange={e => setInvoice(v => ({ ...v, month_period: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Fecha emisión"><input type="date" value={invoice.issue_date} onChange={e => setInvoice(v => ({ ...v, issue_date: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Vencimiento"><input type="date" value={invoice.due_date} onChange={e => setInvoice(v => ({ ...v, due_date: e.target.value }))} className={INPUT_CLASS} /></Field><Field label="Notas"><input value={invoice.notes} onChange={e => setInvoice(v => ({ ...v, notes: e.target.value }))} className={INPUT_CLASS} /></Field></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs">Cancelar</button><button className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">{modal === "edit" ? "Guardar cambios" : "Generar factura"}</button></div></form></div>}

    {sendInvoice && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"><div className="flex justify-between items-start"><div><h4 className="font-bold text-slate-100">Enviar factura</h4><p className="text-[10px] text-slate-500">{sendInvoice.invoice_number} · {sendInvoice.service_label || "Servicio 1"}</p></div><button type="button" onClick={() => setSendInvoice(null)}><X className="w-4 h-4" /></button></div>{!sendChannel ? <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => { setSendChannel("email"); setSendAddress(""); }} className="p-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-left"><Mail className="w-5 h-5 text-cyan-400 mb-2" /><b className="text-xs">Correo</b><p className="text-[10px] text-slate-500 mt-1">Abrir correo con el mensaje preparado</p></button><button type="button" onClick={() => { setSendChannel("whatsapp"); setSendAddress(sendInvoice.client_phone || ""); }} className="p-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-500 text-left"><Smartphone className="w-5 h-5 text-emerald-400 mb-2" /><b className="text-xs">WhatsApp</b><p className="text-[10px] text-slate-500 mt-1">Abrir WhatsApp con el mensaje preparado</p></button></div> : <div><Field label={sendChannel === "email" ? "Correo del destinatario" : "Número de WhatsApp con código de país"}><input autoFocus value={sendAddress} onChange={e => setSendAddress(e.target.value)} placeholder={sendChannel === "email" ? "cliente@correo.com" : "51999999999"} className={INPUT_CLASS} /></Field><div className="flex gap-2 mt-3"><button type="button" onClick={() => setSendChannel("")} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-xs">Atrás</button><button type="button" onClick={chooseSend} className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold">Enviar</button></div></div>}</div></div>}

    {receipt && <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"><div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-md"><div className="flex justify-between border-b pb-3 mb-4"><h4 className="font-bold">Recibo {receipt.invoice_number}</h4><button type="button" onClick={() => setReceipt(null)}>✕</button></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Cliente</span><b>{receipt.client_name}</b></div><div className="flex justify-between"><span>Servicio</span><b>{receipt.service_label || "Servicio 1"}</b></div><div className="flex justify-between"><span>Período</span><b>{receipt.month_period}</b></div><div className="flex justify-between"><span>Monto</span><b>S/. {Number(receipt.amount || 0).toFixed(2)}</b></div><div className="flex justify-between"><span>Método</span><b>{receipt.payment_method || "—"}</b></div><div className="flex justify-between text-emerald-700"><span>Estado</span><b>{receipt.status === "paid" ? "PAGADO" : "PENDIENTE"}</b></div></div><button type="button" onClick={() => window.print()} className="mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"><Printer className="w-4 h-4 inline mr-1" />Imprimir</button></div></div>}
  </div>;
}
