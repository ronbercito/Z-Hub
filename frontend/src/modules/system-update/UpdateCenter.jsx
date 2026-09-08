/**
 * Archivo: frontend/src/modules/system-update/UpdateCenter.jsx
 * Actualización: 2026-09-08 — feedback visual inmediato al comprobar actualizaciones.
 * Función: consulta, presenta e inicia actualizaciones del panel, mostrando claramente cuando la comprobación está en curso.
 * Recibe: API, token y logout desde AuthContext; estado desde /api/system-update.
 * Entrega: ventana de actualización al Layout y cierre de sesión tras éxito.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Download, X, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Changelog = ({ items = [] }) => items.map((item, index) => (
  <div key={index} className="rounded-lg bg-slate-950/70 p-3 text-xs">
    <b className="text-cyan-300">{item.type}</b><p className="mt-1 text-slate-300">{item.text}</p>
  </div>
));

export default function UpdateCenter() {
  const { API, token, logout } = useAuth();
  const [open, setOpen] = useState(false), [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState(null), [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false), [error, setError] = useState("");
  const startedHere = useRef(false), logoutQueued = useRef(false);
  const headers = token ? { Authorization: "Bearer " + token } : {};

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const response = await axios.get(API + "/system-update/status", {
        headers: { ...headers, "Cache-Control": "no-cache" },
        params: { checked_at: Date.now() },
        withCredentials: true
      });
      const next = response.data;
      setStatus(next); setError("");
      if (["rolled_back", "rollback_failed"].includes(next.installation?.state)) {
        setInstalling(false);
      }
      if (next.installation?.state === "success" && startedHere.current && !logoutQueued.current) {
        logoutQueued.current = true; setInstalling(false);
        window.setTimeout(async () => { await logout(); setOpen(false); }, 1600);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo consultar el estado de actualizaciones.");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [API, token, logout]);

  useEffect(() => {
    check();
    const timer = window.setInterval(check, installing ? 3500 : 60000);
    return () => window.clearInterval(timer);
  }, [check, installing]);

  const start = async () => {
    setConfirmOpen(false); setInstalling(true); startedHere.current = true; logoutQueued.current = false; setError("");
    try {
      await axios.post(API + "/system-update/install", {}, { headers, withCredentials: true });
      await check();
    } catch (err) {
      startedHere.current = false; setInstalling(false);
      setError(err.response?.data?.detail || "No se pudo iniciar la actualización.");
    }
  };

  const installation = status?.installation;
  const progress = Math.min(100, Math.max(0, installation?.progress || (installing ? 5 : 0)));
  const failed = ["rolled_back", "rollback_failed"].includes(installation?.state);
  const showProgress = installing || (installation?.state === "success" && startedHere.current) || failed;
  const previousSuccess = installation?.state === "success" && !startedHere.current;

  const confirmation = confirmOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-300"><LogOut className="w-5 h-5" /><b>Confirmar actualización</b></div>
        <p className="mt-4 text-sm text-slate-200">Se instalará la versión {status?.remote?.version}. Al llegar al 100 %, la sesión se cerrará para que ingreses nuevamente y veas los cambios.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => setConfirmOpen(false)} className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm text-slate-200">Cancelar</button>
          <button onClick={start} className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950">Continuar</button>
        </div>
      </section>
    </div>, document.body
  ) : null;

  const dialog = open ? createPortal(
    <div onMouseDown={() => !installing && setOpen(false)} className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <section onMouseDown={event => event.stopPropagation()} className="max-w-lg w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="flex justify-between gap-4"><div><b className="flex items-center gap-2 text-cyan-300"><Sparkles className="w-4 h-4" />Actualizaciones</b><p className="mt-1 text-xs text-slate-400">Panel MikroHub · versión {status?.current?.version || "…"}</p></div>{!installing && <button onClick={() => setOpen(false)} className="text-slate-400"><X /></button>}</div>
        {loading && <p className="mt-5 text-sm text-slate-300">Comprobando actualizaciones…</p>}
        {error && <p className="mt-5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}
        {!loading && status && <>
          <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">{status.available ? <><p className="text-sm font-semibold text-cyan-200">Nueva versión {status.remote.version} disponible</p><p className="mt-1 text-xs text-slate-300">Instalada: versión {status.current.version}</p></> : <p className="text-sm text-emerald-200">El panel ya está actualizado: versión {status.current.version}.</p>}</div>
          {status.available && <><p className="mt-5 text-xs uppercase tracking-wider text-slate-500">Cambios de la nueva versión</p><div className="mt-2 space-y-2"><Changelog items={status.remote.changelog} /></div></>}
          {previousSuccess && <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100"><CheckCircle2 className="mr-1 inline w-4 h-4" />Actualización versión {status.current.version} instalada correctamente.</div>}
          {showProgress && <div className="mt-5 rounded-xl border border-cyan-500/30 bg-slate-950/70 p-4"><div className="flex justify-between text-xs text-slate-200"><span>{failed ? "No se pudo completar la actualización" : installation?.phase || "Preparando actualización"}</span><b>{progress}%</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className={"h-full rounded-full transition-all duration-500 " + (failed ? "bg-rose-500" : "bg-cyan-400")} style={{ width: progress + "%" }} /></div>{installation?.state === "success" && <p className="mt-3 text-xs text-emerald-200"><CheckCircle2 className="mr-1 inline w-4 h-4" />Actualización finalizada. Cerrando sesión…</p>}{failed && <><p className="mt-3 text-xs text-rose-200"><AlertTriangle className="mr-1 inline w-4 h-4" />Se restauró la versión anterior.</p>{installation?.error && <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-rose-950/30 p-2 text-[11px] text-rose-200">{installation.error}</pre>}</>}</div>}
        </>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={check}
            disabled={loading || installing || checking}
            className={(checking ? "bg-cyan-500/10 border-cyan-400/60 text-cyan-200 animate-pulse " : "") + "rounded-xl border px-4 py-2.5 text-sm transition-all duration-150 active:scale-95 disabled:opacity-50"}
          >
            <RefreshCw className={(checking ? "animate-spin " : "") + "mr-1 inline w-4 h-4"} />
            {checking ? "Buscando actualización…" : "Comprobar"}
          </button>
          <button onClick={() => setConfirmOpen(true)} disabled={!status?.available || installing || checking} className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950 transition-all duration-150 active:scale-[0.98] disabled:opacity-50">{installing ? "Actualizando…" : "Actualizar"}</button>
        </div>
        {checking && <p className="mt-2 text-center text-xs text-cyan-300 animate-pulse">Consultando el servidor y verificando si existe una nueva versión…</p>}
      </section>
    </div>, document.body
  ) : null;
  const newer = status?.available;
  return <>{dialog}{confirmation}<button onClick={() => setOpen(true)} title={newer ? "Nueva actualización disponible" : "Actualizaciones"} className={newer ? "flex items-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-3 py-2 text-xs font-bold text-white shadow-lg animate-pulse" : "p-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-300"}><Download className="w-4 h-4" />{newer && <span>Nueva actualización</span>}</button></>;
}
