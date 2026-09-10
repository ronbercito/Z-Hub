import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Clock3, Infinity as InfinityIcon, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./license-settings.css";

const STATUS = {
  active: { label:"Licencia activa", tone:"ok", icon:CheckCircle2 },
  trial_expired: { label:"Trial finalizado", tone:"warn", icon:AlertTriangle },
  invalid: { label:"Licencia no válida", tone:"danger", icon:AlertTriangle },
  missing: { label:"Sin licencia", tone:"danger", icon:AlertTriangle },
};

const planLabel = (plan, maxClients) => {
  if (plan === "TRIAL") return "Trial";
  if (plan === "UNLIMITED" || maxClients == null) return "Ilimitado";
  const match = String(plan || "").match(/(\d+)/);
  return match ? `Plan ${match[1]}` : (plan || "Licencia pagada");
};

export default function LicenseSettings() {
  const { API, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API}/settings/license-info`, { headers:{ Authorization:`Bearer ${token}` } });
      setData(response.data || {});
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo consultar la licencia de esta instalación.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => { load(); }, [load]);

  const status = STATUS[data?.status] || STATUS.invalid;
  const StatusIcon = status.icon;
  const isTrial = String(data?.type || "").toUpperCase() === "TRIAL";
  const unlimited = !isTrial && data?.max_clients == null;
  const usage = Number(data?.client_usage || 0);
  const max = data?.max_clients == null ? null : Number(data.max_clients);
  const available = data?.available_clients == null ? null : Number(data.available_clients);
  const percent = useMemo(() => max && max > 0 ? Math.min(100, Math.max(0, Math.round((usage / max) * 100))) : 0, [usage, max]);

  if (loading) return <div className="license-settings loading"><RefreshCw className="spin"/><span>Consultando licencia Z-Hub…</span></div>;
  if (error) return <div className="license-settings"><div className="license-error"><AlertTriangle/><div><b>No se pudo cargar la licencia</b><span>{error}</span></div><button type="button" onClick={load}>Reintentar</button></div></div>;

  return <div className="license-settings">
    <header className="license-head">
      <div className="license-brand"><span className="license-logo"><ShieldCheck/></span><div><h2>Licencia Z-Hub</h2><p>Estado y capacidad autorizada para esta instalación.</p></div></div>
      <button type="button" className="license-refresh" onClick={load}><RefreshCw/>Actualizar</button>
    </header>

    <section className="license-hero">
      <div>
        <span className={`license-status ${status.tone}`}><StatusIcon/>{status.label}</span>
        <h3>{isTrial ? "Z-Hub Trial" : `Z-Hub ${planLabel(data?.plan, max)}`}</h3>
        <p>{isTrial ? "Acceso completo durante el período de prueba." : "Licencia pagada sin fecha de vencimiento."}</p>
      </div>
      <div className="license-key"><span>Licencia</span><b>{data?.license_key_masked || "No disponible"}</b></div>
    </section>

    {isTrial ? <section className="license-trial-card">
      <div className="trial-icon"><Clock3/></div>
      <div><span>Tiempo de prueba restante</span><strong>{Number(data?.trial_days_remaining ?? 0)} días</strong><p>El Trial tiene todas las funciones de Z-Hub y no está limitado por cantidad de abonados.</p></div>
    </section> : <>
      <section className="license-metrics">
        <article><span><Users/>Abonados usados</span><strong>{usage}</strong></article>
        <article><span>{unlimited ? <InfinityIcon/> : <ShieldCheck/>}Capacidad</span><strong>{unlimited ? "Ilimitada" : max}</strong></article>
        <article><span><CheckCircle2/>Disponibles</span><strong>{unlimited ? "Sin límite" : available}</strong></article>
      </section>
      {!unlimited && <section className="license-capacity">
        <div className="capacity-row"><b>Uso de licencia</b><span>{usage} / {max} abonados · {percent}%</span></div>
        <div className="capacity-track" aria-label={`Uso de licencia ${percent}%`}><span style={{width:`${percent}%`}} /></div>
        <p>{available > 0 ? `Puedes registrar ${available} abonado${available === 1 ? "" : "s"} adicional${available === 1 ? "" : "es"}.` : "Has alcanzado la capacidad contratada. Los abonados actuales siguen administrándose normalmente."}</p>
      </section>}
    </>}

    <section className="license-details">
      <div><span>Tipo</span><b>{isTrial ? "Prueba de 30 días" : "Licencia pagada"}</b></div>
      <div><span>Plan</span><b>{planLabel(data?.plan, max)}</b></div>
      {data?.owner && <div><span>Titular</span><b>{data.owner}</b></div>}
      {data?.email && <div><span>Correo</span><b>{data.email}</b></div>}
    </section>

    <footer className="license-note">La licencia controla capacidad comercial. Los permisos de Administrador, Técnico y otros roles continúan siendo independientes.</footer>
  </div>;
}
