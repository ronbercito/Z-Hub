/**
 * Archivo: frontend/src/modules/red/components/RouterCard.jsx
 * Actualización: 2026-09-12 — 1.3.31, la métrica Tráfico se reemplaza por clientes DHCP bound.
 * Área: Gestión de Red > tarjetas de equipos.
 */
import React, { useState } from "react";
import axios from "axios";
import {
  Server, Cpu, HardDrive, Activity, Radio, Zap, MapPin, Trash2,
  Users, ListChecks, Wifi, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { canPermission } from "../../ajustes/staff/permissions";
import RouterCardMetric from "./RouterCardMetric";

const STATUS = {
  online: { label: "ONLINE", dot: "router-status-dot--online" },
  alert: { label: "ALERTA", dot: "router-status-dot--alert" },
  offline: { label: "OFFLINE", dot: "router-status-dot--offline" },
  unknown: { label: "DESCONOCIDO", dot: "router-status-dot--unknown" },
};

const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const pingProgress = (ping) => {
  const value = num(ping);
  if (!value) return 0;
  return Math.max(8, Math.min(100, 100 - value));
};

export default function RouterCard({ router, selected, onSelect, onCoordinates, children }) {
  const { API, token, user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const isOlt = router.device_type === "olt";
  const moduleName = isOlt ? "olt" : "network";
  const canDelete = canPermission(user, moduleName, "delete");
  const childNodes = React.Children.toArray(children).filter(Boolean);
  const stopPointer = (event) => event.stopPropagation();

  const visualState = router.status === "offline"
    ? "offline"
    : router.status !== "online"
      ? "unknown"
      : (num(router.ping_ms) >= 80 || num(router.cpu_usage_pct) >= 90 || num(router.memory_usage_pct) >= 90)
        ? "alert"
        : "online";
  const st = STATUS[visualState];

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

  if (isOlt) {
    return (
      <div
        data-testid={`router-card-${router.id}`}
        role="button"
        tabIndex={0}
        onPointerDown={(event) => { if (event.button === 0) onSelect?.(); }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(); }}
        className={`network-router-card network-router-card--olt w-full md:w-[380px] p-4 rounded-xl border cursor-pointer transition-all duration-100 relative overflow-hidden ${selected ? "bg-slate-900 border-violet-400 shadow-xl ring-2 ring-violet-400/30" : "bg-slate-900/60 border-slate-800 hover:border-violet-400/70"}`}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-lg shrink-0 bg-violet-500/10 text-violet-400 border border-violet-500/20"><Radio className="w-5 h-5" /></div>
            <div className="min-w-0"><h3 className="text-sm font-bold text-slate-100 truncate">{router.name}</h3><p className="text-[11px] font-mono truncate text-violet-400">{router.ip_address}:{router.port}</p></div>
          </div>
          <span className={`network-router-status network-router-status--${router.status || "unknown"} inline-flex items-center gap-1 px-2 py-1 rounded-full font-extrabold text-[10px] border tracking-wide`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{router.status === "online" ? "ONLINE" : router.status === "offline" ? "OFFLINE" : "SIN PROBAR"}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 truncate">{router.identity ? `${router.identity} · ` : ""}{router.board_name || router.model || "OLT GPON"}</p>
        {childNodes.length > 0 && <div onPointerDown={stopPointer} onClick={stopPointer} className="mt-2 pt-3 border-t border-violet-500/30">{childNodes}</div>}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400"><Zap className="w-3.5 h-3.5 text-violet-400" /> PON: <span className="text-slate-200 font-bold">{router.pon_ports || "—"} {router.pon_type || ""}</span></div>
          <div className="flex items-center gap-1.5 text-slate-400"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Ping: <span className="text-slate-200 font-bold">{router.ping_ms ? `${router.ping_ms} ms` : "—"}</span></div>
        </div>
      </div>
    );
  }

  const locationReady = Math.abs(num(router.latitude)) > 0.0001 || Math.abs(num(router.longitude)) > 0.0001;
  const routerName = String(router.name || "").trim() || "Router MikroTik";
  const routerIp = String(router.ip_address || "").trim() || "IP no disponible";
  const routerPort = router.port || router.cli_port || 8728;
  const routerModel = String(router.board_name || router.model || router.identity || "MikroTik RouterOS").trim();

  return (
    <article
      data-testid={`router-card-${router.id}`}
      data-router-visual-state={visualState}
      role="button"
      tabIndex={0}
      onPointerDown={(event) => { if (event.button === 0) onSelect?.(); }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(); }}
      className={`network-router-card network-router-card--mikrotik network-router-card--modern ${selected ? "is-selected" : ""}`}
    >
      <header className="router-modern-header">
        <div className="router-modern-device">
          <div className="router-modern-device-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="16" height="7" rx="2" /><rect x="5" y="14" width="16" height="7" rx="2" />
              <circle cx="9" cy="8.5" r="0.7" fill="currentColor" stroke="none" /><circle cx="9" cy="17.5" r="0.7" fill="currentColor" stroke="none" />
              <path d="M24 18v-3m0 3 3-2m-3 2-3-2m0 6a4 4 0 1 0 6 0 4 4 0 0 0-6 0Zm3 0v3m-2-1.5h4" />
            </svg>
          </div>
          <div className="router-modern-identity-panel" data-testid={`router-identity-${router.id}`}>
            <div className="router-modern-identity-name-row">
              <span className="router-modern-identity-name">{routerName}</span>
              {selected && <span className="router-modern-favorite" title="Router seleccionado">★</span>}
            </div>
            <span className="router-modern-identity-address">{routerIp}:{routerPort}</span>
            <span className="router-modern-identity-model">{routerModel}</span>
          </div>
        </div>
        <span className={`router-modern-status router-modern-status--${visualState}`}>
          <span className={`router-status-dot ${st.dot}`} /> {st.label}
        </span>
      </header>

      <section className="router-modern-primary-metrics">
        <RouterCardMetric icon={Cpu} label="CPU" value={`${num(router.cpu_usage_pct)}%`} progress={router.cpu_usage_pct} tone="emerald" />
        <RouterCardMetric icon={HardDrive} label="Memoria" value={`${num(router.memory_usage_pct)}%`} progress={router.memory_usage_pct} tone="blue" />
        <RouterCardMetric icon={Activity} label="Ping" value={router.ping_ms ? `${router.ping_ms} ms` : "—"} progress={pingProgress(router.ping_ms)} tone="emerald" />
      </section>

      <section className="router-modern-secondary-metrics">
        <RouterCardMetric icon={Users} label="PPPoE" value={num(router.active_pppoe_count)} tone="violet" />
        <RouterCardMetric icon={ListChecks} label="Colas" value={num(router.active_queues_count)} tone="amber" />
        <RouterCardMetric icon={Wifi} label="DHCP" value={num(router.dhcp_bound_count)} tone="cyan" />
      </section>

      <footer className="router-modern-footer">
        <div className="router-modern-location">
          <MapPin aria-hidden="true" />
          <div>
            <strong>{router.location || (locationReady ? "Ubicación guardada" : "Sin ubicación")}</strong>
            <span>{locationReady ? `${num(router.latitude).toFixed(4)}, ${num(router.longitude).toFixed(4)}` : "0.0000, 0.0000"}</span>
          </div>
        </div>
        <div className="router-modern-actions" onPointerDown={stopPointer} onClick={stopPointer}>
          <button type="button" onClick={(event) => { event.stopPropagation(); onCoordinates?.(router); }} title="Ver en mapa" aria-label="Ver en mapa" className="router-modern-action router-modern-action--map"><MapPin /></button>
          {childNodes.length > 0 && <div className="router-modern-extra-actions">{childNodes}</div>}
          {canDelete && (
            <button data-testid={`btn-delete-router-card-${router.id}`} type="button" disabled={deleting} onClick={removeFromCard}
              title={deleting ? "Eliminando router..." : "Eliminar router"} aria-label={deleting ? "Eliminando router" : "Eliminar router"}
              className="network-router-delete-button router-modern-action router-modern-action--delete">
              <Trash2 className={deleting ? "animate-pulse" : ""} />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
