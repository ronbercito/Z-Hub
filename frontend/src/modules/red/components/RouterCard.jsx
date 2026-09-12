/**
 * Archivo: frontend/src/modules/red/components/RouterCard.jsx
 * Actualización: 2026-09-12 — 1.3.22, selección inmediata en toda la tarjeta.
 * Área: Gestión de Red > tarjetas de equipos.
 */
import React, { useState } from "react";
import axios from "axios";
import { Server, Cpu, HardDrive, Activity, Radio, Zap, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { canPermission } from "../../ajustes/staff/permissions";

const STATUS = {
  online: { label: "ONLINE", cls: "bg-emerald-500 text-white border-emerald-300 shadow-md shadow-emerald-950/30", dot: "bg-white animate-pulse" },
  offline: { label: "OFFLINE", cls: "bg-rose-600 text-white border-rose-300 shadow-md shadow-rose-950/40 ring-1 ring-rose-300/30", dot: "bg-white" },
  unknown: { label: "SIN PROBAR", cls: "bg-slate-700 text-slate-100 border-slate-500", dot: "bg-slate-300" },
};

export default function RouterCard({ router, selected, onSelect, onCoordinates, children }) {
  const { API, token, user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const st = STATUS[router.status] || STATUS.unknown;
  const isOlt = router.device_type === "olt";
  const Icon = isOlt ? Radio : Server;
  const moduleName = isOlt ? "olt" : "network";
  const canDelete = canPermission(user, moduleName, "delete");
  const childNodes = React.Children.toArray(children).filter(Boolean);
  const tone = isOlt
    ? { selected: "border-violet-400 shadow-violet-500/20 ring-2 ring-violet-400/30", icon: "bg-violet-500/10 text-violet-400 border-violet-500/20", ip: "text-violet-400", metric: "text-violet-400" }
    : { selected: "border-cyan-300 shadow-cyan-400/25 ring-2 ring-cyan-300/35", icon: "network-router-device-icon bg-white/95 text-cyan-700 border-white shadow-sm", ip: "text-cyan-400", metric: "text-cyan-400" };

  const stopPointer = (event) => event.stopPropagation();

  const removeFromCard = async (event) => {
    event.stopPropagation();
    if (isOlt || !canDelete || deleting) return;
    if (!window.confirm(`¿Eliminar el router "${router.name}"?`)) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/routers/${router.id}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 });
      toast.success("Router eliminado");
      window.location.reload();
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "No se pudo eliminar el router");
      setDeleting(false);
    }
  };

  return (
    <div
      data-testid={`router-card-${router.id}`}
      role="button"
      tabIndex={0}
      onPointerDown={(event) => { if (event.button === 0) onSelect?.(); }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(); }}
      className={`network-router-card ${isOlt ? "network-router-card--olt w-full md:w-[380px]" : "network-router-card--mikrotik w-full md:w-[310px]"} p-4 rounded-xl border cursor-pointer transition-all duration-100 relative overflow-hidden ${
        selected ? `bg-slate-900 ${tone.selected} shadow-xl` : `bg-slate-900/60 border-slate-800 ${isOlt ? "hover:border-violet-400/70" : "hover:border-cyan-300/70"}`
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`p-2 rounded-lg shrink-0 ${tone.icon}`}>
            {isOlt ? <Icon className="network-router-device-glyph w-5 h-5" /> : (
              <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" aria-hidden="true" stroke="#0878aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="5" width="16" height="7" rx="2" /><rect x="5" y="14" width="16" height="7" rx="2" />
                <circle cx="9" cy="8.5" r="0.7" fill="#0878aa" stroke="none" /><circle cx="9" cy="17.5" r="0.7" fill="#0878aa" stroke="none" />
                <path d="M24 18v-3m0 3 3-2m-3 2-3-2m0 6a4 4 0 1 0 6 0 4 4 0 0 0-6 0Zm3 0v3m-2-1.5h4" />
              </svg>
            )}
          </div>
          <div className="min-w-0"><h3 className="text-sm font-bold text-slate-100 truncate">{router.name}</h3><p className={`text-[11px] font-mono truncate ${tone.ip}`}>{router.ip_address}:{router.port}</p></div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onPointerDown={stopPointer}>
          <button type="button" onClick={(event) => { event.stopPropagation(); onCoordinates?.(router); }} title="Ver coordenadas" className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-cyan-300 hover:bg-slate-700"><MapPin className="h-3.5 w-3.5" /></button>
          <span className={`network-router-status network-router-status--${router.status || "unknown"} inline-flex items-center gap-1 px-2 py-1 rounded-full font-extrabold text-[10px] border tracking-wide ${st.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span> {st.label}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-3 truncate">{router.identity ? `${router.identity} · ` : ""}{router.board_name || router.model || (isOlt ? "OLT GPON" : "MikroTik RouterOS")}</p>

      {!isOlt && canDelete && (
        <div className="network-router-card-actions mb-2 flex justify-end" onPointerDown={stopPointer} onClick={stopPointer}>
          <button data-testid={`btn-delete-router-card-${router.id}`} type="button" disabled={deleting} onClick={removeFromCard}
            title={deleting ? "Eliminando router..." : "Eliminar router"} aria-label={deleting ? "Eliminando router" : "Eliminar router"}
            className="network-router-delete-button group inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white/80 bg-rose-600 text-white shadow-lg shadow-rose-950/45 ring-2 ring-rose-300/35 transition-all duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-red-500 hover:ring-red-200/70 focus:outline-none focus:ring-4 focus:ring-rose-200/60 disabled:cursor-wait disabled:opacity-60">
            <Trash2 className={`h-5 w-5 stroke-[2.5] transition-transform duration-150 ${deleting ? "animate-pulse" : "group-hover:scale-110"}`} />
          </button>
        </div>
      )}

      {childNodes.length > 0 && (
        <div onPointerDown={stopPointer} onClick={stopPointer} className={`mt-2 pt-3 border-t ${isOlt ? "border-violet-500/30" : "border-cyan-500/30"}`}>
          {childNodes}
        </div>
      )}

      <div className={`grid ${isOlt ? "grid-cols-2" : "grid-cols-3"} gap-2 text-[11px] pt-3 border-t border-slate-800`}>
        {isOlt ? <div className="flex items-center gap-1.5 text-slate-400"><Zap className={`w-3.5 h-3.5 ${tone.metric}`} /> PON: <span className="text-slate-200 font-bold">{router.pon_ports || "—"} {router.pon_type || ""}</span></div> : <div className="flex items-center gap-1.5 text-slate-400"><Cpu className="w-3.5 h-3.5 text-slate-500" /> CPU: <span className="text-slate-200 font-bold">{router.cpu_usage_pct}%</span></div>}
        {!isOlt && <div className="flex items-center gap-1.5 text-slate-400"><HardDrive className="w-3.5 h-3.5 text-violet-400" /> Mem: <span className="text-slate-200 font-bold">{router.memory_usage_pct}%</span></div>}
        <div className="flex items-center gap-1.5 text-slate-400"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Ping: <span className="text-slate-200 font-bold">{router.ping_ms ? `${router.ping_ms} ms` : "—"}</span></div>
      </div>
    </div>
  );
}
