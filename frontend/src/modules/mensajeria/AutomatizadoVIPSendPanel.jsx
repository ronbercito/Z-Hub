import React, { useEffect, useState } from "react";
import axios from "axios";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function AutomatizadoVIPSendPanel({ client, defaultMessage = "" }) {
  const { API, token } = useAuth();
  const [message, setMessage] = useState(defaultMessage);
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessage(defaultMessage || "");
  }, [defaultMessage]);

  useEffect(() => {
    axios.get(`${API}/whatsapp/automatizadovip/config`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setEnabled(Boolean(res.data?.enabled)); setConfigured(Boolean(res.data?.configured)); })
      .catch(() => {});
  }, [API, token]);

  const send = async () => {
    if (!client) return toast.error("Seleccione un cliente");
    if (!client.phone) return toast.error("El cliente no tiene teléfono");
    if (!enabled || !configured) return toast.error("Configure y active AutomatizadoVIP en Ajustes");
    if (!message.trim()) return toast.error("Ingrese un mensaje");

    setSending(true);
    try {
      const res = await axios.post(`${API}/whatsapp/automatizadovip/send`, {
        contacts: [{ number: client.phone, message }],
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Mensaje enviado (${res.data.sent} destinatario)`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo enviar por AutomatizadoVIP");
    } finally { setSending(false); }
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
        <MessageCircle className="w-4 h-4" /> AutomatizadoVIP
      </div>
      <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-100" placeholder="Mensaje..." />
      <button onClick={send} disabled={sending} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2">
        <Send className="w-4 h-4" /> {sending ? "Enviando..." : "Enviar automáticamente"}
      </button>
    </div>
  );
}
