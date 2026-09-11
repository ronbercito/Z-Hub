import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, RotateCcw, Save, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const ORDER = ["payment_reminder", "cut_warning", "payment_confirmation", "maintenance"];

export default function MessageTemplatesSettings() {
  const { API, token } = useAuth();
  const [templates, setTemplates] = useState({});
  const [saving, setSaving] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/settings/message-templates/whatsapp`, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(res.data?.templates || {});
    } catch (e) { toast.error(e?.response?.data?.detail || "No se pudieron cargar las plantillas"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [API, token]);

  const save = async (key) => {
    setSaving(key);
    try {
      const res = await axios.put(`${API}/settings/message-templates/whatsapp/${key}`, { text: templates[key].text }, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(current => ({ ...current, [key]: res.data.template }));
      toast.success("Plantilla guardada");
    } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo guardar la plantilla"); }
    finally { setSaving(""); }
  };

  const reset = async (key) => {
    setSaving(key);
    try {
      const res = await axios.post(`${API}/settings/message-templates/whatsapp/reset/${key}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(current => ({ ...current, [key]: res.data.template }));
      toast.success("Plantilla restaurada");
    } catch (e) { toast.error(e?.response?.data?.detail || "No se pudo restaurar la plantilla"); }
    finally { setSaving(""); }
  };

  if (loading) return <div className="text-xs text-slate-400">Cargando plantillas...</div>;
  return <div className="space-y-5">
    <div className="flex items-start gap-3"><div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20"><MessageSquareText className="w-5 h-5 text-violet-300" /></div><div><h3 className="text-base font-bold text-slate-100">Plantillas de configuración</h3><p className="text-xs text-slate-400 mt-1">Todos los textos usados por las automatizaciones de mensajería se administran aquí.</p></div></div>
    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 text-[11px] text-slate-400">Las variables entre llaves se reemplazan automáticamente. No las elimines si la plantilla necesita esos datos.</div>
    <div className="space-y-4">
      {ORDER.map(key => { const item = templates[key]; if (!item) return null; return <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3"><div><h4 className="text-sm font-bold text-slate-200">{item.name}</h4><p className="text-[10px] text-slate-500 mt-1">Variables: {item.variables.map(v => `{${v}}`).join(" · ")}</p></div><span className="text-[10px] text-slate-500">Máx. 1000 caracteres</span></div>
        <textarea maxLength={1000} rows={5} value={item.text} onChange={e => setTemplates(current => ({ ...current, [key]: { ...current[key], text: e.target.value } }))} className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs leading-5 text-slate-100" />
        <div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">{item.text.length}/1000</span><div className="flex gap-2"><button type="button" onClick={() => reset(key)} disabled={saving === key} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" />Restaurar</button><button type="button" onClick={() => save(key)} disabled={saving === key} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-2">{saving === key ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}Guardar</button></div></div>
      </div>; })}
    </div>
  </div>;
}
