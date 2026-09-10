import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserPlus, PauseCircle, UserMinus, Bell, SlidersHorizontal, ShieldAlert, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";

/**
 * Archivo: frontend/src/modules/ajustes/clientes/ClientSettings.jsx
 * Función: preferencias exclusivas del módulo Clientes.
 */
export default function ClientSettings() {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [months, setMonths] = useState(3);

  useEffect(() => {
    axios.get(`${API}/settings`, { headers })
      .then((response) => {
        setEnabled(response.data.long_suspension_alert_enabled !== false);
        const value = Number(response.data.long_suspension_alert_months || 3);
        setMonths(Math.min(6, Math.max(1, value)));
      })
      .catch(() => toast.error("No se pudo cargar la configuración de clientes"))
      .finally(() => setLoading(false));
  }, [API, token]);

  const saveSuspensionPolicy = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, {
        long_suspension_alert_enabled: enabled,
        long_suspension_alert_months: Number(months),
      }, { headers });
      toast.success("Política de suspensión prolongada guardada");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const groups = [
    { icon: UserPlus, title: "Registro y altas", text: "Opciones relacionadas con el alta, tecnología, planes y datos iniciales del abonado." },
    { icon: PauseCircle, title: "Pausas de servicio", text: "Preferencias relacionadas con pausas temporales, reactivación y avisos previos." },
    { icon: UserMinus, title: "Retiros y reactivaciones", text: "Opciones del flujo de clientes retirados y su posterior retorno al servicio." },
    { icon: Bell, title: "Avisos del cliente", text: "Alertas operativas relacionadas con clientes suspendidos y otras situaciones que requieren seguimiento." },
  ];

  return (
    <div className="settings-page space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-100">
          <Users className="h-6 w-6 text-cyan-400" /> Configuración clientes
        </h2>
        <p className="mt-1 text-xs text-slate-400">Preferencias que controlan alertas y comportamiento del módulo Clientes.</p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><SlidersHorizontal className="h-5 w-5" /></span>
          <div>
            <h3 className="font-bold text-slate-100">Configuración del módulo Clientes</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Aquí se concentran las reglas específicas del panel de clientes sin mezclarlas con la configuración general.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
              <div className="flex items-center gap-2 font-bold text-slate-200"><Icon className="h-4 w-4 text-cyan-400" />{title}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"><ShieldAlert className="h-5 w-5" /></span>
          <div>
            <h3 className="font-bold text-slate-100">Alerta por suspensión prolongada</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Avisa cuando un cliente permanece suspendido demasiado tiempo para que puedas evaluar recuperación de ONU, router u otros equipos.</p>
          </div>
        </div>

        {loading ? <div className="py-6 text-sm text-slate-500">Cargando configuración…</div> : <div className="mt-5 space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/45 p-4">
            <div>
              <div className="text-sm font-bold text-slate-200">Activar alerta</div>
              <div className="mt-1 text-xs text-slate-500">Solo genera un aviso visual. No retira ni elimina al cliente automáticamente.</div>
            </div>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-5 w-5 accent-cyan-500" />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">Mostrar alerta después de</span>
              <select value={months} disabled={!enabled} onChange={(e) => setMonths(Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-100 disabled:opacity-50">
                {[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "mes" : "meses"} suspendido</option>)}
              </select>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">El tiempo se cuenta desde que el cliente entra al estado Suspendido. Los clientes en Pausa temporal no participan.</p>
            </label>
            <button type="button" disabled={saving} onClick={saveSuspensionPolicy} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-400 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Guardando…" : "Guardar política"}
            </button>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-200">
            Cuando se cumpla el plazo, el aviso permanecerá visible y mostrará cuántos meses lleva suspendido el cliente. La decisión de retirarlo o recuperar equipos sigue siendo manual.
          </div>
        </div>}
      </section>
    </div>
  );
}
