/**
 * Archivo: frontend/src/modules/red/Network.jsx
 * Actualización: 2026-09-09 — versión 1.1.89, tarjetas MikroTik con estado real al cargar.
 * Función: Página "Gestión de Red": lista de equipos MikroTik / OLT registrados, estado real
 *          leído por API RouterOS (identidad, versión, CPU, RAM, uptime, latencia), botones de
 *          probar conexión / ping / sincronizar planes / cortes masivos, y pestañas en vivo
 *          (interfaces, PPPoE, colas, DHCP, address-list, hotspot) del MikroTik seleccionado, o pestañas
 *          de OLT VSOL (resumen, PON, ONUs, auto-find, óptica, consola) si el equipo es una OLT.
 * Trabaja con: modules/red/components/RouterCard.jsx, RouterForm.jsx, RouterLiveTabs.jsx, OltLiveTabs.jsx,
 *              backend/app/routers/red/router.py (/api/routers/*), context/AuthContext.js
 */
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { canPermission } from "../ajustes/staff/permissions";
import { TEST_IDS } from "../../constants/testIds";
import { Server, Plus, Activity, RefreshCw, Zap, ShieldOff, ListChecks, Users, UserX, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RouterCard from "./components/RouterCard";
import RouterForm from "./components/RouterForm";
import RouterLiveTabs from "./components/RouterLiveTabs";
import OltLiveTabs from "./components/OltLiveTabs";
import EquipmentMapModal from "./components/EquipmentMapModal";

const errMsg = (e, fallback) => e?.response?.data?.detail || fallback;

const CLIENT_METRIC_COLORS = { queues: "#197ed4", dhcp: "#7045c8", pppoe: "#129d8c", suspended: "#d8890b" };

const CLIENT_METRIC_STYLES = `
  [data-router-client-metric="queues"] { background: #197ed4 !important; border-color: #197ed4 !important; }
  [data-router-client-metric="dhcp"] { background: #7045c8 !important; border-color: #7045c8 !important; }
  [data-router-client-metric="pppoe"] { background: #129d8c !important; border-color: #129d8c !important; }
  [data-router-client-metric="suspended"] { background: #d8890b !important; border-color: #d8890b !important; }
  [data-router-client-metric] p, [data-router-client-metric] svg { color: #fff !important; opacity: 1 !important; }
`;

export default function Network({ focus = "mikrotik" }) {
  const { API, token, user } = useAuth();
  const canViewRouter = canPermission(user, "network", "view");
  const canViewOlt = canPermission(user, "olt", "view");
  const allowedTypes = { mikrotik: canViewRouter, olt: canViewOlt };
  const moduleForFocus = focus === "olt" ? "olt" : "network";
  const canCreateFocus = canPermission(user, moduleForFocus, "create");
  const canOperateNetwork = canPermission(user, "network", "operate");
  const headers = { Authorization: `Bearer ${token}` };
  const [routers, setRouters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [pingResult, setPingResult] = useState(null);
  const [clientCounts, setClientCounts] = useState(null);
  const [formRouter, setFormRouter] = useState(null); // null = cerrado, {} = nuevo, {...} = editar
  const [mapRouter, setMapRouter] = useState(null);
  const selectedModule = selected?.device_type === "olt" ? "olt" : "network";
  const canSelected = (action) => Boolean(selected) && canPermission(user, selectedModule, action);

  const fetchRouters = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/routers`, { headers });
      const rows = Array.isArray(res.data) ? res.data : [];

      // Las tarjetas necesitan datos de estado reales del MikroTik. El listado /routers
      // puede contener valores históricos/default (CPU, memoria y ping). Al cargar la página
      // sincronizamos cada MikroTik con el endpoint existente de prueba de conexión, que ya
      // ejecuta snapshot_router() y devuelve el router actualizado. Las OLT no se modifican.
      const refreshed = await Promise.all(rows.map(async (row) => {
        if (row.device_type !== "mikrotik") return row;
        try {
          const snapshot = await axios.post(`${API}/routers/${row.id}/test-connection`, {}, { headers });
          return snapshot.data?.router || row;
        } catch (e) {
          return row;
        }
      }));

      setRouters(refreshed);
      setSelected((prev) => (prev ? refreshed.find((r) => r.id === prev.id) || refreshed[0] || null : refreshed[0] || null));
    } catch (e) {
      toast.error("Error al cargar los equipos de red");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { fetchRouters(); }, [fetchRouters]);

  useEffect(() => {
    let cancelled = false;
    if (!selected || selected.device_type !== "mikrotik") {
      setClientCounts(null);
      return undefined;
    }

    setClientCounts(null);
    axios.get(`${API}/routers/${selected.id}/client-counts`, { headers })
      .then(({ data }) => {
        if (!cancelled) setClientCounts(data?.ok ? data.counts : null);
      })
      .catch(() => {
        if (!cancelled) setClientCounts(null);
      });

    return () => { cancelled = true; };
  }, [API, token, selected?.id, selected?.device_type]);


  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); } finally { setBusy(""); }
  };

  const testConnection = (r) => run("test", async () => {
    try {
      const res = await axios.post(`${API}/routers/${r.id}/test-connection`, {}, { headers });
      res.data.ok ? toast.success(res.data.message) : toast.error(res.data.message);
      fetchRouters();
    } catch (e) { toast.error(errMsg(e, "Error al probar la conexión")); }
  });

  const ping = (r) => run("ping", async () => {
    setPingResult(null);
    try {
      const res = await axios.post(`${API}/routers/${r.id}/ping`, {}, { headers });
      setPingResult(res.data);
      res.data.latency_ms !== null
        ? toast.success(`Respuesta de ${res.data.ip}:${res.data.port} en ${res.data.latency_ms} ms`)
        : toast.error(`Sin respuesta de ${res.data.ip}:${res.data.port}`);
      fetchRouters();
    } catch (e) { toast.error(errMsg(e, "Error al realizar ping")); }
  });

  const syncPlans = (r) => run("plans", async () => {
    try {
      const res = await axios.post(`${API}/routers/${r.id}/sync-plans`, {}, { headers });
      res.data.ok ? toast.success(res.data.message) : toast.error(res.data.message);
    } catch (e) { toast.error(errMsg(e, "Error al sincronizar planes")); }
  });

  const syncCuts = () => run("cuts", async () => {
    if (!window.confirm("¿Aplicar corte de servicio a todos los clientes con facturas vencidas?")) return;
    try {
      const res = await axios.post(`${API}/routers/sync-cuts`, {}, { headers });
      toast.success(res.data.message);
    } catch (e) { toast.error(errMsg(e, "Error al ejecutar cortes")); }
  });

  const visibleRouters = routers.filter((item) => item.device_type === focus && allowedTypes[item.device_type]);

  useEffect(() => {
    if (selected && selected.device_type !== focus) setSelected(visibleRouters[0] || null);
  }, [focus, routers]);

  const removeRouter = async (r) => {
    if (!window.confirm(`¿Eliminar el equipo "${r.name}"?`)) return;
    try {
      await axios.delete(`${API}/routers/${r.id}`, { headers });
      toast.success("Equipo eliminado");
      setSelected(null);
      fetchRouters();
    } catch (e) { toast.error(errMsg(e, "Error al eliminar")); }
  };

  return (
    <div className="network-reference space-y-6 animate-in fade-in duration-200" data-testid="network-page">
      <style>{CLIENT_METRIC_STYLES}</style>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" /> Gestión de Red · {focus === "olt" ? "OLT" : "Routers MikroTik"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Lectura en vivo vía API RouterOS (v6/v7): interfaces, PPPoE, colas, DHCP, address-list y hotspot
          </p>
        </div>
        <div className="flex items-center gap-2">
          {focus === "mikrotik" && canOperateNetwork && <button data-testid={TEST_IDS.BTN_SYNC_CUTS} onClick={syncCuts} disabled={busy === "cuts"}
            className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 text-xs font-semibold rounded-xl flex items-center gap-2 transition">
            <ShieldOff className="w-4 h-4" /> {busy === "cuts" ? "Aplicando..." : "Cortar morosos"}
          </button>}
          {canCreateFocus && <button data-testid={TEST_IDS.BTN_NEW_ROUTER} onClick={() => setFormRouter({})}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-600/20">
            <Plus className="w-4 h-4" /> Agregar {focus === "olt" ? "OLT" : "Router"}
          </button>}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Cargando equipos...</p>
      ) : visibleRouters.length === 0 ? (
        <div data-testid="routers-empty" className="p-10 border border-dashed border-slate-800 rounded-2xl text-center text-sm text-slate-400">
          No hay equipos autorizados para esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleRouters.map((r) => (
            <RouterCard
              key={r.id}
              router={r}
              selected={selected?.id === r.id}
              onSelect={() => { setSelected(r); setPingResult(null); }}
              onCoordinates={setMapRouter}
            >
              {r.device_type === "mikrotik" && selected?.id === r.id && canSelected("edit") && (
                <div className="flex justify-end">
                  <button data-testid="btn-edit-router" onClick={() => setFormRouter(r)}
                    className="network-router-edit-button px-2.5 py-1.5 bg-white hover:bg-cyan-50 text-blue-700 border border-cyan-100 text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition">
                    <Pencil className="w-3.5 h-3.5" /> Editar router
                  </button>
                </div>
              )}

              {r.device_type === "olt" && selected?.id === r.id && (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.ros_version && <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-violet-200 font-mono">Firmware {r.ros_version}</span>}
                    {r.board_name && <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">{r.board_name}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono break-words">
                    {r.ip_address}:{r.port} ({(r.protocol || "telnet").toUpperCase()} · {r.olt_model || r.pon_type} · {r.pon_type} v{r.software_version}) · usuario {r.username}
                    {r.private_ip && ` · IP privada ${r.private_ip}`}
                    {r.location && ` · ${r.location}`}
                  </p>
                  {r.last_error && <p className="text-[10px] text-rose-400 mt-1">Último error: {r.last_error}</p>}
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    {canSelected("operate") && <button data-testid="btn-test-connection" onClick={() => testConnection(r)} disabled={busy === "test"}
                      className="px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-700/50 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition disabled:opacity-40">
                      <RefreshCw className={`w-3.5 h-3.5 ${busy === "test" ? "animate-spin" : ""}`} /> Probar conexión CLI
                    </button>}
                    {canSelected("operate") && <button data-testid="btn-ping-router" onClick={() => ping(r)} disabled={busy === "ping"}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition">
                      <Activity className={`w-3.5 h-3.5 ${busy === "ping" ? "animate-spin text-cyan-400" : ""}`} /> Ping
                    </button>}
                    {canSelected("edit") && <button data-testid="btn-edit-router" onClick={() => setFormRouter(r)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg" title="Editar">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>}
                    {canSelected("delete") && <button data-testid="btn-delete-router" onClick={() => removeRouter(r)} className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 border border-slate-700 rounded-lg" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>}
                  </div>
                </>
              )}
            </RouterCard>
          ))}
        </div>
      )}

      {selected && (
        <div className="network-detail bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5" data-testid="router-detail">
          {selected.device_type === "mikrotik" && (
            <div className="network-router-summary-stats grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <Stat compact icon={ListChecks} label="Clientes colas simples" value={clientCounts?.simple_queues ?? "—"} tone="queues" />
              <Stat compact icon={Users} label="Clientes DHCP" value={clientCounts?.dhcp ?? "—"} tone="dhcp" />
              <Stat compact icon={Users} label="Clientes PPPoE" value={clientCounts?.pppoe ?? "—"} tone="pppoe" />
              <Stat compact icon={UserX} label="Clientes suspendidos" value={clientCounts?.suspended ?? "—"} tone="suspended" />
            </div>
          )}

          {pingResult && (
            <div data-testid="ping-result" className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-xs text-cyan-200 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              {pingResult.latency_ms !== null
                ? `Conexión TCP a ${pingResult.ip}:${pingResult.port} — tiempo=${pingResult.latency_ms} ms, pérdida=${pingResult.packet_loss}`
                : `Sin respuesta de ${pingResult.ip}:${pingResult.port} (pérdida 100%). Verifica IP, puerto API y firewall.`}
            </div>
          )}

          {selected.device_type === "mikrotik" ? <RouterLiveTabs router={selected} /> : <OltLiveTabs router={selected} routers={routers.filter((item) => item.device_type === "olt")} />}
        </div>
      )}

      {mapRouter && <EquipmentMapModal router={mapRouter} onClose={() => setMapRouter(null)} />}

      {formRouter !== null && (
        <RouterForm
          initial={formRouter && { ...formRouter, device_type: formRouter.id ? formRouter.device_type : focus }}
          onClose={() => setFormRouter(null)}
          onSaved={() => { setFormRouter(null); fetchRouters(); }}
        />
      )}
    </div>
  );
}

const Stat = ({ icon: Icon, label, value, valueClass = "text-slate-100", compact = false, tone }) => (
  <div ref={(node) => { const color = CLIENT_METRIC_COLORS[tone]; if (node && color) { node.style.setProperty("background", color, "important"); node.style.setProperty("border-color", color, "important"); node.querySelectorAll("p, svg").forEach((child) => child.style.setProperty("color", "#ffffff", "important")); } }} data-router-client-metric={tone} className={`network-stat network-stat--${label.toLowerCase().replace(/[^a-záéíóúñ]+/g, "-").replace(/^-|-$/g, "")} ${compact ? "p-2.5 rounded-lg" : "p-3 rounded-xl"} border border-slate-800 min-w-0`}>
    <p className={`${compact ? "text-[9px]" : "text-[10px]"} uppercase tracking-wider text-slate-500 flex items-center gap-1`}><Icon className="w-3 h-3" /> {label}</p>
    <p className={`${compact ? "text-xs" : "text-sm"} font-bold mt-1 font-mono truncate ${valueClass}`} title={String(value ?? "")}>{value}</p>
  </div>
);
