import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, BellRing, Check, CircleCheck, FileText, MessageSquareText, RotateCcw, Save, Settings2, ShieldAlert, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const FLOW = {
  payment_reminder: { step: "01", title: "Recordatorio de pago", short: "Antes del vencimiento", description: "Primer contacto preventivo para recordar al abonado que su factura está próxima a vencer.", icon: BellRing, tone: "emerald", trigger: "Preventivo", variables: ["empresa", "yape"] },
  cut_warning: { step: "02", title: "Aviso de corte", short: "Deuda vencida", description: "Mensaje de cobranza cuando la factura supera la fecha de vencimiento y corresponde aplicar el aviso.", icon: ShieldAlert, tone: "amber", trigger: "Cobranza", variables: ["empresa", "telefono"] },
  payment_confirmation: { step: "03", title: "Confirmación de pago", short: "Pago registrado", description: "Confirma al cliente que el sistema detectó su pago y entrega la referencia de la factura.", icon: CircleCheck, tone: "blue", trigger: "Confirmación", variables: ["empresa"] },
  maintenance: { step: "04", title: "Aviso de mantenimiento", short: "Servicio / operación", description: "Plantilla general para comunicaciones operativas y avisos de mantenimiento del servicio.", icon: Wrench, tone: "violet", trigger: "Operativo", variables: ["empresa"] },
};
const ORDER = ["payment_reminder", "cut_warning", "payment_confirmation", "maintenance"];
const toneClasses = {
  emerald: { border: "border-emerald-500/25", icon: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  amber: { border: "border-amber-500/25", icon: "bg-amber-500/10 text-amber-300 border-amber-500/20", badge: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  blue: { border: "border-blue-500/25", icon: "bg-blue-500/10 text-blue-300 border-blue-500/20", badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  violet: { border: "border-violet-500/25", icon: "bg-violet-500/10 text-violet-300 border-violet-500/20", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
};

export default function MessageTemplatesSettings() {
  const { API, token } = useAuth();
  const [templates, setTemplates] = useState({});
  const [saving, setSaving] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const res = await axios.get(`${API}/settings/message-templates/whatsapp`, { headers: { Authorization: `Bearer ${token}` } }); setTemplates(res.data?.templates || {}); } catch (e) { toast.error(e?.response?.data?.detail || "No se pudieron cargar las plantillas"); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [API, token]);
  const save = async key => { setSaving(key); try { const res = await axios.put(`${API}/settings/message-templates/whatsapp/${key}`, { text: templates[key].text }, { headers: { Authorization: `Bearer ${token}` } }); setTemplates(current => ({ ...current, [key]: res.data.template })); toast.success("Plantilla guardada"); } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo guardar la plantilla"); } finally { setSaving(""); } };
  const reset = async key => { setSaving(key); try { const res = await axios.post(`${API}/settings/message-templates/whatsapp/reset/${key}`, {}, { headers: { Authorization: `Bearer ${token}` } }); setTemplates(current => ({ ...current, [key]: res.data.template })); toast.success("Plantilla restaurada"); } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo restaurar la plantilla"); } finally { setSaving(""); } };
  if (loading) return <div className="text-xs text-slate-400">Cargando plantillas...</div>;
  return <div className="space-y-6">
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-900/80 to-slate-950 p-5">
      <div className="flex items-start gap-4"><div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-400/20"><MessageSquareText className="w-6 h-6 text-violet-300" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-100">Centro de plantillas</h3><span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-950/50 text-[10px] font-bold text-slate-400">4 plantillas</span></div><p className="text-xs text-slate-400 mt-1.5 max-w-2xl">Define aquí el lenguaje que utilizarán las automatizaciones. El motor reemplaza las variables y conserva una sola fuente de verdad para todos los envíos.</p></div></div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">{ORDER.map(key => { const item=FLOW[key]; const Icon=item.icon; return <div key={key} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2"><span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black ${toneClasses[item.tone].icon}`}>{item.step}</span><div className="min-w-0"><p className="text-[10px] font-bold text-slate-300 truncate">{item.title}</p><p className="text-[9px] text-slate-500 truncate">{item.trigger}</p></div></div>; })}</div>
    </div>
    <div className="flex items-center gap-3 px-1"><div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center"><Settings2 className="w-4 h-4 text-slate-300" /></div><div><h4 className="text-sm font-bold text-slate-200">Flujo de comunicación</h4><p className="text-[10px] text-slate-500">Orden lógico de las plantillas; no cambia por sí solo las condiciones de activación.</p></div></div>
    <div className="relative space-y-4">
      {ORDER.map((key,index) => { const item=templates[key]; const meta=FLOW[key]; if(!item)return null; const Icon=meta.icon; const tone=toneClasses[meta.tone]; return <div key={key} className={`relative rounded-2xl border ${tone.border} bg-slate-900/75 overflow-hidden`}>
        {index<ORDER.length-1 && <div className="hidden md:block absolute left-[27px] top-[76px] bottom-[-17px] w-px bg-slate-800 z-0" />}
        <div className="relative z-10 p-4 md:p-5"><div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div className="flex items-center gap-3 lg:w-64 shrink-0"><div className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center ${tone.icon}`}><Icon className="w-5 h-5" /><span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-300">{meta.step}</span></div><div><h5 className="text-sm font-black text-slate-100">{meta.title}</h5><div className="flex gap-1.5 mt-1"><span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${tone.badge}`}>{meta.trigger}</span><span className="px-1.5 py-0.5 rounded-md border border-slate-800 text-[9px] text-slate-500">{meta.short}</span></div></div></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] leading-4 text-slate-400 mb-3">{meta.description}</p><div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="flex items-center justify-between gap-3 mb-2"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><FileText className="w-3.5 h-3.5" />Contenido del mensaje</div><span className="text-[9px] text-slate-600">Máx. 1000</span></div><textarea maxLength={1000} rows={5} value={item.text} onChange={e=>setTemplates(current=>({...current,[key]:{...current[key],text:e.target.value}}))} className="w-full resize-y min-h-[110px] p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-slate-500 outline-none text-xs leading-5 text-slate-100" /><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-1.5">{(item.variables||meta.variables).map(v=><span key={v} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[9px] font-mono text-cyan-300">{'{'}{v}{'}'}</span>)}</div><span className="text-[9px] text-slate-500">{item.text.length}/1000</span></div></div></div>
          <div className="flex lg:flex-col gap-2 lg:w-28 shrink-0"><button type="button" onClick={()=>reset(key)} disabled={saving===key} className="flex-1 lg:w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Restaurar</button><button type="button" onClick={()=>save(key)} disabled={saving===key} className="flex-1 lg:w-full px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5">{saving===key?<Check className="w-3.5 h-3.5" />:<Save className="w-3.5 h-3.5" />}Guardar</button></div>
        </div></div>
      </div>; })}
    </div>
    <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 flex gap-2.5"><AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" /><p className="text-[10px] leading-4 text-slate-400">Las variables son dinámicas. Puedes cambiar el texto sin perder los datos que el sistema completa automáticamente. La confirmación de pago usa su propia plantilla y queda preparada para cuando exista una factura pagada.</p></div>
  </div>;
}
