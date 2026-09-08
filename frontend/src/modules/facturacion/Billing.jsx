/**
 * Archivo: frontend/src/modules/facturacion/Billing.jsx
 * Actualización: 2026-09-08 — pestañas Facturas/Configuración, factura manual y reglas de cobranza editables.
 * Función: módulo de facturación global con generación de recibos, registro de pagos y configuración de fechas,
 *          gracia, meses de corte y avisos SMS/correo/WhatsApp.
 * Recibe de: backend /api/invoices, /api/payments, /api/settings y /api/clients.
 * Entrega a: administrador una interfaz de cobranza y configuración operativa.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { TEST_IDS } from "../../constants/testIds";
import {
  DollarSign, FileText, CheckCircle2, Clock, AlertTriangle,
  Printer, ShieldAlert, Sparkles, Plus, Search, Loader, Eye,
  Settings, Save, MessageSquare, CalendarDays, Receipt
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_BILLING = {
  billing_day: 5,
  billing_invoice_lead_days: 5,
  billing_grace_days: 5,
  billing_cut_after_months: 1,
  billing_invoice_notification_channel: "none",
  billing_payment_reminder_channel: "none",
  billing_reminder_1_days: 5,
  billing_reminder_2_days: 0,
  billing_reminder_3_days: 0,
  billing_auto_generate: true,
};

export default function Billing() {
  const { API, token } = useAuth();
  const [activeTab, setActiveTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [payData, setPayData] = useState({ method: "Yape", amount: 0, reference: "" });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [invoiceData, setInvoiceData] = useState({ client_id: "", plan_name: "", amount: "", month_period: "", issue_date: new Date().toISOString().slice(0, 10), due_date: "", notes: "" });
  const [billingConfig, setBillingConfig] = useState(DEFAULT_BILLING);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/invoices`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined, search }, headers
      });
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar las facturas");
    } finally { setLoading(false); }
  };

  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await axios.get(`${API}/settings`, { headers });
      setBillingConfig({ ...DEFAULT_BILLING, ...res.data });
    } catch (e) { toast.error("No se pudo cargar la configuración de facturación"); }
    finally { setConfigLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [statusFilter, search]);
  useEffect(() => { fetchConfig(); }, []);

  const loadClients = async () => {
    try {
      const res = await axios.get(`${API}/clients`, { params: { status: "all" }, headers });
      setClients(res.data || []);
    } catch (_) { toast.error("No se pudo cargar la lista de clientes"); }
  };

  const openNewInvoice = async () => {
    await loadClients();
    const today = new Date();
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    setInvoiceData({ client_id: "", plan_name: "", amount: "", month_period: period, issue_date: today.toISOString().slice(0, 10), due_date: "", notes: "" });
    setShowInvoiceModal(true);
  };

  const selectInvoiceClient = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    setInvoiceData((v) => ({ ...v, client_id: clientId, plan_name: client?.plan_name || "", amount: client?.plan_price ?? "" }));
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceData.client_id || Number(invoiceData.amount) <= 0) {
      toast.error("Selecciona un cliente e ingresa un monto válido");
      return;
    }
    try {
      const res = await axios.post(`${API}/invoices`, { ...invoiceData, amount: Number(invoiceData.amount), status: "unpaid" }, { headers });
      toast.success(`Factura ${res.data.invoice_number} generada correctamente`);
      setShowInvoiceModal(false);
      fetchInvoices();
    } catch (e) { toast.error(e.response?.data?.detail || "No se pudo generar la factura"); }
  };

  const handlePayment = async (invoiceId) => {
    if (!payData.amount || payData.amount <= 0) return toast.error("Ingresa un monto válido");
    setPaymentProcessing(true);
    try {
      const res = await axios.post(`${API}/payments`, {
        invoice_id: invoiceId,
        amount: parseFloat(payData.amount),
        payment_method: payData.method,
        operation_reference: payData.reference || `OP-${Math.floor(100000 + Math.random() * 900000)}`
      }, { headers });
      toast.success("¡Pago registrado!");
      setPayingInvoiceId(null);
      fetchInvoices();
      setViewingReceipt(res.data.invoice);
    } catch (e) { toast.error(e.response?.data?.detail || "Error al registrar pago"); }
    finally { setPaymentProcessing(false); }
  };

  const handleMassGenerate = async () => {
    if (!window.confirm("¿Deseas generar masivamente los recibos de este mes para todos los clientes activos?")) return;
    try {
      const res = await axios.post(`${API}/invoices/mass-generate`, {}, { headers });
      toast.success(res.data.message); fetchInvoices();
    } catch (e) { toast.error(e.response?.data?.detail || "Error en la facturación masiva"); }
  };

  const handleSyncCuts = async () => {
    if (!window.confirm("¿Deseas ejecutar la regla de corte en MikroTik para clientes con facturas vencidas?")) return;
    try {
      const res = await axios.post(`${API}/routers/sync-cuts`, {}, { headers });
      toast.success(res.data.message); fetchInvoices();
    } catch (e) { toast.error(e.response?.data?.detail || "Error al sincronizar cortes"); }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const payload = {
        billing_day: Number(billingConfig.billing_day),
        billing_invoice_lead_days: Number(billingConfig.billing_invoice_lead_days),
        billing_grace_days: Number(billingConfig.billing_grace_days),
        billing_cut_after_months: Number(billingConfig.billing_cut_after_months),
        billing_invoice_notification_channel: billingConfig.billing_invoice_notification_channel,
        billing_payment_reminder_channel: billingConfig.billing_payment_reminder_channel,
        billing_reminder_1_days: Number(billingConfig.billing_reminder_1_days || 0),
        billing_reminder_2_days: Number(billingConfig.billing_reminder_2_days || 0),
        billing_reminder_3_days: Number(billingConfig.billing_reminder_3_days || 0),
        billing_auto_generate: Boolean(billingConfig.billing_auto_generate),
      };
      const res = await axios.put(`${API}/settings`, payload, { headers });
      setBillingConfig((v) => ({ ...v, ...res.data }));
      toast.success("Configuración de facturación guardada");
    } catch (e) { toast.error(e.response?.data?.detail || "No se pudo guardar la configuración"); }
    finally { setConfigSaving(false); }
  };

  const totalInvoiced = invoices.reduce((a, i) => a + Number(i.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((a, i) => a + Number(i.paid_amount || i.amount || 0), 0);
  const totalUnpaid = invoices.filter(i => i.status !== "paid").reduce((a, i) => a + Number(i.amount || 0), 0);

  const getStatusBadge = (status) => {
    const cfg = {
      paid: ["bg-emerald-500/20 border-emerald-500/40 text-emerald-400", CheckCircle2, "PAGADO"],
      unpaid: ["bg-amber-500/20 border-amber-500/40 text-amber-400", Clock, "PENDIENTE"],
      overdue: ["bg-rose-500/20 border-rose-500/40 text-rose-400", AlertTriangle, "VENCIDO"],
      canceled: ["bg-slate-500/20 border-slate-500/40 text-slate-400", Eye, "ANULADO"]
    }[status] || ["bg-amber-500/20 border-amber-500/40 text-amber-400", Clock, "PENDIENTE"];
    const Icon = cfg[1];
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg[0]}`}><Icon className="w-3.5 h-3.5" /> {cfg[2]}</span>;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-400" /> Facturación</h2>
          <p className="text-xs text-slate-400 mt-0.5">Facturas, pagos y reglas de cobranza de los abonados.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button data-testid={TEST_IDS.BTN_NEW_INVOICE} onClick={openNewInvoice} className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"><Plus className="w-4 h-4" /> Generar factura</button>
          <button onClick={() => setActiveTab("config")} className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 ${activeTab === "config" ? "bg-slate-700 text-cyan-300 border-cyan-500/40" : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"}`}><Settings className="w-4 h-4" /> Configuración</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-800">
        <button onClick={() => setActiveTab("invoices")} className={`px-4 py-2 text-xs font-bold border-b-2 ${activeTab === "invoices" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500"}`}><FileText className="w-3.5 h-3.5 inline mr-1" /> Facturas</button>
        <button onClick={() => setActiveTab("config")} className={`px-4 py-2 text-xs font-bold border-b-2 ${activeTab === "config" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-500"}`}><Settings className="w-3.5 h-3.5 inline mr-1" /> Configuración</button>
      </div>

      {activeTab === "config" ? (
        <form onSubmit={saveConfig} className="space-y-4 max-w-5xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4"><CalendarDays className="w-5 h-5 text-cyan-400" /><div><h3 className="font-bold text-slate-100">Fechas y corte</h3><p className="text-[11px] text-slate-500">Valores generales para la facturación de los abonados.</p></div></div>
            {configLoading ? <div className="py-10 text-center text-slate-500"><Loader className="w-5 h-5 animate-spin inline" /> Cargando configuración...</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="text-slate-300">Día de pago<input type="number" min="1" max="28" value={billingConfig.billing_day} onChange={e => setBillingConfig(v => ({...v, billing_day: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /><span className="text-[10px] text-slate-500">Día del mes usado como fecha base de cobro.</span></label>
              <label className="text-slate-300">Crear factura<input type="number" min="0" max="20" value={billingConfig.billing_invoice_lead_days} onChange={e => setBillingConfig(v => ({...v, billing_invoice_lead_days: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /><span className="text-[10px] text-slate-500">Días antes del día de pago para generar el recibo.</span></label>
              <label className="text-slate-300">Días de gracia<input type="number" min="0" max="30" value={billingConfig.billing_grace_days} onChange={e => setBillingConfig(v => ({...v, billing_grace_days: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /><span className="text-[10px] text-slate-500">Días después del vencimiento antes de considerar mora.</span></label>
              <label className="text-slate-300">Meses para corte<input type="number" min="1" max="12" value={billingConfig.billing_cut_after_months} onChange={e => setBillingConfig(v => ({...v, billing_cut_after_months: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /><span className="text-[10px] text-slate-500">Cantidad de recibos vencidos requerida para aplicar corte masivo.</span></label>
            </div>}
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4"><MessageSquare className="w-5 h-5 text-emerald-400" /><div><h3 className="font-bold text-slate-100">Avisos y recordatorios</h3><p className="text-[11px] text-slate-500">Define cómo se notificará al abonado.</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <label className="text-slate-300">Aviso de nueva factura<select value={billingConfig.billing_invoice_notification_channel} onChange={e => setBillingConfig(v => ({...v, billing_invoice_notification_channel: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"><option value="none">Desactivado</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></label>
              <label className="text-slate-300">Recordatorios de pago<select value={billingConfig.billing_payment_reminder_channel} onChange={e => setBillingConfig(v => ({...v, billing_payment_reminder_channel: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"><option value="none">Desactivado</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select></label>
              <label className="text-slate-300">Recordatorio #1 (días)<input type="number" min="0" max="30" value={billingConfig.billing_reminder_1_days} onChange={e => setBillingConfig(v => ({...v, billing_reminder_1_days: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /><span className="text-[10px] text-slate-500">0 = desactivado.</span></label>
              <label className="text-slate-300">Recordatorio #2 (días)<input type="number" min="0" max="30" value={billingConfig.billing_reminder_2_days} onChange={e => setBillingConfig(v => ({...v, billing_reminder_2_days: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label>
              <label className="text-slate-300">Recordatorio #3 (días)<input type="number" min="0" max="30" value={billingConfig.billing_reminder_3_days} onChange={e => setBillingConfig(v => ({...v, billing_reminder_3_days: e.target.value}))} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label>
              <label className="flex items-center gap-2 text-slate-300 mt-6"><input type="checkbox" checked={Boolean(billingConfig.billing_auto_generate)} onChange={e => setBillingConfig(v => ({...v, billing_auto_generate: e.target.checked}))} /> Generación automática de facturas</label>
            </div>
          </div>
          <div className="flex justify-end"><button disabled={configSaving} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2"><Save className="w-4 h-4" /> {configSaving ? "Guardando..." : "Guardar cambios"}</button></div>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4"><p className="text-[11px] text-slate-400 uppercase">Total facturado</p><p className="text-xl font-black text-slate-100 mt-1">S/. {totalInvoiced.toFixed(2)}</p></div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4"><p className="text-[11px] text-emerald-400 uppercase">Total cobrado</p><p className="text-xl font-black text-emerald-400 mt-1">S/. {totalPaid.toFixed(2)}</p></div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4"><p className="text-[11px] text-rose-400 uppercase">Por cobrar</p><p className="text-xl font-black text-rose-400 mt-1">S/. {totalUnpaid.toFixed(2)}</p></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 justify-between">
            <div className="flex gap-2 flex-wrap">
              <button data-testid={TEST_IDS.BTN_NEW_INVOICE} onClick={openNewInvoice} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1"><Plus className="w-4 h-4" /> Nueva factura</button>
              <button data-testid={TEST_IDS.BTN_MASS_INVOICES} onClick={handleMassGenerate} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1"><Sparkles className="w-4 h-4" /> Facturación masiva</button>
              <button data-testid={TEST_IDS.BTN_SYNC_CUTS} onClick={handleSyncCuts} className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-xl flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Aplicar corte</button>
            </div>
            <div className="relative w-full lg:w-80"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" /><input type="text" placeholder="Buscar recibo, cliente o DNI..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 w-full" /></div>
          </div>
          <div className="flex gap-1 flex-wrap">{["all", "paid", "unpaid", "overdue"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>{s === "all" ? "Todos" : s === "paid" ? "Pagados" : s === "unpaid" ? "Pendientes" : "Vencidos"}</button>)}</div>
          <div className="bg-slate-900/60 rounded-lg border border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-950 text-slate-400 border-b border-slate-800"><tr><th className="px-3 py-2.5">Recibo</th><th className="px-3 py-2.5">Cliente / DNI-RUC</th><th className="px-3 py-2.5">Período</th><th className="px-3 py-2.5 text-right">Monto</th><th className="px-3 py-2.5">Vencimiento</th><th className="px-3 py-2.5">Estado</th><th className="px-3 py-2.5 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800">
            {loading ? <tr><td colSpan="7" className="py-8 text-center text-slate-500"><Loader className="w-4 h-4 animate-spin inline" /> Cargando...</td></tr> : invoices.length === 0 ? <tr><td colSpan="7" className="py-8 text-center text-slate-500">No hay facturas.</td></tr> : invoices.map(inv => <React.Fragment key={inv.id}><tr className="hover:bg-slate-800/30"><td className="px-3 py-2.5 font-mono font-bold text-slate-100">{inv.invoice_number}</td><td className="px-3 py-2.5"><div className="font-semibold text-slate-200">{inv.client_name}</div><div className="text-[10px] text-slate-400">{inv.client_dni_ruc}</div></td><td className="px-3 py-2.5 text-slate-300">{inv.month_period}</td><td className="px-3 py-2.5 text-right font-bold text-slate-100">S/. {Number(inv.amount).toFixed(2)}</td><td className="px-3 py-2.5 text-slate-300">{inv.due_date}</td><td className="px-3 py-2.5">{getStatusBadge(inv.status)}</td><td className="px-3 py-2.5 text-center">{inv.status !== "paid" ? <button onClick={() => {setPayingInvoiceId(inv.id);setPayData({method:"Yape",amount:inv.amount,reference:""});}} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1 mx-auto"><DollarSign className="w-3 h-3" /> Pagar</button> : <button onClick={() => setViewingReceipt(inv)} className="px-2 py-1 bg-slate-800 text-cyan-400 text-[10px] font-bold rounded flex items-center gap-1 mx-auto"><Printer className="w-3 h-3" /> Ver</button>}</td></tr>
            {payingInvoiceId === inv.id && <tr className="bg-slate-950/80"><td colSpan="7" className="px-4 py-3"><div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"><div><label className="text-[10px] text-slate-400">Medio</label><select value={payData.method} onChange={e => setPayData({...payData,method:e.target.value})} className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100">{["Yape","Plin","Efectivo","BCP","BBVA","Transferencia"].map(m=><option key={m}>{m}</option>)}</select></div><div><label className="text-[10px] text-slate-400">Monto</label><input type="number" step="0.10" value={payData.amount} onChange={e => setPayData({...payData,amount:e.target.value})} className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400" /></div><div><label className="text-[10px] text-slate-400">Referencia</label><input value={payData.reference} onChange={e => setPayData({...payData,reference:e.target.value})} placeholder="OP-123456" className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-100" /></div><button onClick={() => handlePayment(inv.id)} disabled={paymentProcessing} className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded">{paymentProcessing ? "Registrando..." : "Registrar pago"}</button></div></td></tr>}</React.Fragment>)}
          </tbody></table></div></div>
        </>
      )}

      {showInvoiceModal && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={createInvoice} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4"><h3 className="font-bold text-slate-100 flex items-center gap-2"><Receipt className="w-5 h-5 text-cyan-400" /> Generar factura</h3><button type="button" onClick={() => setShowInvoiceModal(false)} className="text-slate-400">✕</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"><label className="md:col-span-2 text-slate-300">Cliente<select required value={invoiceData.client_id} onChange={e => selectInvoiceClient(e.target.value)} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"><option value="">Seleccionar cliente...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.dni_ruc}</option>)}</select></label><label className="text-slate-300">Plan<input value={invoiceData.plan_name} onChange={e => setInvoiceData({...invoiceData,plan_name:e.target.value})} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label><label className="text-slate-300">Monto<input required type="number" min="0.01" step="0.01" value={invoiceData.amount} onChange={e => setInvoiceData({...invoiceData,amount:e.target.value})} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label><label className="text-slate-300">Período<input type="month" value={invoiceData.month_period} onChange={e => setInvoiceData({...invoiceData,month_period:e.target.value})} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label><label className="text-slate-300">Fecha de emisión<input type="date" value={invoiceData.issue_date} onChange={e => setInvoiceData({...invoiceData,issue_date:e.target.value})} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label><label className="text-slate-300">Vencimiento<input type="date" value={invoiceData.due_date} onChange={e => setInvoiceData({...invoiceData,due_date:e.target.value})} className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label><label className="md:col-span-2 text-slate-300">Nota<input value={invoiceData.notes} onChange={e => setInvoiceData({...invoiceData,notes:e.target.value})} placeholder="Ej. Pago adelantado / Servicio 2" className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100" /></label></div><div className="flex justify-end gap-2 mt-5"><button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button><button className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Save className="w-4 h-4" /> Generar factura</button></div></form></div>}

      {viewingReceipt && <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto"><div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 shadow-2xl"><div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3"><h3 className="text-sm font-bold text-slate-100 flex items-center gap-2"><Printer className="w-4 h-4 text-cyan-400" /> Recibo</h3><button onClick={() => setViewingReceipt(null)} className="text-slate-400 font-bold">✕</button></div><div className="bg-white text-slate-900 p-4 rounded font-mono text-xs text-center space-y-1 mb-3 select-all"><p className="font-bold">FIBRAZ PERÚ S.A.C.</p><p className="text-[10px]">RUC: 20608934521 | Teléfono: +51 987 654 321</p><div className="border-b border-dashed border-slate-400 my-1"/><p className="font-bold">RECIBO DE PAGO</p><p className="font-bold text-lg">{viewingReceipt.invoice_number}</p><p className="text-[11px]">Fecha: {viewingReceipt.payment_date ? viewingReceipt.payment_date.split("T")[0] : viewingReceipt.issue_date}</p><div className="border-b border-dashed border-slate-400 my-1"/><div className="text-left space-y-0.5 text-[11px]"><p><b>Cliente:</b> {viewingReceipt.client_name}</p><p><b>Período:</b> {viewingReceipt.month_period}</p><p><b>Plan:</b> {viewingReceipt.plan_name}</p></div><div className="border-b border-dashed border-slate-400 my-1"/><div className="text-right font-bold text-sm">TOTAL: S/. {Number(viewingReceipt.paid_amount || viewingReceipt.amount).toFixed(2)}</div><p className="text-[10px]">Medio: {viewingReceipt.payment_method || "Efectivo"}</p><p className="text-[10px] font-bold">¡Gracias por su pago!</p></div><button onClick={() => window.print()} className="w-full px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2"><Printer className="w-3.5 h-3.5" /> Imprimir</button></div></div>}
    </div>
  );
}
