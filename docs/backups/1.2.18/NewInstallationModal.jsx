/**
 * Preinscripción de una instalación. Guarda únicamente los datos iniciales de la
 * solicitud; el alta definitiva se completa después desde el módulo oficial
 * de Nuevo abonado, sin modificar sus opciones ni su lógica de aprovisionamiento.
 */
import React, { useState } from "react";
import { CalendarDays, ClipboardList, LocateFixed, MapPin, X } from "lucide-react";
import { toast } from "sonner";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const initialDraft = () => ({
  full_name: "", dni_ruc: "", address: "", phone: "", email: "", reference: "",
  latitude: "", longitude: "", installation_date: today(), technology: "fiber",
});

export default function NewInstallationModal({ onClose, onRegister }) {
  const [draft, setDraft] = useState(initialDraft);
  const [locating, setLocating] = useState(false);
  const change = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Este navegador no permite obtener la ubicación GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDraft((current) => ({
          ...current,
          latitude: Number(coords.latitude).toFixed(6),
          longitude: Number(coords.longitude).toFixed(6),
        }));
        setLocating(false);
        toast.success("Ubicación GPS registrada.");
      },
      (error) => {
        setLocating(false);
        const message = error.code === 1
          ? "Debes permitir el acceso a la ubicación para usar el GPS."
          : "No se pudo obtener la ubicación actual. Puedes ingresar las coordenadas manualmente.";
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const submit = (event) => {
    event.preventDefault();
    onRegister(draft);
  };

  return <div className="installation-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
    <form onSubmit={submit} className="installation-modal w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
      <header className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
        <div><h3 className="flex items-center gap-2 text-lg font-bold text-slate-100"><ClipboardList className="h-5 w-5 text-cyan-400" /> Nueva instalación</h3><p className="mt-1 text-xs text-slate-400">Registra los datos iniciales de la instalación. El alta del abonado se realizará después.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100" title="Cerrar"><X className="h-5 w-5" /></button>
      </header>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Nombre completo / Razón social *"><input required value={draft.full_name} onChange={change("full_name")} placeholder="Ej. Carlos Pérez / Empresa SAC" /></Field>
        <Field label="DNI / RUC *"><input required value={draft.dni_ruc} onChange={change("dni_ruc")} placeholder="DNI o RUC" /></Field>
        <Field label="Dirección principal *" wide><input required value={draft.address} onChange={change("address")} placeholder="Av. / Jr. / Mz. / Lote / distrito" /></Field>
        <Field label="Celular / WhatsApp *"><input required value={draft.phone} onChange={change("phone")} placeholder="987654321" /></Field>
        <Field label="Correo electrónico"><input type="email" value={draft.email} onChange={change("email")} placeholder="cliente@correo.com" /></Field>
        <Field label="Referencia de instalación" wide><input value={draft.reference} onChange={change("reference")} placeholder="Casa de dos pisos, portón negro…" /></Field>
        <Field label="Coordenadas (latitud)"><input type="number" step="any" value={draft.latitude} onChange={change("latitude")} placeholder="-8.0679" /></Field>
        <Field label="Coordenadas (longitud)"><input type="number" step="any" value={draft.longitude} onChange={change("longitude")} placeholder="-78.9859" /></Field>
        <div className="sm:col-span-2">
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60">
            <LocateFixed className={`h-4 w-4 ${locating ? "animate-pulse" : ""}`} /> {locating ? "Obteniendo ubicación…" : "Obtener ubicación GPS"}
          </button>
          <p className="mt-1 text-[10px] text-slate-500">Completa latitud y longitud automáticamente usando la ubicación del dispositivo.</p>
        </div>
        <Field label="Fecha de instalación"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" /><input required type="date" value={draft.installation_date} onChange={change("installation_date")} className="pl-9" /></div></Field>
        <Field label="Tecnología"><select value={draft.technology} onChange={change("technology")}><option value="fiber">Fibra óptica</option><option value="wireless">Radioenlace / inalámbrico</option><option value="hotspot">Hotspot</option></select></Field>
      </div>
      <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-4 sm:flex-row sm:justify-between">
        <span className="flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3.5 w-3.5" /> El registro quedará pendiente hasta dar de alta al cliente.</span>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">Cancelar</button><button type="submit" className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-400">Registrar instalación</button></div>
      </footer>
    </form>
  </div>;
}

function Field({ label, wide = false, children }) {
  return <label className={wide ? "space-y-1 sm:col-span-2" : "space-y-1"}><span className="block text-xs font-semibold text-slate-300">{label}</span>{React.cloneElement(children, { className: `w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 ${children.props.className || ""}` })}</label>;
}
