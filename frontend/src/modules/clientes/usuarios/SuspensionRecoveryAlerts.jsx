import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Phone, MapPin, Radio, Clock3, RefreshCw, PackageCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const fmt = (value) => value ? new Date(`${String(value).slice(0,10)}T12:00:00`).toLocaleDateString("es-PE") : "—";

export default function SuspensionRecoveryAlerts({ onOpenRecovery }) {
  const { API, token } = useAuth();
  const [data, setData] = useState({ enabled: true, threshold_months: 3, alert_count: 0, alerts: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/client-alerts/suspensions`, { headers: { Authorization: `Bearer ${token}` } });
      setData(response.data || { enabled: true, threshold_months: 3, alert_count: 0, alerts: [] });
    } catch (_) {
      // La alerta es complementaria; un fallo no debe bloquear la administración de clientes.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [API, token]);

  if (loading || !data.enabled || !data.alert_count) return null;

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-lg">
      <div className="flex flex-col gap-3 border-b border-amber-500/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300"><AlertTriangle className="h-5 w-5" /></span>
          <div>
            <h3 className="font-bold text-amber-200">Clientes con suspensión prolongada: {data.alert_count}</h3>
            <p className="mt-0.5 text-xs text-slate-400">Superaron la política configurada de {data.threshold_months} {data.threshold_months === 1 ? "mes" : "meses"}. Revísalos para evaluar recuperación de equipos.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onOpenRecovery && <button type="button" onClick={onOpenRecovery} className="flex items-center gap-2 self-start rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400"><PackageCheck className="h-3.5 w-3.5" />Recuperación</button>}
          <button type="button" onClick={load} className="flex items-center gap-2 self-start rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/10"><RefreshCw className="h-3.5 w-3.5" />Actualizar</button>
        </div>
      </div>

      <div className="divide-y divide-amber-500/10">
        {data.alerts.map((client) => (
          <div key={client.id} className="grid grid-cols-1 gap-3 px-4 py-3 text-xs lg:grid-cols-[1.35fr_1fr_1fr_auto] lg:items-center">
            <div><div className="font-bold text-slate-100">{client.full_name}</div><div className="mt-1 text-slate-500">DNI/RUC: {client.dni_ruc || "—"}</div></div>
            <div className="space-y-1 text-slate-400"><div><Phone className="mr-1 inline h-3.5 w-3.5" />{client.phone || "Sin teléfono"}</div><div><MapPin className="mr-1 inline h-3.5 w-3.5" />{client.address || "Sin dirección"}</div></div>
            <div className="space-y-1 text-slate-400"><div><Radio className="mr-1 inline h-3.5 w-3.5" />{client.router_name || "Sin router"}{client.onu_sn ? ` · ONU ${client.onu_sn}` : ""}</div><div><Clock3 className="mr-1 inline h-3.5 w-3.5" />Suspendido desde {fmt(client.suspended_at)}</div></div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-center font-black text-rose-300">{client.months_suspended} {client.months_suspended === 1 ? "mes" : "meses"}{client.extra_days ? ` + ${client.extra_days} d` : ""}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
