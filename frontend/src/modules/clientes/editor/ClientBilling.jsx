"""
Archivo: frontend/src/modules/clientes/editor/ClientBilling.jsx
Actualización: 2026-09-08 — facturación completa ligada a la ficha del cliente.
Función: muestra facturas por servicio, permite factura libre o de servicio, registrar pagos,
         consultar transacciones y saldos, y editar las reglas generales de facturación.
Recibe de: ClientDetail.jsx (client_id), backend /api/clients/{id}/invoices, /api/clients/{id}/services,
           /api/invoices, /api/payments y /api/settings.
Entrega a: la ficha del cliente el estado actualizado de deuda y al backend los recibos/pagos ligados al cliente.
"""
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  DollarSign, CheckCircle2, Clock, AlertTriangle, Printer, Plus, Search, Loader,
  Settings, Save, MessageSquare, CalendarDays, Receipt, ArrowDownCircle, Wallet
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CONFIG = {
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

const today = () => new Date().toISOString().slice(0, 10);
const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function ClientBilling({ clientId, onBalanceUpdate }) {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState("service");
  const [invoiceData, setInvoiceData] = useState({
    service_id: "",
    plan_name: "",
    amount: "",
    month_period: periodNow(),
    issue_date: today(),
    due_date: "",
    notes: "",
  });
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [payData, setPayData] = useState({ method: "Yape", amount: 0, reference: "", notes: "" });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/clients/${clientId}/invoices`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined }, headers
      });
      setInvoices(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar las facturas del cliente");
    } finally { setLoading(false); }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await axios.get(`${API}/clients/${clientId}/services`, { headers });
      setServices(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron cargar los servicios del cliente");
    } finally { setServicesLoading(false); }
  };

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await axios.get(`${API}/settings`, { headers });
      setConfig({ ...DEFAULT_CONFIG, ...(res.data || {}) });
    } catch (e) {
      console.error(e);
      toast.error("No se pudo cargar la configuración");
    } finally { setConfigLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [clientId, statusFilter, search]);
  useEffect(() => { fetchServices(); fetchConfig(); }, [clientId]);

  const openInvoice = (mode) => {
    setInvoiceMode(mode);
    const firstService = services.find(s => !s.is_primary);
    setInvoiceData({
      service_id: mode === "service" ? (firstService?.service_id || "") : "",
      plan_name: mode === "service" ? (firstService?.plan_name || "") : "",
      amount: mode === "service" ? (firstService?.plan_price ?? "") : "",
      month_period: periodNow(), issue_date: today(), due_date: "", notes: mode === "service" ? "Factura de servicio" : "Factura libre",
    });
    setShowInvoiceModal(true);
  };

  const selectService = (id) => {
    const service = services.find(s => s.service_id === id);
    setInvoiceData(v => ({ ...v, service_id: id, plan_name: service?.plan_name || "", amount: service?.plan_price ?? "" }));
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    if (invoiceMode === "service" && !invoiceData.service_id) {
      toast.error("Selecciona el servicio que se cobrará");
      return;
    }
    if (Number(invoiceData.amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    try {
      const payload = {
        client_id: clientId,
        service_id: invoiceMode === "service" ? invoiceData.service_id : null,
        plan_name: invoiceData.plan_name,
        amount: Number(invoiceData.amount),
        month_period: invoiceData.month_period,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: "unpaid",
        notes: invoiceData.notes,
      };
      const res = await axios.post(`${API}/invoices`, payload, { headers });
      toast.success(`${res.data.invoice_number} generado para el cliente`);
      setShowInvoiceModal(false);
      await fetchInvoices();
      if (onBalanceUpdate) onBalanceUpdate();
    } catch (e) { toast.error(e.response?.data?.detail || "No se pudo generar la factura"); }
  };

  const handlePayment = async (invoiceId) => {
    if (!payData.amount || Number(payData.amount) <= 0) return toast.error("Ingresa un monto válido");
    setPaymentProcessing(true);
    try {
      const res = await axios.post(`${API}/payments`, {
        invoice_id: invoiceId,
        amount: Number(payData.amount),
        payment_method: payData.method,
        operation_reference: payData.reference || undefined,
        notes: payData.notes || undefined,
      }, { headers });
      toast.success("Pago registrado correctamente");
      setPayingInvoiceId(null);
      setPayData({ method: "Yape", amount: 0, reference: "", notes: "" });
      setViewingReceipt(res.data.invoice);
      await fetchInvoices();
      if (onBalanceUpdate) onBalanceUpdate();
    } catch (e) { toast.error(e.response?.data?.detail || "Error al registrar pago"); }
    finally { setPaymentProcessing(false); }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const payload = {
        billing_type: config.billing_type,
        billing_day: Number(config.billing_day),
        billing_invoice_lead_days: Number(config.billing_invoice_lead_days),
        billing_tax_type: config.billing_tax_type,
        billing_grace_days: Number(config.billing_grace_days),
        billing_cut_after_months: Number(config.billing_cut_after_months),
        billing_lower_speed: Boolean(config.billing_lower_speed),
        billing_fixed_date: Boolean(config.billing_fixed_date),
        billing_fixed_cut: Boolean(config.billing_fixed_cut),
        billing_late_fee: Boolean(config.billing_late_fee),
        billing_reconnection_fee: Boolean(config.billing_reconnection_fee),
        billing_other_taxes: Number(config.billing_other_taxes || 0),
        billing_invoice_notification_channel: config.billing_invoice_notification_channel,
        billing_payment_reminder_channel: config.billing_payment_reminder_channel,
        billing_reminder_1_days: Number(config.billing_reminder_1_days || 0),
        billing_reminder_2_days: Number(config.billing_reminder_2_days || 0),
        billing_reminder_3_days: Number(config.billing_reminder_3_days || 0),
        billing_auto_generate: Boolean(config.billing_auto_generate),
      };
      const res = await axios.put(`${API}/settings`, payload, { headers });
      setConfig({ ...DEFAULT_CONFIG, ...(res.data || {}) });
      toast.success("Configuración de facturación guardada");
    } catch (e) { toast.error(e.response?.data?.detail || "No se pudo guardar la configuración"); }
    finally { setConfigSaving(false); }
  };

  const filteredInvoices = useMemo(() => invoices.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return String(inv.invoice_number || "").toLowerCase().includes(s) || String(inv.month_period || "").toLowerCase().includes(s) || String(inv.service_label || "").toLowerCase().includes(s);
  }), [invoices, statusFilter, search]);

  const totalInvoiced = invoices.reduce((a, i) => a + Number(i.amount || 0), 0);
  const totalPaid = invoices.reduce((a, i) => a + Number(i.paid_amount || 0), 0);
  const totalPending = invoices.filter(i => i.status !== "paid" && i.status !== "canceled").reduce((a, i) => a + Math.max(0, Number(i.amount || 0) - Number(i.paid_amount || 0)), 0);
  const transactions = invoices.filter(i => Number(i.paid_amount || 0) > 0).sort((a, b) => String(b.payment_date || "").localeCompare(String(a.payment_date || "")));
  const overdue = invoices.filter(i => i.status === "overdue");

  const statusBadge = (status) => {
    const cfg = {
      paid: ["bg-emerald-500/20 border-emerald-500/40 text-emerald-400", CheckCircle2, "PAGADO"],
      unpaid: ["bg-amber-500/20 border-amber-500/40 text-amber-400", Clock, "PENDIENTE"],
      overdue: ["bg-rose-500/20 border-rose-500/40 text-rose-400", AlertTriangle, "VENCIDO"],
      canceled: ["bg-slate-500/20 border-slate-500/40 text-slate-400", AlertTriangle, "ANULADO"],
    }[status] || ["bg-slate-500/20 border-slate-500/40 text-slate-400", Clock, status || "PENDIENTE"];
    const Icon = cfg[1];
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${cfg[0]}`}><Icon className="w-3 h-3" />{cfg[2]}</span>;
  };

  const Field = ({ label, children }) => <label className="block text-xs text-slate-300"><span className="font-semibold">{label}</span>{children}</label>;
  const inputClass = "mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" /> Facturación del cliente</h3>
          <p className="text-[11px] text-slate-500">Facturas, pagos y saldos vinculados directamente a este abonado.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => openInvoice("free")} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Factura libre</button>
          <button onClick={() => openInvoice("service")} className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Factura de servicios</button>
          <button onClick={() => setActiveTab("config")} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Configuración</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase font-bold">Facturado</p><p className="text-lg font-black text-slate-100 mt-1">S/. {totalInvoiced.toFixed(2)}</p></div>
        <div className="bg-emerald-900/20 border border-emerald-500/40 rounded-xl p-3"><p className="text-[10px] text-emerald-400 uppercase font-bold">Pagado</p><p className="text-lg font-black text-emerald-400 mt-1">S/. {totalPaid.toFixed(2)}</p></div>
        <div className="bg-rose-900/20 border border-rose-500/40 rounded-xl p-3"><p className="text-[10px] text-rose-400 uppercase font-bold">Por cobrar</p><p className="text-lg font-black text-rose-400 mt-1">S/. {totalPending.toFixed(2)}</p></div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-800">
        {["invoices", "transactions", "balances", "config"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 py-2 text-xs font-bold border-b-2 ${activeTab === tab ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
            {tab === "invoices" ? "Facturas" : tab === "transactions" ? "Transacciones" : tab === "balances" ? "Saldos" : "Configuración"}
          </button>
        ))}
      </div>

      {activeTab === "invoices" && <>
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar recibo, período o servicio..." className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100" /></div>
          <div className="flex gap-1 flex-wrap">{[["all","Todos"],["paid","Pagados"],["unpaid","Pendientes"],["overdue","Vencidos"]].map(([key,label]) => <button key={key} onClick={() => setStatusFilter(key)} className={`px-3 py-2 rounded-xl text-xs font-bold ${statusFilter === key ? "bg-cyan-500 text-white" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>{label}</button>)}</div>
        </div>
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-400"><tr><th className="p-3">Recibo</th><th className="p-3">Servicio</th><th className="p-3">Período</th><th className="p-3 text-right">Monto</th><th className="p-3">Vencimiento</th><th className="p-3">Estado</th><th className="p-3 text-center">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-800">{loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Cargando...</td></tr> : filteredInvoices.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">No hay facturas para este cliente.</td></tr> : filteredInvoices.map(inv => <React.Fragment key={inv.id}><tr className="hover:bg-slate-800/30"><td className="p-3 font-mono font-bold text-slate-100">{inv.invoice_number}</td><td className="p-3 text-cyan-300 font-semibold">{inv.service_label || "Servicio 1"}</td><td className="p-3 text-slate-300">{inv.month_period}</td><td className="p-3 text-right font-bold">S/. {Number(inv.amount || 0).toFixed(2)}</td><td className="p-3 text-slate-400">{inv.due_date}</td><td className="p-3">{statusBadge(inv.status)}</td><td className="p-3"><div className="flex justify-center gap-1">{inv.status !== "paid" && inv.status !== "canceled" ? <button onClick={() => { setPayingInvoiceId(inv.id); setPayData({ method: "Yape", amount: Number(inv.amount || 0) - Number(inv.paid_amount || 0), reference: "", notes: "" }); }} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"><DollarSign className="w-3 h-3" /> Pagar</button> : <button onClick={() => setViewingReceipt(inv)} className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-bold flex items-center gap-1"><Printer className="w-3 h-3" /> Ver</button>}</div></td></tr>
              {payingInvoiceId === inv.id && <tr className="bg-slate-950"><td colSpan="7" className="p-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><div><p className="text-[10px] text-slate-500 mb-1">Método</p><select value={payData.method} onChange={e => setPayData(v => ({...v, method:e.target.value}))} className={inputClass}><option>Yape</option><option>Plin</option><option>Efectivo</option><option>Transferencia BCP</option><option>BBVA</option><option>Interbank</option></select></div><div><p className="text-[10px] text-slate-500 mb-1">Monto</p><input type="number" step="0.01" value={payData.amount} onChange={e => setPayData(v => ({...v, amount:e.target.value}))} className={inputClass} /></div><div><p className="text-[10px] text-slate-500 mb-1">Referencia</p><input value={payData.reference} onChange={e => setPayData(v => ({...v, reference:e.target.value}))} className={inputClass} placeholder="OP-123456" /></div><div className="flex items-end gap-2"><button onClick={() => setPayingInvoiceId(null)} className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">Cancelar</button><button disabled={paymentProcessing} onClick={() => handlePayment(inv.id)} className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">{paymentProcessing ? <Loader className="w-3 h-3 animate-spin inline" /> : "Confirmar"}</button></div></div></td></tr>}</React.Fragment>)}</tbody>
          </table></div>
        </div>
      </>}

      {activeTab === "transactions" && <div className="border border-slate-800 rounded-xl overflow-hidden"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-400"><tr><th className="p-3">Fecha</th><th className="p-3">Recibo</th><th className="p-3">Servicio</th><th className="p-3">Método</th><th className="p-3">Referencia</th><th className="p-3 text-right">Monto</th></tr></thead><tbody className="divide-y divide-slate-800">{transactions.length ? transactions.map(i => <tr key={i.id}><td className="p-3 text-slate-400">{i.payment_date || "—"}</td><td className="p-3 font-mono font-bold">{i.invoice_number}</td><td className="p-3 text-cyan-300">{i.service_label || "Servicio 1"}</td><td className="p-3">{i.payment_method || "—"}</td><td className="p-3 font-mono text-slate-400">{i.operation_reference || "—"}</td><td className="p-3 text-right font-bold text-emerald-400">S/. {Number(i.paid_amount || 0).toFixed(2)}</td></tr>) : <tr><td colSpan="6" className="p-8 text-center text-slate-500">No hay transacciones registradas.</td></tr>}</tbody></table></div>}

      {activeTab === "balances" && <div className="grid md:grid-cols-2 gap-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h4 className="font-bold text-slate-100 flex items-center gap-2"><Wallet className="w-4 h-4 text-cyan-400" /> Resumen de saldos</h4><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-400">Total facturado</span><b>S/. {totalInvoiced.toFixed(2)}</b></div><div className="flex justify-between text-emerald-400"><span>Total pagado</span><b>S/. {totalPaid.toFixed(2)}</b></div><div className="flex justify-between text-rose-400 border-t border-slate-800 pt-3"><span>Saldo por cobrar</span><b>S/. {totalPending.toFixed(2)}</b></div><div className="flex justify-between text-amber-400"><span>Recibos vencidos</span><b>{overdue.length}</b></div></div></div><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h4 className="font-bold text-slate-100 mb-3">Deuda por servicio</h4><div className="space-y-2">{["Servicio 1", ...services.filter(s => !s.is_primary).map(s => `Servicio ${services.indexOf(s) + 1}`)].map(label => { const amount = invoices.filter(i => (i.service_label || "Servicio 1") === label && i.status !== "paid" && i.status !== "canceled").reduce((a,i) => a + Math.max(0, Number(i.amount || 0) - Number(i.paid_amount || 0)),0); return <div key={label} className="flex justify-between px-3 py-2 rounded-lg bg-slate-950"><span className="text-slate-400">{label}</span><b className={amount ? "text-rose-400" : "text-emerald-400"}>S/. {amount.toFixed(2)}</b></div>; })}</div></div></div>}

      {activeTab === "config" && <form onSubmit={saveConfig} className="space-y-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4"><CalendarDays className="w-5 h-5 text-cyan-400" /><div><h4 className="font-bold text-slate-100">Configuración de facturación</h4><p className="text-[10px] text-slate-500">Estas reglas son generales del ISP; desde esta ficha se pueden consultar y modificar.</p></div></div>{configLoading ? <div className="p-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline mr-2" />Cargando...</div> : <div className="grid md:grid-cols-2 gap-4"><Field label="Tipo"><select value={config.billing_type} onChange={e => setConfig(v=>({...v,billing_type:e.target.value}))} className={inputClass}><option value="postpaid">Postpago (Vencido)</option><option value="prepaid">Prepago</option></select></Field><Field label="Día de pago"><input type="number" min="1" max="28" value={config.billing_day} onChange={e=>setConfig(v=>({...v,billing_day:e.target.value}))} className={inputClass}/></Field><Field label="Crear factura (días antes)"><input type="number" min="0" max="30" value={config.billing_invoice_lead_days} onChange={e=>setConfig(v=>({...v,billing_invoice_lead_days:e.target.value}))} className={inputClass}/></Field><Field label="Tipo impuesto"><select value={config.billing_tax_type} onChange={e=>setConfig(v=>({...v,billing_tax_type:e.target.value}))} className={inputClass}><option value="none">Sin impuesto</option><option value="igv">IGV</option><option value="other">Otro</option></select></Field><Field label="Días de gracia"><input type="number" min="0" max="60" value={config.billing_grace_days} onChange={e=>setConfig(v=>({...v,billing_grace_days:e.target.value}))} className={inputClass}/></Field><Field label="Aplicar corte (meses vencidos)"><input type="number" min="1" max="12" value={config.billing_cut_after_months} onChange={e=>setConfig(v=>({...v,billing_cut_after_months:e.target.value}))} className={inputClass}/></Field><Field label="Otros impuestos"><input type="number" step="0.01" min="0" value={config.billing_other_taxes} onChange={e=>setConfig(v=>({...v,billing_other_taxes:e.target.value}))} className={inputClass}/></Field><Field label="Aviso nueva factura"><select value={config.billing_invoice_notification_channel} onChange={e=>setConfig(v=>({...v,billing_invoice_notification_channel:e.target.value}))} className={inputClass}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field><Field label="Recordatorios de pago"><select value={config.billing_payment_reminder_channel} onChange={e=>setConfig(v=>({...v,billing_payment_reminder_channel:e.target.value}))} className={inputClass}><option value="none">No enviar</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></Field><Field label="Recordatorio #1 (días)"><input type="number" min="0" value={config.billing_reminder_1_days} onChange={e=>setConfig(v=>({...v,billing_reminder_1_days:e.target.value}))} className={inputClass}/></Field><Field label="Recordatorio #2 (días)"><input type="number" min="0" value={config.billing_reminder_2_days} onChange={e=>setConfig(v=>({...v,billing_reminder_2_days:e.target.value}))} className={inputClass}/></Field><Field label="Recordatorio #3 (días)"><input type="number" min="0" value={config.billing_reminder_3_days} onChange={e=>setConfig(v=>({...v,billing_reminder_3_days:e.target.value}))} className={inputClass}/></Field></div>}</div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-emerald-400"/><h4 className="font-bold text-slate-100">Reglas adicionales</h4></div><div className="grid md:grid-cols-2 gap-3 text-xs">{[["billing_lower_speed","Bajar velocidad"],["billing_fixed_date","Fecha fija"],["billing_fixed_cut","Corte fijo programado"],["billing_late_fee","Aplicar mora"],["billing_reconnection_fee","Aplicar reconexión"],["billing_auto_generate","Generar facturas automáticamente"]].map(([key,label]) => <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"><span>{label}</span><input type="checkbox" checked={Boolean(config[key])} onChange={e=>setConfig(v=>({...v,[key]:e.target.checked}))} /></label>)}</div></div>
        <div className="flex justify-end"><button disabled={configSaving} className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4"/>{configSaving ? "Guardando..." : "Guardar configuración"}</button></div></form>}

      {showInvoiceModal && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={createInvoice} className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4"><div className="flex items-center justify-between"><div><h4 className="font-bold text-slate-100">{invoiceMode === "service" ? "Factura de servicios" : "Factura libre"}</h4><p className="text-[10px] text-slate-500">Cliente ligado: este abonado</p></div><button type="button" onClick={() => setShowInvoiceModal(false)} className="text-slate-400">✕</button></div>{invoiceMode === "service" && <Field label="Servicio"><select required value={invoiceData.service_id} onChange={e=>selectService(e.target.value)} className={inputClass}><option value="">{servicesLoading ? "Cargando servicios..." : "Selecciona un servicio"}</option>{services.map((s,index)=><option key={s.service_id} value={s.service_id}>{s.is_primary ? "Servicio 1" : `Servicio ${index + 1}`} · {s.plan_name || "Sin plan"} · S/. {Number(s.plan_price || 0).toFixed(2)}</option>)}</select></Field>}<div className="grid md:grid-cols-2 gap-3"><Field label="Plan / concepto"><input value={invoiceData.plan_name} onChange={e=>setInvoiceData(v=>({...v,plan_name:e.target.value}))} className={inputClass} placeholder="Concepto de cobro"/></Field><Field label="Monto"><input required type="number" step="0.01" min="0.01" value={invoiceData.amount} onChange={e=>setInvoiceData(v=>({...v,amount:e.target.value}))} className={inputClass}/></Field><Field label="Período"><input value={invoiceData.month_period} onChange={e=>setInvoiceData(v=>({...v,month_period:e.target.value}))} className={inputClass}/></Field><Field label="Fecha de emisión"><input type="date" value={invoiceData.issue_date} onChange={e=>setInvoiceData(v=>({...v,issue_date:e.target.value}))} className={inputClass}/></Field><Field label="Vencimiento"><input type="date" value={invoiceData.due_date} onChange={e=>setInvoiceData(v=>({...v,due_date:e.target.value}))} className={inputClass}/></Field><Field label="Notas"><input value={invoiceData.notes} onChange={e=>setInvoiceData(v=>({...v,notes:e.target.value}))} className={inputClass}/></Field></div><div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowInvoiceModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">Cancelar</button><button className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">Generar factura</button></div></form></div>}

      {viewingReceipt && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-5 shadow-2xl"><div className="flex justify-between border-b pb-3 mb-4"><div><h4 className="font-bold">Recibo</h4><p className="text-xs text-slate-500">{viewingReceipt.invoice_number}</p></div><button onClick={()=>setViewingReceipt(null)}>✕</button></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Cliente</span><b>{viewingReceipt.client_name}</b></div><div className="flex justify-between"><span>Servicio</span><b>{viewingReceipt.service_label || "Servicio 1"}</b></div><div className="flex justify-between"><span>Período</span><b>{viewingReceipt.month_period}</b></div><div className="flex justify-between"><span>Monto</span><b>S/. {Number(viewingReceipt.amount || 0).toFixed(2)}</b></div><div className="flex justify-between"><span>Pago</span><b>{viewingReceipt.payment_method || "—"}</b></div><div className="flex justify-between text-emerald-700"><span>Estado</span><b>PAGADO</b></div></div><div className="mt-5 flex justify-end"><button onClick={()=>window.print()} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Imprimir</button></div></div></div>}
    </div>
  );
}
