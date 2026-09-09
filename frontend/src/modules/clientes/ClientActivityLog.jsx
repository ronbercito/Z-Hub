/**
 * Archivo: frontend/src/modules/clientes/ClientActivityLog.jsx
 * Actualización: 2026-09-08 — versión 1.1.1.
 * Función: muestra el historial operativo del cliente con acción, fecha, cuenta que ejecutó la acción y detalle.
 * Recibe de: ClientDetail.jsx mediante client.activities.
 * Entrega a: pestaña Log de la ficha del cliente.
 */
import React from "react";
import { Activity, Clock3, UserRound } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "medium" });
};

export default function ClientActivityLog({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-10 text-center">
        <Activity className="mx-auto h-8 w-8 text-cyan-400/70" />
        <p className="mt-3 font-semibold text-slate-300">Aún no hay actividad registrada</p>
        <p className="mt-1 text-sm text-slate-500">Las ediciones, cambios y acciones realizadas sobre este cliente aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <section className="client-activity-log rounded-2xl border border-cyan-500/20 bg-slate-950/45 p-4 sm:p-5">
      <div className="client-activity-log-header mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-300"><Activity className="h-5 w-5" /><h3 className="text-base font-bold text-white">Historial de actividad</h3></div>
          <p className="mt-1 text-xs text-slate-500">Registro de las acciones realizadas en la ficha de este cliente.</p>
        </div>
        <span className="client-activity-log-count rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">{activities.length} eventos</span>
      </div>
      <div className="space-y-3">
        {activities.map((item) => (
          <article key={item.id} className="client-activity-log-event rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-cyan-500/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-100">{item.action || "Actividad"}</h4>
                <p className="mt-1 break-words text-sm leading-6 text-slate-400">{item.detail || "Sin detalle adicional."}</p>
              </div>
              <div className="shrink-0 space-y-1 text-left sm:text-right">
                <div className="client-activity-log-operator inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs font-bold text-cyan-300"><UserRound className="h-3.5 w-3.5" />{item.operator_name || "Sistema"}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 sm:justify-end"><Clock3 className="h-3.5 w-3.5" />{formatDate(item.created_at)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
