import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, ClipboardList, MapPin, PackageCheck, Phone, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import "./equipment-recovery.css";

const STATUS_LABELS = {
  pending: "Pendiente",
  contacted: "Contactado",
  visit_scheduled: "Visita programada",
  recovered: "Recuperado",
  not_recovered: "No recuperado",
};
const CLOSED_STATUSES = new Set(["recovered", "not_recovered"]);

const equipmentText = (row) => {
  const items = row?.equipment?.items || [];
  return items.map((item) => [item.type, item.identifier, item.management_ip].filter(Boolean).join(" · ")).join(", ") || "Equipo por verificar en campo";
};

export default function EquipmentRecovery() {
  const { API, token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [loading, setLoading] = useState(true);
  const [recoveries, setRecoveries] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [retired, setRetired] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: "pending", assigned_to: "", scheduled_date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const requestConfig = { headers, withCredentials: true };

  const load = async () => {
    setLoading(true);
    try {
      const [r, s, t] = await Promise.allSettled([
        axios.get(`${API}/equipment-recoveries`, requestConfig),
        axios.get(`${API}/client-alerts/suspensions`, requestConfig),
        axios.get(`${API}/clients/retired/list`, requestConfig),
      ]);
      if (r.status !== "fulfilled") throw r.reason;
      setRecoveries(Array.isArray(r.value.data) ? r.value.data : []);
      if (s.status === "fulfilled") setSuspended(Array.isArray(s.value.data?.alerts) ? s.value.data.alerts : []);
      if (t.status === "fulfilled") setRetired(Array.isArray(t.value.data) ? t.value.data : []);
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo cargar Recuperación de equipos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [API, token]);

  const openClientIds = useMemo(() => new Set(recoveries.filter((r) => ["pending", "contacted", "visit_scheduled"].includes(r.status)).map((r) => r.client_id)), [recoveries]);
  const candidates = useMemo(() => {
    const map = new Map();
    suspended.forEach((c) => map.set(c.id, { ...c, source_status: "suspended", source_label: "Suspensión prolongada" }));
    retired.forEach((c) => { if (!map.has(c.id)) map.set(c.id, { ...c, source_status: "retired", source_label: "Retirado" }); });
    return Array.from(map.values()).filter((c) => !openClientIds.has(c.id));
  }, [suspended, retired, openClientIds]);

  const filtered = recoveries.filter((row) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [row.client_name, row.dni_ruc, row.phone, row.address, row.assigned_to, equipmentText(row)].join(" ").toLowerCase().includes(q);
    return matchesSearch && (status === "all" || row.status === status);
  });

  const createRecovery = async (client) => {
    try {
      const response = await axios.post(`${API}/equipment-recoveries/from-client/${client.id}`, {}, requestConfig);
      toast.success(response.data?.message || "Enviado a recuperación");
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo crear el caso de recuperación");
    }
  };

  const editRecovery = (row) => {
    if (row.closed || CLOSED_STATUSES.has(row.status)) return;
    setEditing(row);
    setForm({ status: row.status || "pending", assigned_to: row.assigned_to || "", scheduled_date: row.scheduled_date || "", notes: row.notes || "" });
  };

  const saveRecovery = async () => {
    if (form.status === "visit_scheduled" && !form.scheduled_date) return toast.error("Indica la fecha de visita.");
    setSaving(true);
    try {
      const response = await axios.patch(`${API}/equipment-recoveries/${editing.id}`, form, requestConfig);
      toast.success(response.data?.message || "Seguimiento actualizado");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo actualizar el caso");
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => ({
    pending: recoveries.filter((r) => r.status === "pending").length,
    contacted: recoveries.filter((r) => r.status === "contacted").length,
    visit: recoveries.filter((r) => r.status === "visit_scheduled").length,
    recovered: recoveries.filter((r) => r.status === "recovered").length,
  }), [recoveries]);

  return <div className="equipment-recovery-page space-y-4 animate-in fade-in duration-200">
    <section className="recovery-hero rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3"><span className="recovery-icon flex h-10 w-10 items-center justify-center rounded-xl"><PackageCheck className="h-5 w-5"/></span><div><h2 className="text-2xl font-black">Recuperación de equipos</h2><p className="mt-1 text-xs">Seguimiento de ONU, CPE u otros equipos instalados en clientes suspendidos o retirados.</p></div></div>
        <button onClick={load} className="recovery-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"><RefreshCw className="h-4 w-4"/> Actualizar</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="recovery-stat rounded-xl border p-3"><b>{counts.pending}</b><span>Pendientes</span></div>
        <div className="recovery-stat rounded-xl border p-3"><b>{counts.contacted}</b><span>Contactados</span></div>
        <div className="recovery-stat rounded-xl border p-3"><b>{counts.visit}</b><span>Visitas</span></div>
        <div className="recovery-stat rounded-xl border p-3"><b>{counts.recovered}</b><span>Recuperados</span></div>
      </div>
    </section>

    {candidates.length > 0 && <section className="recovery-card rounded-2xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500"/><div><h3 className="font-black">Clientes por evaluar</h3><p className="text-xs">Suspendidos que superaron el plazo configurado y retirados que todavía no tienen un caso abierto.</p></div></div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">{candidates.map((client) => <div key={client.id} className="recovery-candidate rounded-xl border p-3 text-xs">
        <div className="flex items-start justify-between gap-3"><div><div className="font-black">{client.full_name}</div><div className="mt-1 opacity-70">{client.source_label} · DNI/RUC {client.dni_ruc || "—"}</div></div><button onClick={() => createRecovery(client)} className="recovery-primary shrink-0 rounded-lg px-3 py-2 font-bold">Enviar a recuperación</button></div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 opacity-80"><span><Phone className="mr-1 inline h-3.5 w-3.5"/>{client.phone || "Sin teléfono"}</span><span><MapPin className="mr-1 inline h-3.5 w-3.5"/>{client.address || "Sin dirección"}</span></div>
      </div>)}</div>
    </section>}

    <section className="recovery-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between"><div><h3 className="font-black">Seguimiento de recuperaciones</h3><p className="text-xs opacity-70">Pendiente → Contactado → Visita programada → Recuperado / No recuperado.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 opacity-50"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar cliente, equipo..." className="recovery-input rounded-xl border py-2 pl-9 pr-3 text-xs"/></label><select value={status} onChange={(e)=>setStatus(e.target.value)} className="recovery-input rounded-xl border px-3 py-2 text-xs"><option value="all">Todos los estados</option>{Object.entries(STATUS_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead><tr><th>Cliente</th><th>Contacto / dirección</th><th>Equipo</th><th>Origen</th><th>Estado</th><th>Responsable / visita</th><th>Acción</th></tr></thead><tbody>{loading?<tr><td colSpan="7" className="p-8 text-center">Cargando...</td></tr>:filtered.length?filtered.map((row)=><tr key={row.id}><td><b>{row.client_name}</b><div>DNI/RUC: {row.dni_ruc || "—"}</div></td><td><div><Phone className="mr-1 inline h-3 w-3"/>{row.phone || "—"}</div><div><MapPin className="mr-1 inline h-3 w-3"/>{row.address || "—"}</div></td><td><b>{equipmentText(row)}</b>{row.equipment?.nap_box&&<div>NAP: {row.equipment.nap_box}{row.equipment.nap_port?` · P${row.equipment.nap_port}`:""}</div>}</td><td>{row.source_status === "retired" ? "Retirado" : "Suspendido"}</td><td><span className={`recovery-status recovery-status-${row.status}`}>{STATUS_LABELS[row.status] || row.status}</span></td><td>{row.assigned_to || "Sin asignar"}<div>{row.scheduled_date ? `Visita: ${row.scheduled_date}` : "Sin visita"}</div></td><td>{row.closed || CLOSED_STATUSES.has(row.status) ? <span className="rounded-lg border px-3 py-2 font-bold opacity-70">Cerrado</span> : <button onClick={()=>editRecovery(row)} className="recovery-secondary rounded-lg border px-3 py-2 font-bold"><ClipboardList className="mr-1 inline h-3.5 w-3.5"/> Gestionar</button>}</td></tr>):<tr><td colSpan="7" className="p-8 text-center opacity-60">No hay casos de recuperación con este filtro.</td></tr>}</tbody></table></div>
    </section>

    <div className="recovery-note rounded-xl border px-4 py-3 text-xs"><PackageCheck className="mr-1 inline h-4 w-4"/>Marcar un equipo como recuperado <b>no modifica automáticamente Almacén</b>. Primero se conserva el control físico del caso; la integración de inventario se hará cuando exista una asociación segura entre el equipo y un registro de stock.</div>

    {editing && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"><div className="recovery-modal w-full max-w-xl rounded-2xl border p-5 shadow-2xl"><div className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-cyan-500"/><h3 className="text-lg font-black">Gestionar recuperación</h3></div><div className="mt-3 rounded-xl border p-3 text-sm"><b>{editing.client_name}</b><div className="mt-1 text-xs opacity-70">{equipmentText(editing)}</div></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Estado<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className="recovery-input mt-1 w-full rounded-xl border p-2.5">{Object.entries(STATUS_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Responsable<input value={form.assigned_to} onChange={(e)=>setForm({...form,assigned_to:e.target.value})} className="recovery-input mt-1 w-full rounded-xl border p-2.5" placeholder="Técnico / responsable"/></label><label className="text-xs font-bold sm:col-span-2">Fecha de visita {form.status === "visit_scheduled" ? "*" : ""}<input type="date" value={form.scheduled_date} onChange={(e)=>setForm({...form,scheduled_date:e.target.value})} className="recovery-input mt-1 w-full rounded-xl border p-2.5"/></label><label className="text-xs font-bold sm:col-span-2">Observaciones<textarea value={form.notes} maxLength={2000} onChange={(e)=>setForm({...form,notes:e.target.value})} className="recovery-input mt-1 min-h-24 w-full rounded-xl border p-2.5" placeholder="Contacto, resultado de visita, estado del equipo..."/></label></div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setEditing(null)} className="recovery-secondary rounded-xl border px-4 py-2 text-xs font-bold">Cancelar</button><button disabled={saving} onClick={saveRecovery} className="recovery-primary rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50">{saving?"Guardando...":"Guardar seguimiento"}</button></div></div></div>}
  </div>;
}
