import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Clock3, Infinity as InfinityIcon, MessageCircle, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./license-settings.css";
import "./license-settings-compact.css";

const STATUS = {
  active: { label:"Licencia activa", tone:"ok", icon:CheckCircle2 },
  trial_expired: { label:"Trial finalizado", tone:"warn", icon:AlertTriangle },
  invalid: { label:"Licencia no válida", tone:"danger", icon:AlertTriangle },
  missing: { label:"Sin licencia", tone:"danger", icon:AlertTriangle },
};

const planLabel = (plan, maxClients) => {
  if (plan === "TRIAL") return "Trial";
  if (["UNLIMITED", "ILIMITADO"].includes(String(plan || "").toUpperCase()) || maxClients == null) return "Ilimitado";
  const match = String(plan || "").match(/(\d+)/);
  return match ? `Plan ${match[1]}` : (plan || "Licencia pagada");
};

const dateLabel = (value) => {
  if (!value) return "Sin vencimiento";
  try { return new Date(value).toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric" }); }
  catch (_) { return "—"; }
};

export default function LicenseSettings() {
  const { API, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const headers = token ? { Authorization:`Bearer ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await axios.get(`${API}/license/info`, { headers });
      setData(response.data || {});
      window.dispatchEvent(new CustomEvent("zhub-license-updated"));
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo consultar la licencia de esta instalación.");
    } finally { setLoading(false); }
  }, [API, token]);

  useEffect(() => { load(); }, [load]);

  const status = STATUS[data?.status] || STATUS.invalid;
  const StatusIcon = status.icon;
  const isTrial = String(data?.type || "").toUpperCase() === "TRIAL";
  const unlimited = !isTrial && data?.max_clients == null;
  const usage = Number(data?.client_usage || 0);
  const max = data?.max_clients == null ? null : Number(data.max_clients);
  const available = data?.available_clients == null ? null : Number(data.available_clients);
  const remainingDays = Number(data?.trial_days_remaining ?? 0);
  const percent = useMemo(() => max && max > 0 ? Math.min(100, Math.max(0, Math.round((usage / max) * 100))) : 0, [usage, max]);
  const requiresCommercialHelp = ["invalid", "missing", "trial_expired"].includes(String(data?.status || "").toLowerCase()) || Boolean(data?.read_only);
  const whatsappDigits = String(data?.sales_whatsapp || "").replace(/\D/g, "");
  const requestLabel = isTrial ? "Solicitar licencia" : "Cambiar plan";
  const supportName = data?.sales_business_name || data?.sales_contact_name || "Soporte Z-Hub";
  const whatsappMessage = [
    `Hola, deseo ${isTrial ? "pasar mi Z-Hub Trial a una licencia pagada" : "cambiar o revisar mi plan Z-Hub"}.`,
    `Instalación: ${data?.installation_id || "no disponible"}`,
    `Plan actual: ${planLabel(data?.plan, max)}`,
    `Uso: ${usage}${max == null ? "" : ` / ${max}`} abonados activos`,
    `Estado: ${isTrial && data?.status === "active" ? "Trial activo" : status.label}`,
  ].join("\n");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappMessage)}` : "";
  const expiry = isTrial ? data?.trial_expires_at : null;

  if (loading) return <div className="license-settings loading"><RefreshCw className="spin"/><span>Consultando licencia Z-Hub…</span></div>;
  if (error) return <div className="license-settings"><div className="license-error"><AlertTriangle/><div><b>No se pudo cargar la licencia</b><span>{error}</span></div><button type="button" onClick={load}>Reintentar</button></div></div>;

  const statusLabel = isTrial && data?.status === "active" ? "Trial activo" : status.label;

  return <div className="license-settings">
    <header className="license-head">
      <div className="license-brand"><span className="license-logo"><ShieldCheck/></span><div><h2>Licencia Z-Hub</h2><p>Estado, capacidad y contacto comercial.</p></div></div>
      <button type="button" className="license-refresh" onClick={load}><RefreshCw/>Actualizar estado</button>
    </header>

    {requiresCommercialHelp && <section className="license-recovery-lock">
      <div className="recovery-lock-icon"><AlertTriangle/></div>
      <div><b>{data?.status === "trial_expired" ? "Tu período de prueba finalizó" : "Esta instalación necesita una licencia activa"}</b><p>Tus datos permanecen intactos. Solicita soporte y, cuando el cambio se realice en Web-Licence, pulsa “Actualizar estado”.</p></div>
    </section>}

    <section className="license-hero"><div>
      <span className={`license-status ${status.tone}`}><StatusIcon/>{statusLabel}</span>
      <h3>{isTrial ? "Z-Hub Trial" : `Z-Hub ${planLabel(data?.plan, max)}`}</h3>
      <p>{isTrial ? "Prueba de 30 días con capacidad máxima de 20 abonados activos." : "Licencia sin vencimiento administrada por capacidad de abonados activos."}</p>
    </div></section>

    <section className="license-metrics">
      <article><span><ShieldCheck/>Plan</span><strong>{planLabel(data?.plan, max)}</strong></article>
      <article><span><Clock3/>{isTrial ? "Vencimiento" : "Vigencia"}</span><strong>{isTrial ? dateLabel(expiry) : "Sin vencimiento"}</strong></article>
      <article><span>{unlimited ? <InfinityIcon/> : <Users/>}Capacidad</span><strong>{unlimited ? "Ilimitada" : (max ?? "—")}</strong></article>
    </section>

    {isTrial && <section className={`license-trial-card ${data?.status === "trial_expired" ? "expired" : ""}`}><div className="trial-icon"><Clock3/></div><div><span>Días restantes del Trial</span><strong>{remainingDays} días</strong><p>El mismo hardware no recibe un segundo período de prueba al reinstalar Z-Hub.</p></div></section>}

    {!unlimited && max != null && <section className="license-capacity">
      <div className="capacity-row"><b>Uso de capacidad</b><span>{usage} / {max} abonados activos · {percent}%</span></div>
      <div className="capacity-track" aria-label={`Uso de licencia ${percent}%`}><span style={{width:`${percent}%`}} /></div>
      <p>{available > 0 ? `${available} cupo${available === 1 ? " disponible" : "s disponibles"}.` : "Capacidad alcanzada: no se pueden registrar o reactivar más abonados hasta liberar un cupo o cambiar de plan."}</p>
    </section>}

    <section className="license-details">
      <div><span>Estado</span><b>{statusLabel}</b></div>
      <div><span>Uso autorizado</span><b>{unlimited ? `${usage} / Ilimitado` : `${usage} / ${max ?? "—"}`}</b></div>
      <div><span>Installation ID</span><b className="license-installation-id">{data?.installation_id || "—"}</b></div>
    </section>

    <section className="license-commercial">
      <div className="commercial-title"><MessageCircle/><div><b>{requestLabel}</b><span>Contacto sincronizado desde Web-Licence.</span></div></div>
      <div className="commercial-actions"><button type="button" className="whatsapp" disabled={!whatsappUrl} onClick={() => whatsappUrl && window.open(whatsappUrl, "_blank", "noopener,noreferrer")}><MessageCircle/>{requestLabel} por WhatsApp</button></div>
      {(data?.sales_business_name || data?.sales_contact_name || data?.sales_email) && <div className="commercial-contact-meta"><span><b>{supportName}</b></span>{data?.sales_contact_name && data?.sales_business_name && <span>Contacto: {data.sales_contact_name}</span>}{data?.sales_email && <span>{data.sales_email}</span>}</div>}
      {!whatsappUrl && <p className="commercial-hint">WhatsApp aún no está configurado en Web-Licence. El administrador central debe completar el módulo Contacto.</p>}
    </section>

    <footer className="license-note">Al alcanzar el límite solo se bloquean nuevas altas o reactivaciones; el resto del panel continúa funcionando normalmente.</footer>
  </div>;
}
