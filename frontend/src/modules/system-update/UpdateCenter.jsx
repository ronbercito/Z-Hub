/**
 * Centro de actualizaciones conectado al módulo backend system_update.
 */
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Download, X, Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function changelog(items = []) {
  return items.map((item, index) => (
    <div key={index} className="rounded-lg bg-slate-950/70 p-3 text-xs">
      <b className="text-cyan-300">{item.type}</b>
      <p className="mt-1 text-slate-300">{item.text}</p>
    </div>
  ));
}

export default function UpdateCenter() {
  const { API, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const loadStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/system-update/status`, { headers, withCredentials: true });
      const next = response.data;
      setStatus(next);
      setError("");
      if (next.installation?.state === "success") {
        window.setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo consultar el estado de actualizaciones.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    loadStatus();
    const interval = window.setInterval(loadStatus, installing ? 4000 : 60000);
    return () => window.clearInterval(interval);
  }, [loadStatus, installing]);

  const install = async () => {
    setInstalling(true);
    setError("");
    try {
      await axios.post(`${API}/system-update/install`, {}, { headers, withCredentials: true });
      await loadStatus();
    } catch (err) {
      setInstalling(false);
      setError(err.response?.data?.detail || "No se pudo iniciar la actualización.");
    }
  };

  const installation = status?.installation;
  const hasFailure = ["rolled_back", "rollback_failed"].includes(installation?.state);
  const modal = open ? createPortal(
    <div onMouseDown={() => setOpen(false)} className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <section onMouseDown={(event) => event.stopPropagation()} className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex justify-between gap-4">
          <div>
            <b className="text-cyan-300 flex items-center gap-2"><Sparkles className="w-4 h-4" />Actualizaciones</b>
            <p className="mt-1 text-xs text-slate-400">
              Panel MikroHub · versión {status?.current?.version || "…"}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white" aria-label="Cerrar"><X /></button>
        </div>

        {loading && <p className="mt-5 text-sm text-slate-300">Consultando GitHub…</p>}
        {error && <p className="mt-5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}

        {!loading && status && (
          <>
            {status.available ? (
              <>
                <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <p className="text-sm font-semibold text-cyan-200">Nueva versión {status.remote.version} disponible</p>
                  <p className="mt-1 text-xs text-slate-300">Instalada: {status.current.version} · Git {status.current.commit}</p>
                </div>
                <p className="mt-5 text-xs uppercase tracking-wider text-slate-500">Cambios de la nueva versión</p>
                <div className="mt-2 space-y-2">{changelog(status.remote.changelog)}</div>
              </>
            ) : (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                El panel ya está actualizado: versión {status.current.version}.
              </div>
            )}

            {installation?.running && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                <RefreshCw className="mr-2 inline w-4 h-4 animate-spin" />Instalando actualización. El panel se recargará cuando termine correctamente.
              </div>
            )}
            {installation?.state === "success" && (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs text-emerald-100">
                <CheckCircle2 className="mr-2 inline w-4 h-4" />Actualización terminada; recargando el panel.
              </div>
            )}
            {hasFailure && (
              <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-100">
                <AlertTriangle className="mr-2 inline w-4 h-4" />La actualización falló y se restauró la versión anterior.
              </div>
            )}
            {installation?.log && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3 text-[10px] text-slate-400 whitespace-pre-wrap">{installation.log}</pre>
            )}
          </>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={loadStatus} disabled={loading || installing} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50">
            <RefreshCw className={`mr-1 inline w-4 h-4 ${loading ? "animate-spin" : ""}`} />Comprobar
          </button>
          <button onClick={install} disabled={!status?.available || installing} className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
            {installing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button onClick={() => setOpen(true)} title={status?.available ? "Nueva actualización disponible" : "Actualizaciones"} className={status?.available ? "flex items-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-3 py-2 text-xs font-bold text-white shadow-lg animate-pulse" : "p-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"}>
        <Download className="w-4 h-4" />{status?.available && <span>Nueva actualización</span>}
      </button>
      {modal}
    </>
  );
}
