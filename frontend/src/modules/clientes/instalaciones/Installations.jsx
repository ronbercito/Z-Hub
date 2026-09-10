import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, ClipboardList, Plus, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const value = (item, key) => String(item?.[key] ?? "").toLowerCase();

export default function Installations() {
  const { API, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [API, token]);

  const rows = useMemo(() => clients.filter((client) => {
    const date = client.installation_date || client.created_at?.slice(0, 10) || "";
    const text = [value(client, "name"), value(client, "address"), value(client, "phone"), value(client, "mobile")].join(" ");
    return (!query || text.includes(query.toLowerCase()))
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  }), [clients, query, from, to]);

  return <div className="installations-page space-y-5 animate-in fade-in duration-200">
    <header className="flex flex-col items-start gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-100"><ClipboardList className="h-6 w-6 text-cyan-400" /> Instalaciones</h2>
        <p className="mt-0.5 text-xs text-slate-400">Control de altas e instalaciones de clientes.</p>
      </div>
      <button type="button" className="installation-new-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white"><Plus className="h-4 w-4" /> Nueva instalación</button>
    </header>

    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, teléfono o dirección..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-100" /></div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="bg-transparent text-slate-100 outline-none" /></label>
          <span className="text-xs text-slate-500">a</span>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="bg-transparent text-slate-100 outline-none" /></label>
        </div>
        <span className="text-xs font-semibold text-cyan-400">{rows.length} instalación(es)</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="bg-slate-950/70 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Fecha instalación</th><th className="px-4 py-3">Teléfono</th><th className="px-4 py-3">Tecnología</th><th className="px-4 py-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">{loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Cargando instalaciones…</td></tr> : rows.length ? rows.map((client) => <tr key={client.id} className="hover:bg-slate-800/40"><td className="px-4 py-3 font-semibold text-slate-100">{client.name || "Sin nombre"}</td><td className="px-4 py-3">{client.address || "Sin dirección"}</td><td className="px-4 py-3">{client.installation_date || "Sin registrar"}</td><td className="px-4 py-3">{client.phone || client.mobile || "—"}</td><td className="px-4 py-3">{client.technology || "—"}</td><td className="px-4 py-3"><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">REGISTRADO</span></td></tr>) : <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No hay instalaciones para este filtro.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  </div>;
}
