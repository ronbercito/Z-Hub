/**
 * Archivo: frontend/src/modules/red/components/olt-tabs/OltSummaryTab.jsx
 * Pertenece a: Red > OLT > pestaña "Resumen".
 * Función: Tablero operativo de la OLT seleccionada con métricas reales de sistema,
 *          ONUs por PON y el estado de las OLTs registradas.
 * Regla: No inventa disponibilidad, tráfico ni alarmas: usa "—" hasta que el
 *          equipo responda y clasifica como alerta las ONUs fuera de línea.
 */
import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Cpu, HardDrive, Radio, Thermometer, Users } from "lucide-react";

function infoFromRaw(raw) {
  const info = {};
  for (const line of String(raw || "").split(/\r?\n/)) {
    const match = line.match(/^\s*([^:]+):\s*(.+?)\s*$/);
    if (match) info[match[1].trim()] = match[2].trim();
  }
  return info;
}

const percent = (value) => {
  const found = String(value || "").match(/-?\d+(?:[.,]\d+)?/);
  return found ? Math.max(0, Math.min(100, Number(found[0].replace(",", ".")))) : null;
};

const Metric = ({ label, value, hint, tone = "text-slate-100" }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 min-w-0">
    <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold font-mono ${tone}`}>{value}</p>
    {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
  </div>
);

const Bar = ({ label, value, suffix = "", tone = "bg-emerald-400" }) => {
  const amount = percent(value);
  return (
    <div className="grid grid-cols-[100px_1fr_auto] items-center gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${amount ?? 0}%` }} />
      </div>
      <span className="font-mono font-semibold text-slate-200">{amount === null ? "—" : `${amount}${suffix}`}</span>
    </div>
  );
};

export default function OltSummaryTab({ res, router, routers = [], onuCounts, onusLoading = false }) {
  const rawInfo = infoFromRaw(res?.raw);
  const info = Object.keys(rawInfo).length ? rawInfo : (res?.info || {});
  const onlineOlts = routers.filter((item) => item.status === "online").length;
  const oltTotal = routers.length || 1;
  const counts = onuCounts || { total: "—", online: "—", offline: "—", unknown: "—" };
  const isOnline = router?.status === "online";
  const temperature = info.Temperature || "—";
  const cpu = info["CPU Usage"] || "—";
  const memory = info["Memory Usage"] || "—";
  const uptime = info["Running Time"] || info.Uptime || "—";

  return (
    <div className="space-y-3" data-testid="olt-summary-dashboard">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric label="OLTs en línea" value={`${onlineOlts}/${oltTotal}`} tone="text-emerald-300" />
        <Metric label="ONUs en línea" value={onusLoading ? "…" : counts.online} hint={onusLoading ? "Consultando todos los PON…" : `de ${counts.total} autorizadas`} tone="text-emerald-300" />
        <Metric label="ONUs autorizadas" value={onusLoading ? "…" : counts.total} hint={onusLoading ? "Lectura en curso" : `sin estado: ${counts.unknown}`} />
        <Metric label="Alertas activas" value={onusLoading ? "…" : counts.offline} hint="ONUs fuera de línea" tone={Number(counts.offline) > 0 ? "text-amber-300" : "text-emerald-300"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <section className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-4">Salud de la OLT seleccionada</p>
          <div className="space-y-3">
            <Bar label="Uso de CPU" value={cpu} suffix="%" tone="bg-cyan-400" />
            <Bar label="Uso de memoria" value={memory} suffix="%" tone="bg-violet-400" />
            <Bar label="Temperatura" value={temperature} suffix=" °C" tone="bg-amber-400" />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-400">
            <span><Activity className="inline w-3.5 h-3.5 text-cyan-300 mr-1" />Tiempo activa: <b className="text-slate-200 font-mono">{uptime}</b></span>
            <span><Radio className="inline w-3.5 h-3.5 text-violet-300 mr-1" />PON: <b className="text-slate-200 font-mono">{router?.pon_ports || "—"} {router?.pon_type || "PON"}</b></span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Disponibilidad actual</p>
          <div className={`mt-3 w-28 h-28 rounded-full border-[7px] flex flex-col items-center justify-center ${isOnline ? "border-emerald-400" : "border-rose-400"}`}>
            <strong className={`text-lg font-mono ${isOnline ? "text-emerald-300" : "text-rose-300"}`}>{isOnline ? "EN LÍNEA" : "FUERA DE LÍNEA"}</strong>
            <span className="text-[9px] text-slate-400">última lectura</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">El porcentaje histórico se mostrará cuando exista monitoreo guardado.</p>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <section className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Estado de OLTs</p>
          <div className="space-y-2">
            {(routers.length ? routers : [router]).filter(Boolean).map((item) => {
              const online = item.status === "online";
              return (
                <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-800 bg-slate-950/45 px-3 py-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <b className="text-slate-200 min-w-28">{item.name}</b>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] ${online ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-rose-500/30 text-rose-300 bg-rose-500/10"}`}>{online ? "En línea" : "Fuera de línea"}</span>
                  <span className="ml-auto text-slate-400 font-mono">CPU {item.cpu_usage_pct ?? "—"}% · {item.ping_ms ? `${item.ping_ms} ms` : "sin ping"}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Actividad reciente</p>
          <div className="space-y-3 text-[11px]">
            <p className="flex gap-2 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />Sistema: {info["System Name"] || router?.name || "—"}</p>
            <p className="flex gap-2 text-slate-300"><Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />Firmware: {info["Software Version"] || router?.ros_version || "—"}</p>
            <p className="flex gap-2 text-slate-300"><Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />Temperatura: {temperature}</p>
            <p className="flex gap-2 text-slate-300"><Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />ONUs: {onusLoading ? "consultando…" : `${counts.online} en línea / ${counts.offline} fuera de línea`}</p>
            {router?.last_error && <p className="flex gap-2 text-rose-300"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{router.last_error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
