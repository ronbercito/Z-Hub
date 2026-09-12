import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Clock3, Globe2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import "./system-settings.css";

const TIMEZONES = [
  { value: "America/Lima", label: "🇵🇪 Perú — Lima (UTC−05:00)" },
  { value: "America/Bogota", label: "🇨🇴 Colombia — Bogotá (UTC−05:00)" },
  { value: "America/Guayaquil", label: "🇪🇨 Ecuador — Guayaquil (UTC−05:00)" },
  { value: "America/Caracas", label: "🇻🇪 Venezuela — Caracas (UTC−04:00)" },
  { value: "America/Santiago", label: "🇨🇱 Chile — Santiago" },
  { value: "America/Argentina/Buenos_Aires", label: "🇦🇷 Argentina — Buenos Aires (UTC−03:00)" },
  { value: "America/Sao_Paulo", label: "🇧🇷 Brasil — São Paulo" },
  { value: "America/Mexico_City", label: "🇲🇽 México — Ciudad de México" },
  { value: "America/New_York", label: "🇺🇸 Estados Unidos — Nueva York" },
  { value: "America/Chicago", label: "🇺🇸 Estados Unidos — Chicago" },
  { value: "America/Denver", label: "🇺🇸 Estados Unidos — Denver" },
  { value: "America/Los_Angeles", label: "🇺🇸 Estados Unidos — Los Ángeles" },
  { value: "Europe/Madrid", label: "🇪🇸 España — Madrid" },
  { value: "Europe/London", label: "🇬🇧 Reino Unido — Londres" },
  { value: "UTC", label: "🌐 UTC — Tiempo universal coordinado" },
];

function formatCurrentTime(timezone) {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: timezone,
    }).format(new Date());
  } catch (_) {
    return "Zona horaria no disponible";
  }
}

export default function SystemSettings() {
  const { API, token } = useAuth();
  const [timezone, setTimezone] = useState("America/Lima");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTimezone(response.data?.app_timezone || "America/Lima");
      } catch (_) {
        toast.error("No se pudo cargar la configuración del sistema");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API, token]);

  const currentTime = useMemo(() => formatCurrentTime(timezone), [timezone]);
  const selectedLabel = TIMEZONES.find((item) => item.value === timezone)?.label || timezone;

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, { app_timezone: timezone }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.dispatchEvent(new CustomEvent("z-hub-timezone-changed", { detail: { timezone } }));
      toast.success("Zona horaria guardada correctamente");
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo guardar la zona horaria");
    } finally {
      setSaving(false);
    }
  };

  const detectBrowserTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return;
    if (!TIMEZONES.some((item) => item.value === detected)) {
      toast.info(`El navegador detectó ${detected}. Puedes conservarla escribiéndola en la configuración compatible del sistema.`);
      return;
    }
    setTimezone(detected);
    toast.success(`Zona detectada: ${detected}`);
  };

  return (
    <form onSubmit={save} className="system-settings-card max-w-4xl space-y-5 rounded-2xl border p-6 shadow-xl">
      <div className="flex items-center gap-3 border-b system-settings-divider pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Globe2 className="h-5 w-5" /></span>
        <div>
          <h3 className="system-settings-title font-bold">Zona horaria del sistema</h3>
          <p className="system-settings-muted text-xs">Define la zona utilizada para mostrar fechas y horas en Z-Hub.</p>
        </div>
      </div>

      <div className="system-settings-time rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <Clock3 className="system-settings-time-icon mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="system-settings-title text-xs font-semibold">Hora mostrada actualmente</p>
            <p className="system-settings-time-value mt-1 text-sm font-bold">{loading ? "Cargando…" : currentTime}</p>
            <p className="system-settings-muted mt-1 text-[11px]">Configuración actual: {selectedLabel}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="system-settings-title mb-1 block text-xs font-semibold">País / zona horaria</label>
        <select
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          disabled={loading || saving}
          className="system-settings-select w-full rounded-xl border p-3 text-sm outline-none focus:border-cyan-500"
        >
          {TIMEZONES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <p className="system-settings-muted mt-2 text-[11px] leading-relaxed">
          Z-Hub mantiene el servidor y la base de datos en UTC. Esta opción controla la hora que ve el usuario, evitando cambiar el reloj del servidor.
        </p>
      </div>

      <div className="system-settings-divider flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <button type="button" onClick={detectBrowserTimezone} disabled={loading || saving} className="system-settings-detect rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-50">
          Detectar zona del navegador
        </button>
        <button type="submit" disabled={loading || saving} className="system-settings-save flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-50">
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar zona horaria"}
        </button>
      </div>
    </form>
  );
}
