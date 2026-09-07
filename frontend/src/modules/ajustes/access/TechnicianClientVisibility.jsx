import React from "react";
import { Clock3, ShieldCheck } from "lucide-react";

const WINDOWS = [
  [30, "30 minutos"], [60, "1 hora"], [120, "2 horas"], [240, "4 horas"],
  [480, "8 horas"], [720, "12 horas"],
];

/** Ajuste aislado: período durante el que un técnico puede consultar su alta. */
export default function TechnicianClientVisibility({ minutes = 720, onChange }) {
  const value = WINDOWS.some(([value]) => value === Number(minutes)) ? Number(minutes) : 720;
  return <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xl">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300"><ShieldCheck className="h-5 w-5" /></span>
      <div><h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Restricción de clientes para técnicos</h3>
        <p className="mt-1 text-xs text-slate-400">Un técnico solo verá los clientes creados por él durante el tiempo seleccionado. El administrador conserva acceso total.</p>
      </div>
    </div>
    <label className="mt-4 block max-w-sm text-xs font-semibold text-slate-300">
      <span className="mb-1 flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-amber-300" /> Tiempo de acceso</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-100">
        {WINDOWS.map(([minutes, label]) => <option key={minutes} value={minutes}>{label}</option>)}
      </select>
    </label>
  </section>;
}
