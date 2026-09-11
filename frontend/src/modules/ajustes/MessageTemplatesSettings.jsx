import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, BellRing, Check, CircleCheck, Eye, FileText, MessageSquareText, RotateCcw, Save, Settings2, ShieldAlert, Smartphone, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const ORDER = ["payment_reminder", "cut_warning", "payment_confirmation", "maintenance"];
const FLOW = {
  payment_reminder: { step: "01", title: "Recordatorio de pago", short: "Antes del vencimiento", description: "Primer contacto preventivo para recordar al abonado que su factura está próxima a vencer.", icon: BellRing, tone: "emerald", trigger: "Preventivo" },
  cut_warning: { step: "02", title: "Aviso de corte", short: "Deuda vencida", description: "Mensaje de cobranza cuando la factura supera la fecha de vencimiento.", icon: ShieldAlert, tone: "amber", trigger: "Cobranza" },
  payment_confirmation: { step: "03", title: "Confirmación de pago", short: "Pago registrado", description: "Confirma al cliente que el sistema detectó su pago.", icon: CircleCheck, tone: "blue", trigger: "Confirmación" },
  maintenance: { step: "04", title: "Aviso de mantenimiento", short: "Servicio / operación", description: "Plantilla para comunicaciones operativas y avisos de mantenimiento.", icon: Wrench, tone: "violet", trigger: "Operativo" },
};
const TONES = { emerald: "border-emerald-500/25 bg-emerald-500/5 text-emerald-300", amber: "border-amber-500/25 bg-amber-500/5 text-amber-300", blue: "border-blue-500/25 bg-blue-500/5 text-blue-300", violet: "border-violet-500/25 bg-violet-500/5 text-violet-300" };
const DEMO = { empresa: "Z-Hub ISP", cliente: "Juan Pérez", cliente_nombre: "Juan", cliente_apellidos: "Pérez", total: "S/.50.00", monto: "50.00", plan: "Plan Hogar 100 Mbps", vencimiento: "21/09/2026", fecha_pago: "21/09/2026", fecha_vencimiento: "21/09/2026", fecha_corte: "21/09/2026", factura: "F001-00001234", recibo: "F001-00001234", yape: "999 111 222", telefono: "999 111 222", titular_pago: "Segundo R. Juarez S.", fecha: "21/09/2026", hora_inicio: "08:00", hora_fin: "10:00" };

