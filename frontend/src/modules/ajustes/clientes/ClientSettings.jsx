import React from "react";
import { Users, UserPlus, PauseCircle, UserMinus, Bell, SlidersHorizontal } from "lucide-react";

/**
 * Archivo: frontend/src/modules/ajustes/clientes/ClientSettings.jsx
 * Función: área dedicada para concentrar las opciones que controlan el módulo Clientes.
 * Alcance 1.2.28: estructura y navegación; todavía no cambia reglas operativas de clientes.
 */
export default function ClientSettings() {
  const groups = [
    { icon: UserPlus, title: "Registro y altas", text: "Opciones relacionadas con el alta, tecnología, planes y datos iniciales del abonado." },
    { icon: PauseCircle, title: "Pausas de servicio", text: "Preferencias relacionadas con pausas temporales, reactivación y avisos previos." },
    { icon: UserMinus, title: "Retiros y reactivaciones", text: "Opciones del flujo de clientes retirados y su posterior retorno al servicio." },
    { icon: Bell, title: "Avisos del cliente", text: "Configuraciones futuras para alertas y acciones relacionadas con el panel de clientes." },
  ];

  return (
    <div className="settings-page space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-100">
          <Users className="h-6 w-6 text-cyan-400" /> Configuración clientes
        </h2>
        <p className="mt-1 text-xs text-slate-400">Área central para las opciones relacionadas con el comportamiento del panel de Clientes.</p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-100">Configuración del módulo Clientes</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Este submenú queda preparado para reunir aquí las preferencias que vayamos agregando al panel de clientes, evitando mezclar esas opciones con la configuración general del sistema.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
              <div className="flex items-center gap-2 font-bold text-slate-200"><Icon className="h-4 w-4 text-cyan-400" />{title}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          Esta versión crea la estructura del submenú. No modifica datos, facturación, MikroTik, pausas, retiros ni reglas actuales de los clientes.
        </div>
      </section>
    </div>
  );
}
