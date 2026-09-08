/**
 * Archivo: frontend/src/modules/clientes/editor/ClientCommunications.jsx
 * Actualización: 2026-09-07 — módulo de Email y SMS mejorado con historial y modales de envío.
 * Función: muestra historial de emails y SMS enviados al cliente; permite enviar nuevos mediante modales.
 * Recibe: api, token, clientId desde ClientDetail.jsx.
 * Entrega: historial guardado en backend y nuevos mensajes enviados vía API tercera (Twilio/AWS SNS).
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, MessageSquare, Plus, Send, X, AlertCircle, Loader } from "lucide-react";
import { toast } from "sonner";

export default function ClientCommunications({ api, token, clientId, client }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: client?.email || "",
    subject: "",
    body: "",
    template: "none"
  });
  const [emailSending, setEmailSending] = useState(false);

  // Modal SMS
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsForm, setSmsForm] = useState({
    message: ""
  });
  const [smsSending, setSmsSending] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  // Cargar historial
  const loadCommunications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${api}/clients/${clientId}/communications`, { headers });
      setCommunications(res.data || []);
    } catch (err) {
      setError("No se pudo cargar el historial de comunicaciones.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [clientId]);

  // Enviar email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.to.trim() || !emailForm.subject.trim() || !emailForm.body.trim()) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    setEmailSending(true);
    try {
      await axios.post(
        `${api}/clients/${clientId}/communications/send-email`,
        emailForm,
        { headers }
      );
      toast.success("Correo enviado correctamente");
      setShowEmailModal(false);
      setEmailForm({ to: client?.email || "", subject: "", body: "", template: "none" });
      loadCommunications();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al enviar correo");
    } finally {
      setEmailSending(false);
    }
  };

  // Enviar SMS
  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!smsForm.message.trim()) {
      toast.error("Escribe un mensaje");
      return;
    }
    if (smsForm.message.length > 900) {
      toast.error("El mensaje excede 900 caracteres");
      return;
    }

    setSmsSending(true);
    try {
      await axios.post(
        `${api}/clients/${clientId}/communications/send-sms`,
        { message: smsForm.message },
        { headers }
      );
      toast.success("SMS enviado correctamente");
      setShowSmsModal(false);
      setSmsForm({ message: "" });
      loadCommunications();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al enviar SMS");
    } finally {
      setSmsSending(false);
    }
  };

  // Agrupar por tipo
  const emails = communications.filter(c => c.type === "email");
  const sms = communications.filter(c => c.type === "sms");

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Correos Enviados */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <Mail className="h-5 w-5 text-blue-400" /> Correos Enviados
          </h3>
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo correo
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Loader className="w-4 h-4 animate-spin inline" /> Cargando...
          </div>
        ) : emails.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">Sin correos enviados aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-3 py-2 font-semibold">Asunto</th>
                  <th className="px-3 py-2 font-semibold">Destinatario</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                  <th className="px-3 py-2 font-semibold">Fecha envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-mono text-cyan-300">{email.id}</td>
                    <td className="px-3 py-2 text-slate-300">{email.subject}</td>
                    <td className="px-3 py-2 text-slate-400">{email.recipient}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        email.status === "sent" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {email.status === "sent" ? "✓ Enviado" : "⏳ Pendiente"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{new Date(email.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SMS Enviados */}
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <MessageSquare className="h-5 w-5 text-green-400" /> SMS / WhatsApp Enviados
          </h3>
          <button
            onClick={() => setShowSmsModal(true)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo SMS
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Loader className="w-4 h-4 animate-spin inline" /> Cargando...
          </div>
        ) : sms.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">Sin SMS enviados aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-3 py-2 font-semibold">Mensaje</th>
                  <th className="px-3 py-2 font-semibold">Destinatario</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                  <th className="px-3 py-2 font-semibold">Fecha envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sms.map((message) => (
                  <tr key={message.id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-mono text-cyan-300">{message.id}</td>
                    <td className="px-3 py-2 text-slate-300 max-w-xs truncate">{message.message}</td>
                    <td className="px-3 py-2 text-slate-400">{message.recipient}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        message.status === "sent" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {message.status === "sent" ? "✓ Enviado" : "⏳ Pendiente"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">{new Date(message.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Nuevo Correo */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" /> Nuevo correo
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">De</label>
                <input
                  type="email"
                  value="facturacion@fibraz.com"
                  disabled
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Para</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asunto</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Asunto del correo"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plantilla</label>
                <select
                  value={emailForm.template}
                  onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="none">-- Sin plantilla --</option>
                  <option value="payment_reminder">Recordatorio de pago</option>
                  <option value="invoice">Nueva factura</option>
                  <option value="welcome">Bienvenida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje</label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  placeholder="Contenido del correo..."
                  rows="6"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-2"
                >
                  {emailSending ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Enviar correo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo SMS */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-400" /> Nuevo SMS
              </h3>
              <button onClick={() => setShowSmsModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Para</label>
                <input
                  type="tel"
                  value={client?.phone || ""}
                  disabled
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje</label>
                <textarea
                  value={smsForm.message}
                  onChange={(e) => setSmsForm({ message: e.target.value.slice(0, 900) })}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="4"
                  maxLength="900"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {smsForm.message.length} / 900 caracteres
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSmsModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={smsSending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold rounded flex items-center gap-2"
                >
                  {smsSending ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Enviar SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
