import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserPlus, PauseCircle, UserMinus, SlidersHorizontal, ShieldAlert, Save, PackageCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import "./client-settings-theme.css";

/**
 * Archivo: frontend/src/modules/ajustes/clientes/ClientSettings.jsx
 * Función: preferencias exclusivas del módulo Clientes.
 */
export default function ClientSettings() {
  const { API, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [months, setMonths] = useState(3);
  const [activeGroup, setActiveGroup] = useState("registration");
  const [registration, setRegistration] = useState({
    billingDay: 5,
    technology: "fiber",
    installationDateRequired: true,
    createFirstInvoice: true,
  });

  useEffect(() => {
    axios.get(`${API}/settings`, { headers })
      .then((response) => {
        setEnabled(response.data.long_suspension_alert_enabled !== false);
        const value = Number(response.data.long_suspension_alert_months || 3);
        setMonths(Math.min(6, Math.max(1, value)));
        setRegistration({
          billingDay: Math.min(30, Math.max(1, Number(response.data.client_registration_default_billing_day || 5))),
          technology: response.data.client_registration_default_technology === "wireless" ? "wireless" : "fiber",
          installationDateRequired: response.data.client_registration_installation_date_required !== false,
          createFirstInvoice: response.data.client_registration_create_first_invoice_default !== false,
        });
      })
      .catch(() => toast.error("No se pudo cargar la configuración de clientes"))
      .finally(() => setLoading(false));
  }, [API, token]);

  const saveSuspensionPolicy = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, {
        long_suspension_alert_enabled: enabled,
        long_suspension_alert_months: Number(months),
      }, { headers });
      toast.success("Política de suspensión prolongada guardada");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const saveRegistrationPolicy = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, {
        client_registration_default_billing_day: Number(registration.billingDay),
        client_registration_default_technology: registration.technology,
        client_registration_installation_date_required: registration.installationDateRequired,
        client_registration_create_first_invoice_default: registration.createFirstInvoice,
      }, { headers });
      toast.success("Configuración de Registro y altas guardada");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const groups = [
    { id: "registration", icon: UserPlus, title: "Registro y altas", text: "Reglas para altas, tecnología, planes y datos iniciales del abonado." },
    { id: "pauses", icon: PauseCircle, title: "Pausas de servicio", text: "Políticas de pausa temporal, reactivación y avisos previos." },
    { id: "suspensions", icon: UserMinus, title: "Suspensiones, retiros y reactivaciones", text: "Criterios para suspensión prolongada, clientes retirados y retorno al servicio." },
    { id: "recovery", icon: PackageCheck, title: "Recuperación de equipos", text: "Seguimiento de ONU, router, CPE u otros equipos pendientes de recuperar." },
  ];

  const infoPanels = {
    pauses: {
      icon: PauseCircle,
      title: "Pausas de servicio",
      description: "Esta sección reúne las reglas relacionadas con pausa temporal, reactivación anticipada, duración y avisos propios de una pausa voluntaria.",
      note: "La pausa de servicio existente continúa operativa. Las próximas preferencias específicas de pausa se agregarán aquí.",
    },
    recovery: {
      icon: PackageCheck,
      title: "Recuperación de equipos",
      description: "Aquí se organizará el seguimiento de ONU, router, CPE u otros equipos que deban recuperarse de clientes suspendidos o retirados.",
      note: "La recuperación seguirá siendo una decisión manual. Esta sección queda preparada para registrar estados como pendiente, contactado, visita programada y recuperado.",
    },
  };

  const renderInfoPanel = () => {
    const panel = infoPanels[activeGroup];
    if (!panel) return null;
    const Icon = panel.icon;
    return (
      <section className="client-settings-detail rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="client-settings-detail-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Icon className="h-4 w-4" /></span>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{panel.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{panel.description}</p>
          </div>
        </div>
        <div className="client-settings-detail-note mt-3 rounded-xl border border-slate-800 bg-slate-950/45 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">{panel.note}</div>
      </section>
    );
  };

  const renderRegistrationPanel = () => (
    <section className="client-settings-detail rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
        <span className="client-settings-detail-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><UserPlus className="h-4 w-4" /></span>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Registro y altas</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Valores predeterminados y validaciones que se aplicarán al registrar nuevos abonados.</p>
        </div>
      </div>

      {loading ? <div className="py-5 text-sm text-slate-500">Cargando configuración…</div> : <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="client-settings-toggle rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3">
          <span className="mb-1 block text-[11px] font-semibold text-slate-300">Día de facturación sugerido</span>
          <select value={registration.billingDay} onChange={(e) => setRegistration({ ...registration, billingDay: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100">
            {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>Día {day} de cada mes</option>)}
          </select>
          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">Se propondrá automáticamente en el formulario de un abonado nuevo.</p>
        </label>

        <label className="client-settings-toggle rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3">
          <span className="mb-1 block text-[11px] font-semibold text-slate-300">Tecnología predeterminada</span>
          <select value={registration.technology} onChange={(e) => setRegistration({ ...registration, technology: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100">
            <option value="fiber">Fibra óptica</option>
            <option value="wireless">Inalámbrico</option>
          </select>
          <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">Solo define el valor inicial; el operador puede cambiarlo durante el alta.</p>
        </label>

        <label className="client-settings-toggle flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3">
          <div>
            <div className="text-[13px] font-bold text-slate-200">Fecha de instalación obligatoria</div>
            <div className="mt-1 text-[11px] text-slate-500">Si está activa, no se podrá finalizar un alta sin fecha de instalación.</div>
          </div>
          <input type="checkbox" checked={registration.installationDateRequired} onChange={(e) => setRegistration({ ...registration, installationDateRequired: e.target.checked })} className="h-5 w-5 accent-cyan-500" />
        </label>

        <label className="client-settings-toggle flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3">
          <div>
            <div className="text-[13px] font-bold text-slate-200">Primera factura activada por defecto</div>
            <div className="mt-1 text-[11px] text-slate-500">El alta abrirá marcada o desmarcada la opción “Crear primera factura”.</div>
          </div>
          <input type="checkbox" checked={registration.createFirstInvoice} onChange={(e) => setRegistration({ ...registration, createFirstInvoice: e.target.checked })} className="h-5 w-5 accent-cyan-500" />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button type="button" disabled={saving} onClick={saveRegistrationPolicy} className="flex min-w-56 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-400 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Guardando…" : "Guardar Registro y altas"}
          </button>
        </div>
      </div>}
    </section>
  );

  return (
    <div className="settings-page client-settings-page space-y-4 animate-in fade-in duration-200">
      <div className="client-settings-heading">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-100"><Users className="h-6 w-6 text-cyan-400" /> Configuración clientes</h2>
        <p className="mt-1 text-xs text-slate-400">Preferencias que controlan alertas y comportamiento del módulo Clientes.</p>
      </div>

      <section className="client-settings-shell rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="client-settings-shell-header flex items-start gap-3 border-b border-slate-800 pb-3">
          <span className="client-settings-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><SlidersHorizontal className="h-4 w-4" /></span>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Configuración del módulo Clientes</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Selecciona una sección para ver o administrar sus opciones.</p>
          </div>
        </div>

        <div className="client-settings-groups mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {groups.map(({ id, icon: Icon, title, text }) => {
            const active = activeGroup === id;
            return (
              <button key={id} type="button" onClick={() => setActiveGroup(id)} aria-pressed={active} className={`client-settings-group client-settings-group-button rounded-xl border px-3.5 py-3 text-left transition ${active ? "client-settings-group-active border-cyan-500/60 bg-cyan-500/10" : "border-slate-800 bg-slate-950/45 hover:border-cyan-500/40 hover:bg-slate-900"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-200"><Icon className="h-4 w-4 shrink-0 text-cyan-400" />{title}</div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${active ? "rotate-90 text-cyan-400" : "text-slate-500"}`} />
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{text}</p>
              </button>
            );
          })}
        </div>
      </section>

      {activeGroup === "registration" ? renderRegistrationPanel() : activeGroup === "suspensions" ? (
        <section className="client-settings-policy rounded-2xl border border-amber-500/20 bg-slate-900/90 p-4 shadow-xl">
          <div className="client-settings-policy-header flex items-start gap-3 border-b border-slate-800 pb-3">
            <span className="client-settings-policy-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"><ShieldAlert className="h-4 w-4" /></span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Alerta por suspensión prolongada</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Avisa cuando un cliente permanece suspendido demasiado tiempo para evaluar recuperación de ONU, router u otros equipos.</p>
            </div>
          </div>

          {loading ? <div className="py-5 text-sm text-slate-500">Cargando configuración…</div> : <div className="mt-3 space-y-3">
            <label className="client-settings-toggle flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/45 px-3.5 py-3">
              <div><div className="text-[13px] font-bold text-slate-200">Activar alerta</div><div className="mt-1 text-[11px] text-slate-500">Solo genera un aviso visual. No retira ni elimina al cliente automáticamente.</div></div>
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-5 w-5 accent-cyan-500" />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-slate-300">Mostrar alerta después de</span>
                <select value={months} disabled={!enabled} onChange={(e) => setMonths(Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 disabled:opacity-50">
                  {[1,2,3,4,5,6].map((value) => <option key={value} value={value}>{value} {value === 1 ? "mes" : "meses"} suspendido</option>)}
                </select>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">El tiempo se cuenta desde que el cliente entra al estado Suspendido. Los clientes en Pausa temporal no participan.</p>
              </label>
              <button type="button" disabled={saving} onClick={saveSuspensionPolicy} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-400 disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Guardando…" : "Guardar política"}</button>
            </div>
            <div className="client-settings-note rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-amber-200">Cuando se cumpla el plazo, el aviso permanecerá visible y mostrará cuánto tiempo lleva suspendido el cliente. La decisión de retirarlo o recuperar equipos sigue siendo manual.</div>
          </div>}
        </section>
      ) : renderInfoPanel()}
    </div>
  );
}
