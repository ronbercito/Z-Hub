import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Clock3, CreditCard, Infinity as InfinityIcon, KeyRound, LockKeyhole, MessageCircle, RefreshCw, Server, ShieldCheck, Users, Wifi, WifiOff } from "lucide-react";
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

const dateLabel = (value, withTime = false) => {
  if (!value) return "—";
  try {
    const options = withTime
      ? { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }
      : { day:"2-digit", month:"2-digit", year:"numeric" };
    return new Date(value).toLocaleString("es-PE", options);
  } catch (_) { return "—"; }
};

const sourceLabel = (source) => ({
  remote: "Servidor remoto",
  cache: "Caché firmado",
  "local-transition": "Compatibilidad local",
  local: "Licencia local",
}[source] || source || "No disponible");

export default function LicenseSettings({ locked = false }) {
  const { API, token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
  const [activating, setActivating] = useState(false);

  const headers = token ? { Authorization:`Bearer ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API}/license/info`, { headers });
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
  const remainingDays = Number(data?.trial_days_remaining ?? 0);
  const isExpired = data?.status === "trial_expired" || Boolean(data?.read_only);
  const requiresReplacement = ["invalid", "missing", "trial_expired"].includes(String(data?.status || "").toLowerCase()) || Boolean(data?.read_only);
  const percent = useMemo(() => max && max > 0 ? Math.min(100, Math.max(0, Math.round((usage / max) * 100))) : 0, [usage, max]);
  const whatsappDigits = String(data?.sales_whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hola, necesito activar o renovar una licencia Z-Hub. ¿Me pueden ayudar con los planes y el pago?")}` : "";
  const paymentUrl = String(data?.payment_url || "").trim();
  const remoteEnabled = Boolean(data?.license_server_enabled);
  const serverOnline = data?.license_server_online;

  const activateLicense = async (event) => {
    event.preventDefault();
    const key = activationKey.trim();
    if (!key) return setActivationMessage("Ingresa una licencia válida.");
    setActivating(true);
    setActivationMessage("");
    try {
      const response = await axios.post(`${API}/license/activate`, { license_key:key }, { headers });
      setActivationKey("");
      setActivationMessage(response.data?.message || "Licencia activada correctamente.");
      setData(response.data?.license || null);
      window.dispatchEvent(new CustomEvent("zhub-license-updated"));
      if (!response.data?.license) await load();
    } catch (err) {
      setActivationMessage(err.response?.data?.detail || "No se pudo activar la licencia. Verifica la clave e inténtalo nuevamente.");
    } finally {
      setActivating(false);
    }
  };

  if (loading) return <div className="license-settings loading"><RefreshCw className="spin"/><span>Consultando licencia Z-Hub…</span></div>;
  if (error) return <div className="license-settings"><div className="license-error"><AlertTriangle/><div><b>No se pudo cargar la licencia</b><span>{error}</span></div><button type="button" onClick={load}>Reintentar</button></div></div>;

  const statusLabel = isTrial && data?.status === "active" ? "Trial activo" : status.label;

  return <div className="license-settings">
    <header className="license-head">
      <div className="license-brand"><span className="license-logo"><ShieldCheck/></span><div><h2>Licencia Z-Hub</h2><p>Estado, capacidad y validación de esta instalación.</p></div></div>
      <button type="button" className="license-refresh" onClick={load}><RefreshCw/>Actualizar</button>
    </header>

    {requiresReplacement && <section className="license-recovery-lock">
      <div className="recovery-lock-icon"><LockKeyhole/></div>
      <div>
        <b>{data?.status === "trial_expired" ? "Licencia requerida para continuar" : "Esta instalación necesita una nueva licencia"}</b>
        <p>{data?.status === "trial_expired" ? "El período de prueba terminó. Ingresa una licencia pagada activa para volver a operar normalmente." : "La licencia actual falta, fue rechazada, suspendida, revocada o eliminada. El panel queda bloqueado en esta ventana hasta activar una licencia válida. Tus datos no se eliminan."}</p>
      </div>
    </section>}

    <section className="license-hero">
      <div>
        <span className={`license-status ${status.tone}`}><StatusIcon/>{statusLabel}</span>
        <h3>{isTrial ? "Z-Hub Trial" : `Z-Hub ${planLabel(data?.plan, max)}`}</h3>
        <p>{isTrial ? "Prueba de 30 días con capacidad máxima de 20 abonados." : "Licencia pagada según la capacidad autorizada."}</p>
      </div>
      <div className="license-key"><span>Licencia</span><b>{data?.license_key_masked || "No disponible"}</b></div>
    </section>

    <section className={`license-server-card ${remoteEnabled ? (serverOnline === false ? "offline" : "online") : "local"}`}>
      <div className="server-status-icon">{remoteEnabled ? (serverOnline === false ? <WifiOff/> : <Wifi/>) : <Server/>}</div>
      <div className="server-status-copy">
        <span>License Server</span>
        <strong>{remoteEnabled ? (serverOnline === false ? "Temporalmente sin conexión" : serverOnline === true ? "Conectado" : "Configurado") : "Modo local"}</strong>
        <p>Fuente de validación: {sourceLabel(data?.validation_source)}{data?.grace_until ? ` · Gracia hasta ${dateLabel(data.grace_until, true)}` : ""}</p>
      </div>
    </section>

    <section className="license-metrics">
      <article><span><Users/>Abonados usados</span><strong>{usage}</strong></article>
      <article><span>{unlimited ? <InfinityIcon/> : <ShieldCheck/>}Capacidad</span><strong>{unlimited ? "Ilimitada" : (max ?? "—")}</strong></article>
      <article><span><CheckCircle2/>Disponibles</span><strong>{unlimited ? "Sin límite" : (available ?? "—")}</strong></article>
    </section>

    {!unlimited && max != null && <section className="license-capacity">
      <div className="capacity-row"><b>Uso de licencia</b><span>{usage} / {max} abonados · {percent}%</span></div>
      <div className="capacity-track" aria-label={`Uso de licencia ${percent}%`}><span style={{width:`${percent}%`}} /></div>
      <p>{available > 0 ? `Puedes registrar ${available} abonado${available === 1 ? "" : "s"} adicional${available === 1 ? "" : "es"}.` : "Has alcanzado la capacidad autorizada. Los abonados actuales siguen administrándose normalmente."}</p>
    </section>}

    {isTrial && <>
      <section className={`license-trial-card ${isExpired ? "expired" : ""}`}>
        <div className="trial-icon"><Clock3/></div>
        <div><span>Tiempo de prueba restante</span><strong>{remainingDays} días</strong><p>El Trial permite hasta 20 abonados durante un máximo de 30 días.</p></div>
      </section>
      <section className={`license-trial-alert level-${data?.trial_warning_level || "normal"}`}>
        <AlertTriangle/>
        <div>
          <b>{isExpired ? "Período de prueba finalizado" : remainingDays <= 7 ? "Tu Trial está próximo a finalizar" : "Trial de 30 días activo"}</b>
          <p>{isExpired ? "Tus datos permanecen intactos. Z-Hub está bloqueado para modificaciones hasta activar una licencia pagada." : remainingDays <= 7 ? `Quedan ${remainingDays} día${remainingDays === 1 ? "" : "s"}. El Trial mantiene una capacidad máxima de 20 abonados hasta su vencimiento.` : "Durante el Trial tienes acceso a las funciones del panel con una capacidad máxima de 20 abonados."}</p>
        </div>
      </section>
    </>}

    <section className="license-details">
      <div><span>Tipo</span><b>{isTrial ? "Prueba de 30 días" : "Licencia pagada"}</b></div>
      <div><span>Plan</span><b>{planLabel(data?.plan, max)}</b></div>
      {isTrial && <div><span>Inicio Trial</span><b>{dateLabel(data?.trial_started_at)}</b></div>}
      {isTrial && <div><span>Fin Trial</span><b>{dateLabel(data?.trial_expires_at)}</b></div>}
      {data?.owner && <div><span>Titular</span><b>{data.owner}</b></div>}
      {data?.email && <div><span>Correo</span><b>{data.email}</b></div>}
      <div><span>Instalación</span><b className="license-installation-id">{data?.installation_id || "—"}</b></div>
      <div><span>Validación</span><b>{sourceLabel(data?.validation_source)}</b></div>
    </section>

    {requiresReplacement && <section className="license-commercial">
      <div className="commercial-title"><CreditCard/><div><b>Comprar o renovar licencia</b><span>Elige pago directo o contacto comercial por WhatsApp.</span></div></div>
      <div className="commercial-actions">
        <button type="button" className="pay" disabled={!paymentUrl} onClick={() => paymentUrl && window.open(paymentUrl, "_blank", "noopener,noreferrer")}><CreditCard/>Pagar licencia</button>
        <button type="button" className="whatsapp" disabled={!whatsappUrl} onClick={() => whatsappUrl && window.open(whatsappUrl, "_blank", "noopener,noreferrer")}><MessageCircle/>Contactar por WhatsApp</button>
      </div>
      {(!paymentUrl || !whatsappUrl) && <p className="commercial-hint">Las opciones comerciales se habilitan al configurar ZHUB_LICENSE_PAYMENT_URL y ZHUB_LICENSE_WHATSAPP en el servidor.</p>}
    </section>}

    {user?.role === "admin" && <form className={`license-activation ${locked || requiresReplacement ? "recovery" : ""}`} onSubmit={activateLicense}>
      <div className="activation-title"><KeyRound/><div><b>{requiresReplacement ? "Activar nueva licencia" : isTrial ? "Activar licencia pagada" : "Cambiar licencia"}</b><span>{requiresReplacement ? "Ingresa una clave pagada válida y activa. Si la clave es incorrecta o está desactivada, esta ventana permanecerá bloqueada." : isTrial ? "Puedes convertir el Trial en una licencia pagada sin perder ningún dato." : "Usa una clave activa para cambiar el plan de esta instalación."}</span></div></div>
      <div className="activation-row"><input value={activationKey} onChange={(event)=>setActivationKey(event.target.value)} placeholder="Ingresa la nueva clave de licencia" autoComplete="off"/><button type="submit" disabled={activating}>{activating ? "Validando…" : "Activar"}</button></div>
      {activationMessage && <p className="activation-message">{activationMessage}</p>}
    </form>}

    <footer className="license-note">La licencia controla capacidad comercial. Los permisos de Administrador, Técnico y otros roles continúan siendo independientes.</footer>
  </div>;
}
