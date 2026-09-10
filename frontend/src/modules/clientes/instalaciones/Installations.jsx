import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BadgeCheck, CalendarDays, ClipboardList, MapPin, Phone, Plus, Search, UserPlus, Wrench } from "lucide-react";
import NewInstallationModal from "./NewInstallationModal";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

const LEGACY_STORAGE_KEY = "zhub_pending_installations";
const DRAFT_KEY = "zhub_installation_draft";
const value = (item, key) => String(item?.[key] ?? "").toLowerCase();
const technologyLabel = (technology) => technology === "wireless" ? "Inalámbrico" : technology === "hotspot" ? "Hotspot" : "Fibra óptica";

export default function Installations({ onContinueToClient }) {
  const { API, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [pendingInstallations, setPendingInstallations] = useState([]);
  const [activeTab, setActiveTab] = useState("installations");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewInstallation, setShowNewInstallation] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsResponse, installationsResponse] = await Promise.all([
        axios.get(`${API}/clients`, { headers }),
        axios.get(`${API}/installations`, { headers }),
      ]);
      setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data : []);
      setPendingInstallations(Array.isArray(installationsResponse.data) ? installationsResponse.data : []);
    } catch (error) {
      console.error("Z-Hub: no se pudo cargar Instalaciones", error);
      toast.error("No se pudieron cargar las instalaciones.");
      setClients([]);
      setPendingInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [API, token]);

  // Migra una sola vez cualquier registro temporal creado durante la transición 1.2.17.
  useEffect(() => {
    if (loading) return;
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    let legacy = [];
    try { legacy = JSON.parse(raw); } catch (_) { legacy = []; }
    if (!Array.isArray(legacy) || !legacy.length) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }
    const migrate = async () => {
      for (const item of legacy) {
        const { id, status, created_at, ...payload } = item;
        try { await axios.post(`${API}/installations`, payload, { headers }); }
        catch (error) {
          if (error.response?.status !== 409) console.error("Z-Hub: migración de instalación pendiente", error);
        }
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      await fetchData();
    };
    migrate();
  }, [loading, API, token]);

  // Cuando el alta ya existe como cliente, la solicitud sale de Instalaciones y queda visible en Registrados.
  useEffect(() => {
    if (loading || !clients.length || !pendingInstallations.length) return;
    const registeredDocuments = new Set(clients.map((client) => String(client.dni_ruc || "").trim()).filter(Boolean));
    const completed = pendingInstallations.filter((installation) => registeredDocuments.has(String(installation.dni_ruc || "").trim()));
    if (!completed.length) return;
    const closeCompleted = async () => {
      await Promise.all(completed.map((installation) =>
        axios.delete(`${API}/installations/${installation.id}`, { headers }).catch(() => null)
      ));
      setPendingInstallations((current) => current.filter((installation) => !completed.some((done) => done.id === installation.id)));
    };
    closeCompleted();
  }, [clients, pendingInstallations, loading, API, token]);

  const pendingRows = useMemo(() => pendingInstallations.filter((installation) => {
    const date = installation.installation_date || installation.created_at?.slice(0, 10) || "";
    const text = [value(installation, "full_name"), value(installation, "dni_ruc"), value(installation, "address"), value(installation, "phone")].join(" ");
    return (!query || text.includes(query.toLowerCase()))
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  }), [pendingInstallations, query, from, to]);

  const rows = useMemo(() => clients.filter((client) => {
    const date = client.installation_date || client.created_at?.slice(0, 10) || "";
    const text = [value(client, "full_name"), value(client, "name"), value(client, "dni_ruc"), value(client, "address"), value(client, "phone"), value(client, "mobile")].join(" ");
    return (!query || text.includes(query.toLowerCase()))
      && (!from || !date || date >= from)
      && (!to || !date || date <= to);
  }), [clients, query, from, to]);

  const registerInstallation = async (draft) => {
    try {
      const payload = {
        ...draft,
        latitude: draft.latitude === "" ? null : Number(draft.latitude),
        longitude: draft.longitude === "" ? null : Number(draft.longitude),
      };
      const response = await axios.post(`${API}/installations`, payload, { headers });
      setPendingInstallations((current) => [response.data, ...current]);
      setShowNewInstallation(false);
      setActiveTab("installations");
      toast.success("Instalación registrada. Quedó pendiente de alta del cliente.");
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "No se pudo registrar la instalación.");
    }
  };

  const activateClient = (installation) => {
    const { id, status, created_at, created_by_user_id, ...draft } = installation;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    onContinueToClient?.();
  };

  const visibleCount = activeTab === "installations" ? pendingRows.length : rows.length;

  return <div className="installations-page space-y-4 animate-in fade-in duration-200">
    <header className="rounded-2xl border border-slate-800 bg-slate-900/90 px-5 pt-5 shadow-lg">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-100"><ClipboardList className="h-6 w-6 text-cyan-400" /> Instalaciones</h2>
        <p className="mt-1 text-sm font-medium text-slate-400">Registra solicitudes de instalación y da de alta al cliente cuando corresponda.</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("installations")}
          className={`installation-tab -mb-px inline-flex items-center gap-2 rounded-t-xl border px-5 py-3 text-sm font-extrabold transition ${activeTab === "installations" ? "installation-tab-active border-cyan-400 bg-cyan-500 text-white shadow-lg" : "border-transparent bg-slate-800/70 text-slate-300 hover:bg-slate-800"}`}
        >
          <Wrench className="h-4 w-4" /> Instalaciones
          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${activeTab === "installations" ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>{pendingInstallations.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("registered")}
          className={`installation-tab -mb-px inline-flex items-center gap-2 rounded-t-xl border px-5 py-3 text-sm font-extrabold transition ${activeTab === "registered" ? "installation-tab-active border-cyan-400 bg-cyan-500 text-white shadow-lg" : "border-transparent bg-slate-800/70 text-slate-300 hover:bg-slate-800"}`}
        >
          <BadgeCheck className="h-4 w-4" /> Registrados
          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${activeTab === "registered" ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"}`}>{clients.length}</span>
        </button>
      </div>
    </header>

    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente, DNI, teléfono o dirección..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-100" /></div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="bg-transparent font-semibold text-slate-100 outline-none" /></label>
          <span className="text-xs font-bold text-slate-500">a</span>
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-400"><CalendarDays className="h-4 w-4" /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="bg-transparent font-semibold text-slate-100 outline-none" /></label>
          {activeTab === "installations" && <button type="button" onClick={() => setShowNewInstallation(true)} className="installation-new-button ml-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Nueva instalación</button>}
        </div>
        <span className="text-xs font-extrabold text-cyan-400">{activeTab === "installations" ? `${visibleCount} pendiente(s)` : `${visibleCount} registrada(s)`}</span>
      </div>

      {activeTab === "installations" && <>
        <div className="mb-4 flex items-center justify-between">
          <div><h3 className="text-lg font-extrabold text-slate-100">Instalaciones pendientes</h3><p className="mt-0.5 text-xs font-semibold text-slate-500">Solicitudes guardadas que todavía deben convertirse en clientes.</p></div>
          {pendingRows.length > 0 && <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] font-extrabold text-amber-300">{pendingRows.length} PENDIENTE(S)</span>}
        </div>

        {loading ? <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-10 text-center text-sm font-semibold text-slate-500">Cargando instalaciones…</div> : pendingRows.length > 0 ? <div className="grid gap-4 xl:grid-cols-2">
          {pendingRows.map((installation) => <article key={installation.id} className="overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-950/55 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
              <div><p className="text-base font-extrabold text-slate-100">{installation.full_name || "Sin nombre"}</p><p className="mt-1 text-xs font-semibold text-slate-500">DNI/RUC: {installation.dni_ruc || "—"}</p></div>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-300">PENDIENTE DE ALTA</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Info icon={Phone} label="Celular" value={installation.phone || "—"} />
              <Info icon={CalendarDays} label="Fecha instalación" value={installation.installation_date || "Sin registrar"} />
              <Info icon={MapPin} label="Dirección" value={installation.address || "Sin dirección"} wide />
              {installation.reference && <Info icon={MapPin} label="Referencia" value={installation.reference} wide />}
              <Info label="Tecnología" value={technologyLabel(installation.technology)} />
              <Info label="Coordenadas" value={installation.latitude && installation.longitude ? `${installation.latitude}, ${installation.longitude}` : "Sin ubicación"} />
            </div>
            <div className="flex justify-end border-t border-slate-800 bg-slate-950/60 px-4 py-3">
              <button type="button" onClick={() => activateClient(installation)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-cyan-400"><UserPlus className="h-4 w-4" /> Dar de alta cliente</button>
            </div>
          </article>)}
        </div> : <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 px-6 py-12 text-center">
          <Wrench className="mx-auto h-9 w-9 text-cyan-400" />
          <p className="mt-3 text-base font-extrabold text-slate-100">No hay instalaciones pendientes</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Crea una nueva instalación para iniciar el proceso de alta.</p>
        </div>}
      </>}

      {activeTab === "registered" && <>
        <div className="mb-4"><h3 className="text-lg font-extrabold text-slate-100">Clientes registrados</h3><p className="mt-0.5 text-xs font-semibold text-slate-500">Clientes que ya completaron el alta y existen en el módulo de Clientes.</p></div>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-950/70 text-[11px] font-extrabold uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Fecha instalación</th><th className="px-4 py-3">Teléfono</th><th className="px-4 py-3">Tecnología</th><th className="px-4 py-3">Estado</th></tr></thead>
            <tbody className="divide-y divide-slate-800/80 font-semibold text-slate-300">{loading ? <tr><td colSpan="6" className="px-4 py-8 text-center font-semibold text-slate-500">Cargando clientes registrados…</td></tr> : rows.length ? rows.map((client) => <tr key={client.id} className="hover:bg-slate-800/40"><td className="px-4 py-4 font-extrabold text-slate-100">{client.full_name || client.name || "Sin nombre"}</td><td className="px-4 py-4 font-semibold">{client.address || "Sin dirección"}</td><td className="px-4 py-4 font-semibold">{client.installation_date || "Sin registrar"}</td><td className="px-4 py-4 font-semibold">{client.phone || client.mobile || "—"}</td><td className="px-4 py-4 font-semibold">{technologyLabel(client.technology)}</td><td className="px-4 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-extrabold text-emerald-400"><BadgeCheck className="h-3.5 w-3.5" /> REGISTRADO</span></td></tr>) : <tr><td colSpan="6" className="px-4 py-10 text-center font-semibold text-slate-500">No hay clientes registrados para este filtro.</td></tr>}</tbody>
          </table>
        </div>
      </>}
    </section>

    {showNewInstallation && <NewInstallationModal onClose={() => setShowNewInstallation(false)} onRegister={registerInstallation} />}
  </div>;
}

function Info({ icon: Icon, label, value: text, wide = false }) {
  return <div className={`rounded-xl border border-slate-800 bg-slate-900/70 p-3 ${wide ? "sm:col-span-2" : ""}`}>
    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{Icon && <Icon className="h-3.5 w-3.5 text-cyan-400" />}{label}</div>
    <div className="mt-1 break-words text-sm font-bold text-slate-200">{text}</div>
  </div>;
}
