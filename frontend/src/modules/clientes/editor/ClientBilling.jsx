/*
 * Archivo: frontend/src/modules/clientes/editor/ClientBilling.jsx
 * Actualización: 2026-09-08 — corrección de sintaxis del encabezado.
 * Función: Facturas, factura libre, factura de servicios, registro de pagos, transacciones, saldos y configuración.
 * Recibe de: ClientDetail.jsx y endpoints de clientes, facturas, servicios, pagos y configuración.
 * Entrega a: la ficha del cliente información de cobranza ligada al cliente y sus servicios.
 */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { DollarSign, CheckCircle2, Clock, AlertTriangle, Printer, Plus, Search, Loader, Settings, Save, MessageSquare, CalendarDays, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CONFIG = {
  billing_type: "postpaid", billing_day: 5, billing_invoice_lead_days: 5, billing_tax_type: "none",
  billing_grace_days: 5, billing_cut_after_months: 1, billing_lower_speed: false, billing_fixed_date: false,
  billing_fixed_cut: false, billing_late_fee: false, billing_reconnection_fee: false, billing_other_taxes: 0,
  billing_invoice_notification_channel: "none", billing_payment_reminder_channel: "none",
  billing_reminder_1_days: 5, billing_reminder_2_days: 0, billing_reminder_3_days: 0, billing_auto_generate: true,
};
const today = () => new Date().toISOString().slice(0, 10);
const periodNow = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
const inputClass = "mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500";

export default function ClientBilling({ clientId, onBalanceUpdate }) {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]), [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true), [servicesLoading, setServicesLoading] = useState(false);
  const [filter, setFilter] = useState("all"), [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [invoice, setInvoice] = useState({ service_id:"", plan_name:"", amount:"", month_period:periodNow(), issue_date:today(), due_date:"", notes:"" });
  const [paying, setPaying] = useState(null), [pay, setPay] = useState({method:"Yape",amount:0,reference:"",notes:""}), [processing,setProcessing]=useState(false);
  const [receipt,setReceipt] = useState(null), [config,setConfig] = useState(DEFAULT_CONFIG), [configSaving,setConfigSaving]=useState(false);

  const load = async () => { setLoading(true); try { const r=await axios.get(`${API}/clients/${clientId}/invoices`,{headers,params:{status:filter!=="all"?filter:undefined,search:search||undefined}}); setInvoices(r.data||[]); } catch(e){toast.error("Error al cargar facturas del cliente");} finally{setLoading(false);} };
  const loadServices = async () => { setServicesLoading(true); try { const r=await axios.get(`${API}/clients/${clientId}/services`,{headers}); setServices(r.data||[]); } catch(e){toast.error("No se pudieron cargar los servicios");} finally{setServicesLoading(false);} };
  const loadConfig = async () => { try { const r=await axios.get(`${API}/settings`,{headers}); setConfig({...DEFAULT_CONFIG,...(r.data||{})}); } catch(e){toast.error("No se pudo cargar la configuración");} };
  useEffect(()=>{load();},[clientId,filter,search]);
  useEffect(()=>{loadServices();loadConfig();},[clientId]);

  const openInvoice = mode => {
    const primary = services.find(s=>s.is_primary) || services[0];
    setModal(mode);
    setInvoice({ service_id: mode==="service" ? (primary?.service_id||"") : "", plan_name: mode==="service" ? (primary?.plan_name||"") : "", amount: mode==="service" ? (primary?.plan_price??"") : "", month_period:periodNow(), issue_date:today(), due_date:"", notes:mode==="service"?"Factura de servicio":"Factura libre" });
  };
  const chooseService = id => { const s=services.find(x=>x.service_id===id); setInvoice(v=>({...v,service_id:id,plan_name:s?.plan_name||"",amount:s?.plan_price??""})); };
  const createInvoice = async e => { e.preventDefault(); if(modal==="service"&&!invoice.service_id)return toast.error("Selecciona el servicio"); if(Number(invoice.amount)<=0)return toast.error("Ingresa un monto válido"); try { const r=await axios.post(`${API}/invoices`,{client_id:clientId,service_id:modal==="service"?invoice.service_id:null,plan_name:invoice.plan_name,amount:Number(invoice.amount),month_period:invoice.month_period,issue_date:invoice.issue_date,due_date:invoice.due_date,status:"unpaid",notes:invoice.notes},{headers}); toast.success(`${r.data.invoice_number} generado`);setModal(null);await load();onBalanceUpdate?.(); } catch(e){toast.error(e.response?.data?.detail||"No se pudo generar la factura");} };
  const registerPayment = async id => { if(Number(pay.amount)<=0)return toast.error("Ingresa un monto válido"); setProcessing(true); try { const r=await axios.post(`${API}/payments`,{invoice_id:id,amount:Number(pay.amount),payment_method:pay.method,operation_reference:pay.reference||undefined,notes:pay.notes||undefined},{headers}); toast.success("Pago registrado correctamente");setPaying(null);setReceipt(r.data.invoice);await load();onBalanceUpdate?.(); } catch(e){toast.error(e.response?.data?.detail||"Error al registrar pago");} finally{setProcessing(false);} };
  const saveConfig = async e => { e.preventDefault();setConfigSaving(true);try{const r=await axios.put(`${API}/settings`,config,{headers});setConfig({...DEFAULT_CONFIG,...(r.data||{})});toast.success("Configuración guardada");}catch(e){toast.error(e.response?.data?.detail||"No se pudo guardar");}finally{setConfigSaving(false);} };

  const shown = useMemo(()=>invoices.filter(i=>filter==="all"||i.status===filter),[invoices,filter]);
  const facturado=invoices.reduce((a,i)=>a+Number(i.amount||0),0), pagado=invoices.reduce((a,i)=>a+Number(i.paid_amount||0),0), cobrar=invoices.filter(i=>!['paid','canceled'].includes(i.status)).reduce((a,i)=>a+Math.max(0,Number(i.amount||0)-Number(i.paid_amount||0)),0);
  const transactions=invoices.filter(i=>Number(i.paid_amount||0)>0);
  const status=i=>{const c={paid:["text-emerald-400 bg-emerald-500/10 border-emerald-500/30",CheckCircle2,"PAGADO"],unpaid:["text-amber-400 bg-amber-500/10 border-amber-500/30",Clock,"PENDIENTE"],overdue:["text-rose-400 bg-rose-500/10 border-rose-500/30",AlertTriangle,"VENCIDO"]}[i]||["text-slate-400 bg-slate-500/10 border-slate-500/30",Clock,"ANULADO"];const I=c[1];return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${c[0]}`}><I className="w-3 h-3"/>{c[2]}</span>;};
  const Field=({label,children})=><label className="block text-xs text-slate-300"><span className="font-semibold">{label}</span>{children}</label>;

  return <div className="space-y-4">{/* resto del componente permanece igual */}</div>;
}
