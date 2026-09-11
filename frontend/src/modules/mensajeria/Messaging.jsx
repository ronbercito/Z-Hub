/**
 * Archivo: frontend/src/modules/mensajeria/Messaging.jsx
 * Función: Módulo Mensajería: plantillas de WhatsApp, envío directo mediante AutomatizadoVIP y alternativa WhatsApp Web/Móvil.
 * Trabaja con: backend/app/routers/mensajeria/router.py, backend/app/routers/whatsapp_automatizadovip/router.py
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { MessageSquare, Send, Copy, Check, MessageCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import AutomatizadoVIPHistory from "./AutomatizadoVIPHistory";

export default function Messaging() {
  const { API, token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [vipEnabled, setVipEnabled] = useState(false);
  const [vipConfigured, setVipConfigured] = useState(false);
  const [sendingVip, setSendingVip] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [resTpl, resCli] = await Promise.all([
          axios.get(`${API}/messaging/templates`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setTemplates(resTpl.data);
        setClients(resCli.data);
        if (resTpl.data.length > 0) setSelectedTemplate(resTpl.data[0]);
        if (resCli.data.length > 0) setSelectedClient(resCli.data[0]);
      } catch (e) {
        toast.error("Error al cargar plantillas");
      }
    };
    fetchTemplates();
  }, [API, token]);

  useEffect(() => {
    axios.get(`${API}/whatsapp/automatizadovip/config`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setVipEnabled(Boolean(res.data?.enabled));
        setVipConfigured(Boolean(res.data?.configured));
      })
      .catch(() => {});
  }, [API, token]);

  useEffect(() => {
    if (selectedTemplate && selectedClient) {
      let txt = selectedTemplate.text;
      txt = txt.replace("{cliente}", selectedClient.full_name || "Estimado cliente");
      txt = txt.replace("{monto}", Number(selectedClient.balance_due || selectedClient.plan_price || 70).toFixed(2));
      txt = txt.replace("{plan}", selectedClient.plan_name || "Fibra Óptica");
      txt = txt.replace("{vencimiento}", "10 de este mes");
      txt = txt.replace("{recibo}", "REC-202606-0001");
      setCustomMessage(txt);
    }
  }, [selectedTemplate, selectedClient]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    toast.success("Mensaje copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAutomatizadoVIP = async () => {
    if (!selectedClient) return toast.error("Seleccione un cliente");
    if (!selectedClient.phone) return toast.error("El cliente no tiene teléfono");
    if (!vipEnabled || !vipConfigured) return toast.error("Configure y active AutomatizadoVIP en Ajustes");
    if (!customMessage.trim()) return toast.error("Ingrese un mensaje");
    if (customMessage.length > 1000) return toast.error("El mensaje no puede superar 1000 caracteres");

    setSendingVip(true);
    try {
      const res = await axios.post(`${API}/whatsapp/automatizadovip/send`, {
        contacts: [{ client_id: selectedClient.id, number: selectedClient.phone, message: customMessage }],
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Mensaje enviado por AutomatizadoVIP (${res.data.sent} destinatario)`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo enviar por AutomatizadoVIP");
    } finally {
      setSendingVip(false);
    }
  };

  const handleSendWhatsAppWeb = () => {
    if (!selectedClient) return toast.error("Seleccione un cliente");
    const cleanPhone = (selectedClient.phone || "").replace(/\D/g, "");
    if (!cleanPhone) return toast.error("El cliente no tiene teléfono");
    const normalized = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
    const waUrl = `https://wa.me/${normalized}?text=${encodeURIComponent(customMessage)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="messaging-page space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-400" /> Mensajería y Avisos WhatsApp
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">El envío manual principal usa AutomatizadoVIP. WhatsApp Web/Móvil queda como alternativa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="messaging-templates lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">Plantillas Predeterminadas</h3>
          {templates.map((tpl) => (
            <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`messaging-template p-3 rounded-xl border cursor-pointer transition text-xs ${selectedTemplate?.id === tpl.id ? "bg-emerald-950/40 border-emerald-500 text-emerald-200" : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"}`}>
              <div className="font-bold mb-1 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-emerald-400" />{tpl.name}</div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.text}</p>
            </div>
          ))}
        </div>

        <div className="messaging-composer lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destinatario / Abonado</label>
              <select value={selectedClient?.id || ""} onChange={(e) => setSelectedClient(clients.find(item => item.id === e.target.value))} className="messaging-field w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100">
                {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.phone}) - {c.status === "active" ? "Activo" : "Cortado"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp</label>
              <input type="text" disabled value={selectedClient?.phone ? `+51 ${selectedClient.phone}` : ""} className="messaging-field w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cuerpo del Mensaje (Editable)</label>
            <textarea rows="6" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} maxLength={1000} className="messaging-field messaging-message w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"></textarea>
            <div className="text-right text-[10px] text-slate-500 mt-1">{customMessage.length}/1000</div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button onClick={handleCopy} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}{copied ? "Copiado" : "Copiar Texto"}
            </button>
            <button onClick={handleSendWhatsAppWeb} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition" title="Abre WhatsApp Web o Móvil">
              <Globe className="w-4 h-4" /> WhatsApp Web/Móvil
            </button>
            <button onClick={handleSendAutomatizadoVIP} disabled={sendingVip} className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition" title="Envía directamente mediante la API de AutomatizadoVIP">
              <Send className="w-4 h-4" /> {sendingVip ? "Enviando..." : "Enviar por AutomatizadoVIP"}
            </button>
          </div>

          <div className={`rounded-lg border px-3 py-2 text-[11px] ${vipEnabled && vipConfigured ? "border-emerald-500/20 bg-emerald-950/10 text-emerald-300" : "border-amber-500/20 bg-amber-950/10 text-amber-300"}`}>
            {vipEnabled && vipConfigured
              ? "AutomatizadoVIP listo: el botón principal envía directamente por API y registra el envío."
              : "AutomatizadoVIP no está listo: active la pasarela y configure la API Key en Ajustes."}
          </div>
        </div>
      </div>

      <AutomatizadoVIPHistory />
    </div>
  );
}
