/**
 * Archivo: frontend/src/modules/red/components/RouterCard.jsx
 * Actualización: 2026-09-09 — versión 1.1.76, icono y estado de router reforzados.\n * Área: Gestión de Red > tarjetas de equipos.
 * Función: Tarjeta resumen de un equipo de red (MikroTik u OLT) con estado online/offline
 *          real, IP, modelo y latencia. En MikroTik muestra CPU; en OLT muestra puertos PON.
 * Alcance: Diferencia visualmente MikroTik (cyan) y OLT VSOL (violeta).
 * No modifica conexiones, datos, estado, acciones ni las pestañas del equipo.
 * Trabaja con: modules/red/Network.jsx, backend/app/models/router.py (campos mostrados)
 */
import React from "react";
import { Server, Cpu, HardDrive, Activity, Radio, Zap, MapPin } from "lucide-react";

const STATUS = {
  online: { label: "ONLINE", cls: "bg-emerald-500 text-white border-emerald-300 shadow-sm shadow-emerald-950/20", dot: "bg-white animate-pulse" },
  offline: { label: "OFFLINE", cls: "bg-rose-500/20 text-rose-400 border-rose-500/30", dot: "bg-rose-400" },
  unknown: { label: "SIN PROBAR", cls: "bg-slate-700/40 text-slate-300 border-slate-600/40", dot: "bg-slate-400" },
};

export default function RouterCard({ router, selected, onSelect, onCoordinates, children }) {
  const st = STATUS[router.status] || STATUS.unknown;
  const isOlt = router.device_type === "olt";
  const Icon = isOlt ? Radio : Server;
  const tone = isOlt
    ? { accent: "violet", selected: "border-violet-500 shadow-violet-500/10", icon: "bg-violet-500/10 text-violet-400 border-violet-500/20", ip: "text-violet-400", metric: "text-violet-400" }
    : { accent: "cyan", selected: "border-cyan-500 shadow-cyan-500/10", icon: "network-router-device-icon bg-white/95 text-cyan-700 border-white shadow-sm", ip: "text-cyan-400", metric: "text-cyan-400" };

  return (
    <div
      data-testid={`router-card-${router.id}`}
      onClick={onSelect}
      className={`network-router-card ${isOlt ? "network-router-card--olt w-full md:w-[380px]" : "network-router-card--mikrotik w-full md:w-[290px]"} p-4 rounded-xl border cursor-pointer transition relative overflow-hidden ${
        selected ? `bg-slate-900 ${tone.selected} shadow-xl` : `bg-slate-900/60 border-slate-800 ${isOlt ? "hover:border-violet-500/60" : "hover:border-cyan-500/60"}`
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-2 rounded-lg ${tone.icon}`}>
            <Icon className="network-router-device-glyph w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">{router.name}</h3>
            <p className={`text-[11px] font-mono ${tone.ip}`}>{router.ip_address}:{router.port}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={(event) => { event.stopPropagation(); onCoordinates?.(router); }} title="Ver coordenadas" className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-cyan-300 hover:bg-slate-700"><MapPin className="h-3.5 w-3.5" /></button>
          <span className={`network-router-status network-router-status--${router.status || "unknown"} inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${st.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {st.label}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 truncate">
        {router.identity ? `${router.identity} · ` : ""}{router.board_name || router.model || (isOlt ? "OLT GPON" : "MikroTik RouterOS")}
      </p>

      {children && (
        <div onClick={(event) => event.stopPropagation()} className={`mt-4 pt-4 border-t ${isOlt ? "border-violet-500/30" : "border-cyan-500/30"}`}>
          {children}
        </div>
      )}

      <div className={`grid ${isOlt ? "grid-cols-2" : "grid-cols-3"} gap-2 text-[11px] pt-3 border-t border-slate-800`}>
        {isOlt ? (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className={`w-3.5 h-3.5 ${tone.metric}`} /> PON: <span className="text-slate-200 font-bold">{router.pon_ports || "—"} {router.pon_type || ""}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-slate-500" /> CPU: <span className="text-slate-200 font-bold">{router.cpu_usage_pct}%</span>
          </div>
        )}

        {!isOlt && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-violet-400" /> Mem: <span className="text-slate-200 font-bold">{router.memory_usage_pct}%</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" /> Ping: <span className="text-slate-200 font-bold">{router.ping_ms ? `${router.ping_ms} ms` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
