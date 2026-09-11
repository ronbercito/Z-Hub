import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, MessageCircle, Save, Send, ShieldCheck, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import WhatsAppAutomatizadoVIPAutomationTests from "./WhatsAppAutomatizadoVIPAutomationTests";

const DEFAULT_AUTOMATION = {
  enabled: false,
  reminder_enabled: true,
  reminder_days_before: 3,
  cut_warning_enabled: true,
  payment_confirmation_enabled: true,
  run_interval_minutes: 30,
  max_batch: 50,
};

export default function WhatsAppAutomatizadoVIPSettings() {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [config, setConfig] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Prueba de conexión WhatsApp desde Z-Hub.");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/whatsapp/automatizadovip/config`, { headers });
      setConfig({ ...res.data, automation: { ...DEFAULT_AUTOMATION, ...(res.data?.automation || {}) } });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo cargar la configuración de AutomatizadoVIP");
    }
  };

  useEffect(() => { load(); }, [API, token]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await axios.put(`${API}/whatsapp/automatizadovip/config`, {
        enabled: Boolean(config.enabled),
        gateway_url: config.gateway_url,
        country_code: config.country_code,
        verify: Boolean(config.verify),
        api_key: apiKey,
        automation: config.automation,
      }, { headers });
      setConfig(res.data);
      setApiKey("");
      toast.success("Configuración de AutomatizadoVIP guardada");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo guardar la configuración");
    } finally { setSaving(false); }
  };

  const test = async () => {
    if (!testNumber.trim()) return toast.error("Ingrese un número de prueba");
    setTesting(true);
    try {
      const res = await axios.post(`${API}/whatsapp/automatizadovip/test`, { number: testNumber, message: testMessage }, { headers });
      toast.success(`Prueba aceptada por AutomatizadoVIP (HTTP ${res.data.status_code})`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Falló la prueba de AutomatizadoVIP");
    } finally { setTesting(false); }
  };

  const setAutomation = (patch) => setConfig(current => ({ ...current, automation: { ...DEFAULT_AUTOMATION, ...(current?.automation || {}), ...patch } }));

  if (!config) return <div className="text-xs text-slate-400">Cargando configuración WhatsApp...</div>;
  const automation = { ...DEFAULT_AUTOMATION, ...(config.automation || {}) };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><MessageCircle className="w-5 h-5 text-emerald-400" /></div>
        <div>
          <h3 className="text-base font-bold text-slate-100">AutomatizadoVIP — WhatsApp automático</h3>
          <p className="text-xs text-slate-400 mt-1">Envío servidor a servidor sin exponer la API Key en el navegador.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-4">
          <label className="flex items-center justify-between text-xs text-slate-300"><span>Activar pasarela</span><input type="checkbox" checked={Boolean(config.enabled)} onChange={e => setConfig({ ...config, enabled: e.target.checked })} /></label>
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">URL Gateway</label><input value={config.gateway_url || ""} onChange={e => setConfig({ ...config, gateway_url: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">Código de país</label><input value={config.country_code || "51"} onChange={e => setConfig({ ...config, country_code: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={Boolean(config.verify)} onChange={e => setConfig({ ...config, verify: e.target.checked })} />Enviar parámetro <code>verify=true</code></label>
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">API Key</label><input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={config.configured ? "API Key configurada — dejar vacío para conservarla" : "Ingrese la API Key"} autoComplete="new-password" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-400" />La API Key no se devuelve al frontend.</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-4">
          <div className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-emerald-400" /><h4 className="text-xs font-bold text-slate-200">Automatizaciones</h4></div>
          <label className="flex items-center justify-between text-xs text-slate-300"><span>Activar envíos automáticos</span><input type="checkbox" checked={Boolean(automation.enabled)} onChange={e => setAutomation({ enabled: e.target.checked })} /></label>
          <label className="flex items-center justify-between text-xs text-slate-300"><span>Recordatorio antes del vencimiento</span><input type="checkbox" checked={Boolean(automation.reminder_enabled)} onChange={e => setAutomation({ reminder_enabled: e.target.checked })} /></label>
          <div><label className="block text-xs text-slate-400 mb-1">Días antes del vencimiento</label><input type="number" min="0" max="30" value={automation.reminder_days_before} onChange={e => setAutomation({ reminder_days_before: Number(e.target.value) })} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div>
          <label className="flex items-center justify-between text-xs text-slate-300"><span>Aviso de corte por deuda vencida</span><input type="checkbox" checked={Boolean(automation.cut_warning_enabled)} onChange={e => setAutomation({ cut_warning_enabled: e.target.checked })} /></label>
          <label className="flex items-center justify-between text-xs text-slate-300"><span>Confirmación automática de pago</span><input type="checkbox" checked={Boolean(automation.payment_confirmation_enabled)} onChange={e => setAutomation({ payment_confirmation_enabled: e.target.checked })} /></label>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-slate-400 mb-1">Intervalo (min)</label><input type="number" min="5" max="1440" value={automation.run_interval_minutes} onChange={e => setAutomation({ run_interval_minutes: Number(e.target.value) })} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div><div><label className="block text-xs text-slate-400 mb-1">Máximo por ciclo</label><input type="number" min="1" max="200" value={automation.max_batch} onChange={e => setAutomation({ max_batch: Number(e.target.value) })} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div></div>
          <p className="text-[10px] text-slate-500">Los envíos automáticos están apagados por defecto y el worker evita repetir el mismo mensaje al mismo cliente durante el día.</p>
        </div>
      </div>

      <WhatsAppAutomatizadoVIPAutomationTests gatewayEnabled={Boolean(config.enabled)} automation={automation} />

      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-4">
        <div><h4 className="text-xs font-bold text-slate-200">Prueba de envío</h4><p className="text-[11px] text-slate-500 mt-1">Usa un número real y envía un mensaje real a través de AutomatizadoVIP.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-slate-300 mb-1">Número</label><input value={testNumber} onChange={e => setTestNumber(e.target.value)} placeholder="999999999" className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div><div><label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje</label><textarea rows={3} maxLength={config.max_message_length || 1000} value={testMessage} onChange={e => setTestMessage(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100" /></div></div>
        <div className="flex items-center justify-between"><span className="text-[10px] text-slate-500">{testMessage.length}/{config.max_message_length || 1000}</span><div className="flex gap-2"><button disabled={saving} onClick={save} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4" />{saving ? "Guardando..." : "Guardar configuración"}</button><button disabled={testing || !config.configured} onClick={test} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-bold flex items-center gap-2">{testing ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}{testing ? "Enviando..." : "Enviar prueba"}</button></div></div>
      </div>
    </div>
  );
}
