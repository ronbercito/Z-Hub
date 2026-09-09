/**
 * Archivo: frontend/src/modules/appearance/PanelThemeSelector.jsx
 * Función: selector visual de templates mostrado en Ajustes > General.
 * Recibe: value (tema guardado) y onChange (actualiza settings.panel_theme).
 */
import React from "react";
import { CheckCircle2, Moon, Palette, Sun } from "lucide-react";
import { PANEL_THEMES, PANEL_THEME_ZHUB_LIGHT, normalizePanelTheme } from "./panelThemes";

function ThemePreview({ themeId }) {
  const light = themeId === PANEL_THEME_ZHUB_LIGHT;
  return (
    <div className="overflow-hidden rounded-xl border" style={{ backgroundColor: light ? "#ffffff" : "#020617", borderColor: light ? "#bae6fd" : "#334155" }}>
      <div className="flex h-7 items-center gap-1.5 border-b px-2" style={{ backgroundColor: light ? "#ffffff" : "#0f172a", borderColor: light ? "#e0f2fe" : "#1e293b" }}>
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        <span className="h-2 w-8 rounded-full bg-blue-500/80" />
        <span className="ml-auto h-2 w-12 rounded-full" style={{ backgroundColor: light ? "#e2e8f0" : "#334155" }} />
      </div>
      <div className="flex h-20">
        <div className="w-10 border-r" style={{ backgroundColor: light ? "#f8fafc" : "#0f172a", borderColor: light ? "#e0f2fe" : "#1e293b" }} />
        <div className="flex-1 p-2" style={{ backgroundColor: light ? "#f7fbff" : "#020617" }}>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-5 rounded bg-cyan-500" />
            <div className="h-5 rounded bg-blue-500" />
            <div className="h-5 rounded bg-violet-500" />
          </div>
          <div className="mt-2 h-8 rounded border" style={{ backgroundColor: light ? "#ffffff" : "#0f172a", borderColor: light ? "#e0f2fe" : "#1e293b" }} />
        </div>
      </div>
    </div>
  );
}

export default function PanelThemeSelector({ value, onChange }) {
  const selected = normalizePanelTheme(value);
  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400"><Palette className="h-5 w-5" /></div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Apariencia del panel</h3>
          <p className="mt-1 text-xs text-slate-500">Elige el template visual. Cambia colores y superficies; no altera clientes, facturación, MikroTik, OLT ni permisos.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PANEL_THEMES.map((theme) => {
          const active = selected === theme.id;
          const Icon = theme.id === PANEL_THEME_ZHUB_LIGHT ? Sun : Moon;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`rounded-2xl border p-3 text-left transition-all ${active ? "border-cyan-400 ring-2 ring-cyan-400/20" : "border-slate-700 hover:border-cyan-500/50"}`}
            >
              <ThemePreview themeId={theme.id} />
              <div className="mt-3 flex items-start gap-2">
                <Icon className={`mt-0.5 h-4 w-4 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{theme.name}</span>
                    {active && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{theme.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">El cambio se aplica al guardar la configuración general y se conserva para el login y las próximas sesiones.</p>
    </section>
  );
}