function renderPreview(text) {
  let value = String(text || "");
  Object.entries(DEMO).forEach(([key, replacement]) => {
    value = value.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), replacement);
    value = value.split(`{${key}}`).join(replacement);
  });
  return value
    .replace(/%vip%/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function MessageTemplatesSettings() {
  const { API, token } = useAuth();
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [previewKey, setPreviewKey] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${API}/settings/message-templates/whatsapp`, { headers: { Authorization: `Bearer ${token}` } });
        if (active) setTemplates(res.data?.templates || {});
      } catch (e) {
        toast.error(e?.response?.data?.detail || "No se pudieron cargar las plantillas");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [API, token]);

  const save = async (key) => {
    setSaving(key);
    try {
      const res = await axios.put(`${API}/settings/message-templates/whatsapp/${key}`, { text: templates[key].text }, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates((current) => ({ ...current, [key]: res.data.template }));
      toast.success("Plantilla guardada");
    } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo guardar la plantilla"); }
    finally { setSaving(""); }
  };

  const reset = async (key) => {
    setSaving(key);
    try {
      const res = await axios.post(`${API}/settings/message-templates/whatsapp/reset/${key}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates((current) => ({ ...current, [key]: res.data.template }));
      toast.success("Plantilla restaurada");
    } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo restaurar la plantilla"); }
    finally { setSaving(""); }
  };

  const preview = useMemo(() => previewKey && templates[previewKey] ? renderPreview(templates[previewKey].text) : "", [previewKey, templates]);
  if (loading) return <div className="text-xs text-slate-400">Cargando plantillas...</div>;

  return <div className="space-y-6">
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-900/80 to-slate-950 p-5">
      <div className="flex items-start gap-4"><div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-400/20"><MessageSquareText className="w-6 h-6 text-violet-300" /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-100">Centro de plantillas</h3><span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-950/50 text-[10px] font-bold text-slate-400">4 plantillas</span></div><p className="text-xs text-slate-400 mt-1.5">Define el lenguaje de las automatizaciones. Usa variables <b className="text-cyan-300">{"{{variable}}"}</b>, marcadores <b className="text-cyan-300">%vip%</b> y formato WhatsApp como <b className="text-slate-200">*negrita*</b>.</p></div></div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">{ORDER.map((key) => { const item = FLOW[key]; return <div key={key} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${TONES[item.tone]}`}><span className="w-7 h-7 rounded-lg border border-current/20 flex items-center justify-center text-[10px] font-black">{item.step}</span><div className="min-w-0"><p className="text-[10px] font-bold truncate">{item.title}</p><p className="text-[9px] opacity-60 truncate">{item.trigger}</p></div></div>; })}</div>
    </div>

    <div className="flex items-center gap-3 px-1"><div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center"><Settings2 className="w-4 h-4 text-slate-300" /></div><div><h4 className="text-sm font-bold text-slate-200">Flujo de comunicación</h4><p className="text-[10px] text-slate-500">Orden lógico de las plantillas; no modifica las condiciones automáticas.</p></div></div>

    <div className="space-y-4">{ORDER.map((key) => { const item = templates[key]; const meta = FLOW[key]; if (!item) return null; const Icon = meta.icon; const open = previewKey === key; return <div key={key} className={`rounded-2xl border ${TONES[meta.tone]} bg-slate-900/75 overflow-hidden`}>
      <div className="p-4 md:p-5"><div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        <div className="flex items-center gap-3 lg:w-64 shrink-0"><div className="relative w-12 h-12 rounded-2xl border border-current/20 flex items-center justify-center"><Icon className="w-5 h-5" /><span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[9px] font-black text-slate-300">{meta.step}</span></div><div><h5 className="text-sm font-black text-slate-100">{meta.title}</h5><div className="flex gap-1.5 mt-1"><span className="px-1.5 py-0.5 rounded-md border border-current/20 text-[9px] font-bold">{meta.trigger}</span><span className="px-1.5 py-0.5 rounded-md border border-slate-800 text-[9px] text-slate-500">{meta.short}</span></div></div></div>
        <div className="flex-1 min-w-0"><p className="text-[11px] leading-4 text-slate-400 mb-3">{meta.description}</p><div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="flex items-center justify-between gap-3 mb-2"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><FileText className="w-3.5 h-3.5" />Contenido del mensaje</div><span className="text-[9px] text-slate-600">Máx. 1000</span></div><textarea maxLength={1000} rows={5} value={item.text} onChange={(e) => setTemplates((current) => ({ ...current, [key]: { ...current[key], text: e.target.value } }))} className="w-full resize-y min-h-[110px] p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-slate-500 outline-none text-xs leading-5 text-slate-100" /><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-1.5">{(item.variables || []).map((variable) => <span key={variable} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[9px] font-mono text-cyan-300">{`{{${variable}}}`}</span>)}</div><span className="text-[9px] text-slate-500">{item.text.length}/1000</span></div></div></div>
        <div className="flex lg:flex-col gap-2 lg:w-32 shrink-0"><button type="button" onClick={() => setPreviewKey(open ? "" : key)} className="flex-1 lg:w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5"><Eye className="w-3.5 h-3.5" />{open ? "Ocultar" : "Vista previa"}</button><button type="button" onClick={() => reset(key)} disabled={saving === key} className="flex-1 lg:w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" />Restaurar</button><button type="button" onClick={() => save(key)} disabled={saving === key} className="flex-1 lg:w-full px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5">{saving === key ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}Guardar</button></div>
      </div></div>
      {open ? <div className="border-t border-slate-800 bg-slate-950/80 p-4 md:p-5"><div className="flex flex-col md:flex-row gap-5 items-start"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-3"><Smartphone className="w-4 h-4 text-emerald-300" /><span className="text-[11px] font-black text-slate-200">Vista previa del WhatsApp</span><span className="text-[9px] text-slate-600">Datos de demostración</span></div><div className="max-w-xl rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4 shadow-inner"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center"><MessageSquareText className="w-4 h-4 text-emerald-300" /></div><div><p className="text-[10px] font-bold text-slate-200">AutomatizadoVIP</p><p className="text-[9px] text-slate-600">Mensaje de demostración</p></div></div><pre className="whitespace-pre-wrap break-words font-sans text-xs leading-5 text-slate-300">{preview}</pre></div></div><div className="md:w-64 rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 mb-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-300" />Datos usados en la vista previa</div><div className="space-y-1 text-[9px] text-slate-500">{Object.entries(DEMO).slice(0, 8).map(([k, v]) => <div key={k} className="flex justify-between gap-2"><span>{k}</span><span className="text-slate-300 text-right">{v}</span></div>)}</div></div></div></div> : null}
    </div>; })}</div>

    <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 flex gap-2.5"><AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" /><p className="text-[10px] leading-4 text-slate-400">Las variables son dinámicas. La vista previa utiliza datos ficticios y no envía ningún WhatsApp.</p></div>
  </div>;
}
