import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, ClipboardList, MapPin, Phone, Plus, Search, UserPlus } from "lucide-react";
import NewInstallationModal from "./NewInstallationModal";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

const STORAGE_KEY = "zhub_pending_installations";
const DRAFT_KEY = "zhub_installation_draft";
const value = (item, key) => String(item?.[key] ?? "").toLowerCase();
const technologyLabel = (technology) => technology === "wireless" ? "Inalámbrico" : technology === "hotspot" ? "Hotspot" : "Fibra óptica";

const loadPendingInstallations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

const savePendingInstallations = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export default function Installations({ onContinueToClient }) {
  const { API, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [pendingInstallations, setPendingInstallations] = useState(loadPendingInstallations);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewInstallation, setShowNewInstallation] = useState(false);

  useEffect(() => {
    axios.get(`${API}/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [API, token]);

  // Una solicitud deja de ser pendiente únicamente cuando el abonado ya existe realmente.
  useEffect(() => {
    if (loading || !clients.length || !pendingInstallations.length) return;
    const registeredDocuments = new Set(clients.map((client) => String(client.dni_ruc || "").trim()).filter(Boolean));
    const next = pendingInstallations.filter((installation) => !registeredDocuments.has(String(installation.dni_ruc || "").trim()));
    if (next.length !== pendingInstallations.length) {
      setPendingInstallations(next);
      savePendingInstallations(next);
    }
  }, [clients, loading, pendingInstallations]);

  const pendingRows = useMemo(() => pendingInstallations.filter((installation) => {
    const date = installation.installation_date || installation.created_at?.slice(0, 10) || "";
    const text = [value(installation, "full_name"), value(installation, "dni_ruc"), value(installation, "address"), value(installation, "phone")].join(" ");
    return (!query || text.includes(query.toLowerCase()))
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  }), [pendingInstallations, query, from, to]);

  const rows = useMemo(() => clients.filter((client) => {
    const date = client.installation_date || client.created_at?.slice(0, 10) || "";
    const text = [value(client, "full_name"), value(client, "name"), value(client, "address"), value(client, "phone"), value(client, "mobile")].join(" ");
    return (!query || text.includes(query.toLowerCase()))
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  }), [clients, query, from, to]);

  const registerInstallation = (draft) => {
    const installation = {
      ...draft,
      id: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const next = [installation, ...pendingInstallations];
    setPendingInstallations(next);
    savePendingInstallations(next);
    setShowNewInstallation(false);
    toast.success("Instalación registrada. Quedó pendiente de alta del cliente.");
  };

  const activateClient = (installation) => {
    const { id, status, created_at, ...draft } = installation;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    onContinueToClient?.();
  };

  return <div className="installations-page space-y-5 animate-in fade-in duration-200">
    <header className="flex flex-col items-start gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-100"><ClipboardList className="h-6 w-6 text-cyan-400" /> Instalaciones</h2>
        <p className="mt-0.5 text-xs text-slate-400">Registra solicitudes de instalación y da de alta al cliente cuando corresponda.</p>
      </div>
      <button type="button" onClick={() => setShowNewInstallation(true)} className="installation-new-button inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white"><Plus className="h-4 w-4" /> Nueva instalación</button>
    </header>

    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, DNI, teléfono o dirección..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-100" /></div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="bg-transparent text-slate-100 outline-none" /></label>
          <span className="text-xs text-slate-500">a</span>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="bg-transparent text-slate-100 outline-none" /></label>
        </div>
        <span className="text-xs font-semibold text-cyan-400">{pendingRows.length} pendiente(s) · {rows.length} registrada(s)</span>
      </div>

      {pendingRows.length > 0 && <div className="mb-5">
        <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-100">Pendientes de alta</h3><p className="mt-0.5 text-[11px] text-slate-500">Solicitudes registradas que todavía no son abonados.</p></div><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">{pendingRows.length} PENDIENTE(S)</span></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {pendingRows.map((installation) => <article key={installation.id} className="overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-950/55 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div><p className="text-sm font-bold text-slate-100">{installation.full_name || "Sin nombre"}</p><p className="mt-1 text-[11px] text-slate-500">DNI/RUC: {installation.dni_ruc || "—"}</p></div>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">PENDIENTE DE ALTA</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Info icon={Phone} label="Celular" value={installation.phone || "—"} />
              <Info icon={CalendarDays} label="Fecha instalación" value={installation.installation_date || "Sin registrar"} />
              <Info icon={MapPin} label="Dirección" value={installation.address || "Sin dirección"} wide />
              {installation.reference && <Info icon={MapPin} label="Referencia" value={installation.reference} wide />}
              <Info label="Tecnología" value={technologyLabel(installation.technology)} />
              <Info label="Coordenadas" value={installation.latitude && installation.longitude ? `${installation.latitude}, ${installation.longitude}` : "Sin GPS"} />
            </div>
            <div className="flex justify-end border-t border-slate-800 bg-slate-950/60 px-4 py-3">
              <button type="button" onClick={() => activateClient(installation)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-400"><UserPlus className="h-4 w-4" /> Dar de alta cliente</button>
            </div>
          </article>)}
        </div>
      </div>}

      <div className="mb-3"><h3 className="text-sm font-bold text-slate-100">Instalaciones de abonados</h3><p className="mt-0.5 text-[11px] text-slate-500">Clientes que ya existen en el módulo de Abonados.</p></div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="bg-slate-950/70 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Fecha instalación</th><th className="px-4 py-3">Teléfono</th><th className="px-4 py-3">Tecnología</th><th className="px-4 py-3">Estado</th></tr></thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">{loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Cargando instalaciones…</td></tr> : rows.length ? rows.map((client) => <tr key={client.id} className="hover:bg-slate-800/40"><td className="px-4 py-3 font-semibold text-slate-100">{client.full_name || client.name || "Sin nombre"}</td><td className="px-4 py-3">{client.address || "Sin dirección"}</td><td className="px-4 py-3">{client.installation_date || "Sin registrar"}</td><td className="px-4 py-3">{client.phone || client.mobile || "—"}</td><td className="px-4 py-3">{technologyLabel(client.technology)}</td><td className="px-4 py-3"><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">REGISTRADO</span></td></tr>) : <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No hay instalaciones registradas para este filtro.</td></tr>}</tbody>
        </table>
      </div>
    </section>
    {showNewInstallation && <NewInstallationModal onClose={() => setShowNewInstallation(false)} onRegister={registerInstallation} />}
  </div>;
}

function Info({ icon: Icon, label, value: text, wide = false }) {
  return <div className={`rounded-xl border border-slate-800 bg-slate-900/70 p-3 ${wide ? "sm:col-span-2" : ""}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{Icon && <Icon className="h-3.5 w-3.5 text-cyan-400" />}{label}</div>
    <div className="mt-1 break-words text-xs font-medium text-slate-200">{text}</div>
  </div>;
}
