/**
 * Archivo: frontend/src/modules/clientes/ClientDetail.jsx
 * Actualización: 2026-09-08 — sincroniza Resumen y Servicio con el listado general tras guardar.
 * Función: ficha operativa del cliente con pestañas completamente editables: Resumen, Servicio, Facturación, Email y SMS.
 * Recibe de: backend/app/routers/clientes/router.py mediante GET /api/clients/{id}.
 * Entrega a: Clients.jsx y al operador una ficha editable para datos personales, servicio, facturas y comunicaciones.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity, BarChart3, CreditCard, FileText, Mail, MessageSquare,
  Radio, ReceiptText, Ticket, UserRound, Wifi, X, AlertCircle, CheckCircle2, Loader, Save
} from "lucide-react";
import ClientServiceEditor from "./editor/ClientServiceEditor";
import ClientBilling from "./editor/ClientBilling";
import ClientCommunications from "./editor/ClientCommunications";

const tabs = [
  { id: "summary", label: "Resumen", icon: UserRound },
  { id: "service", label: "Servicio", icon: Wifi },
  { id: "billing", label: "Facturación", icon: ReceiptText },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "messages", label: "Email y SMS", icon: Mail },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "stats", label: "Estadísticas", icon: BarChart3 },
  { id: "log", label: "Log", icon: Activity }
];

const money = (value) => `S/. ${Number(value || 0).toFixed(2)}`;
const date = (value) => value || "Sin registrar";
const prettyStatus = (status) => status === "active" ? "Activo" : status === "suspended" ? "Suspendido" : status || "Sin estado";

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
      <p className="font-semibold text-slate-300">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Value({ label, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-200">{children || "Sin registrar"}</p>
    </div>
  );
}

export default function ClientDetail({ clientId, api, token, onClose, onClientUpdated }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado del formulario de resumen
  const [summaryFormData, setSummaryFormData] = useState({
    full_name: "",
    dni_ruc: "",
    phone: "",
    email: "",
    address: "",
    reference: "",
    installation_date: "",
    zone_id: "",
    latitude: "",
    longitude: ""
  });
  const [zones, setZones] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summarySaving, setSummarySaving] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summarySuccess, setSummarySuccess] = useState("");

  // Cargar cliente, zonas y llenar formulario
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setSummaryLoading(true);
      setError("");
      try {
        const [clientRes, zonesRes] = await Promise.all([
          axios.get(`${api}/clients/${clientId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${api}/zones`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (alive) {
          const clientData = clientRes.data;
          setClient(clientData);
          setZones(zonesRes.data || []);
          
          setSummaryFormData({
            full_name: clientData.full_name || "",
            dni_ruc: clientData.dni_ruc || "",
            phone: clientData.phone || "",
            email: clientData.email || "",
            address: clientData.address || "",
            reference: clientData.reference || "",
            installation_date: clientData.installation_date || "",
            zone_id: clientData.zone_id || "",
            latitude: clientData.latitude ? String(clientData.latitude) : "",
            longitude: clientData.longitude ? String(clientData.longitude) : ""
          });
        }
      } catch (err) {
        if (alive) setError(err.response?.data?.detail || "No se pudo cargar la ficha del cliente.");
      } finally {
        if (alive) {
          setLoading(false);
          setSummaryLoading(false);
        }
      }
    };
    load();
    return () => { alive = false; };
  }, [api, clientId, token]);

  const handleSummaryFormChange = (e) => {
    const { name, value } = e.target;
    setSummaryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSummary = async (e) => {
    e.preventDefault();
    setSummarySaving(true);
    setSummaryError("");
    setSummarySuccess("");
    
    try {
      if (!summaryFormData.full_name.trim()) {
        throw new Error("El nombre del cliente es obligatorio.");
      }
      if (!summaryFormData.dni_ruc.trim()) {
        throw new Error("El DNI/RUC es obligatorio.");
      }
      
      if (summaryFormData.latitude || summaryFormData.longitude) {
        const lat = parseFloat(summaryFormData.latitude);
        const lng = parseFloat(summaryFormData.longitude);
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error("Latitud y longitud deben ser números válidos.");
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error("Coordenadas fuera de rango válido.");
        }
      }

      const payload = {
        full_name: summaryFormData.full_name.trim(),
        dni_ruc: summaryFormData.dni_ruc.trim(),
        phone: summaryFormData.phone.trim(),
        email: summaryFormData.email.trim(),
        address: summaryFormData.address.trim(),
        reference: summaryFormData.reference.trim(),
        installation_date: summaryFormData.installation_date || null,
        zone_id: summaryFormData.zone_id || null,
        latitude: summaryFormData.latitude ? parseFloat(summaryFormData.latitude) : null,
        longitude: summaryFormData.longitude ? parseFloat(summaryFormData.longitude) : null
      };

      await axios.patch(`${api}/clients/${clientId}/summary`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSummarySuccess("Datos del cliente actualizados correctamente.");
      setTimeout(() => {
        const reload = async () => {
          try {
            const response = await axios.get(`${api}/clients/${clientId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setClient(response.data);
            onClientUpdated?.();
            setSummaryFormData({
              full_name: response.data.full_name || "",
              dni_ruc: response.data.dni_ruc || "",
              phone: response.data.phone || "",
              email: response.data.email || "",
              address: response.data.address || "",
              reference: response.data.reference || "",
              installation_date: response.data.installation_date || "",
              zone_id: response.data.zone_id || "",
              latitude: response.data.latitude ? String(response.data.latitude) : "",
              longitude: response.data.longitude ? String(response.data.longitude) : ""
            });
          } catch (err) {
            console.error("Error recargando cliente:", err);
          }
        };
        reload();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Error al guardar los cambios.";
      setSummaryError(msg);
    } finally {
      setSummarySaving(false);
    }
  };

  const handleServiceSaveSuccess = () => {
    const reload = async () => {
      try {
        const response = await axios.get(`${api}/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClient(response.data);
        onClientUpdated?.();
      } catch (err) {
        console.error("Error recargando cliente:", err);
      }
    };
    reload();
  };

  const handleBalanceUpdate = () => {
    const reload = async () => {
      try {
        const response = await axios.get(`${api}/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClient(response.data);
      } catch (err) {
        console.error("Error recargando cliente:", err);
      }
    };
    reload();
  };

  const content = () => {
    if (loading) return <div className="py-16 text-center text-slate-400">Cargando información del cliente…</div>;
    if (error) return <div className="py-16 text-center text-rose-400">{error}</div>;
    if (!client) return null;

    if (activeTab === "summary") {
      return (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            {summaryError && (
              <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
                <p className="text-sm text-rose-300">{summaryError}</p>
              </div>
            )}
            
            {summarySuccess && (
              <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                <p className="text-sm text-emerald-300">{summarySuccess}</p>
              </div>
            )}

            <form onSubmit={handleSaveSummary} className="space-y-5">
              {/* Identidad */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Datos de identidad</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    name="full_name"
                    value={summaryFormData.full_name}
                    onChange={handleSummaryFormChange}
                    placeholder="Nombre completo o razón social"
                    required
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="dni_ruc"
                    value={summaryFormData.dni_ruc}
                    onChange={handleSummaryFormChange}
                    placeholder="DNI / RUC"
                    required
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Contacto</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="tel"
                    name="phone"
                    value={summaryFormData.phone}
                    onChange={handleSummaryFormChange}
                    placeholder="Celular / WhatsApp"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={summaryFormData.email}
                    onChange={handleSummaryFormChange}
                    placeholder="Correo electrónico"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Ubicación</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="address"
                    value={summaryFormData.address}
                    onChange={handleSummaryFormChange}
                    placeholder="Dirección de instalación"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="reference"
                    value={summaryFormData.reference}
                    onChange={handleSummaryFormChange}
                    placeholder="Referencia (ej: frente a la tienda, después de la casa roja)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <select
                    name="zone_id"
                    value={summaryFormData.zone_id}
                    onChange={handleSummaryFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Selecciona una zona --</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Coordenadas */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Coordenadas GPS</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    name="latitude"
                    value={summaryFormData.latitude}
                    onChange={handleSummaryFormChange}
                    placeholder="Latitud (-90 a 90)"
                    step="0.000001"
                    min="-90"
                    max="90"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={summaryFormData.longitude}
                    onChange={handleSummaryFormChange}
                    placeholder="Longitud (-180 a 180)"
                    step="0.000001"
                    min="-180"
                    max="180"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fecha de instalación */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Instalación</h3>
                <input
                  type="date"
                  name="installation_date"
                  value={summaryFormData.installation_date}
                  onChange={handleSummaryFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Botón guardar */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={summarySaving}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {summarySaving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" /> Guardando…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Panel de estado de cuenta - solo lectura */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/55 p-5">
            <h3 className="text-base font-bold text-white">Estado de cuenta</h3>
            <div className="mt-4 space-y-3">
              <div className={`rounded-xl px-3 py-2 text-sm font-semibold ${client.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                Servicio {prettyStatus(client.status)}
              </div>
              <Value label="Plan contratado">{client.plan_name}</Value>
              <Value label="Pago mensual">{money(client.plan_price)}</Value>
              <Value label="Deuda actual">{money(client.balance_due)}</Value>
              <Value label="Facturas pendientes">{client.unpaid_invoices_count || 0}</Value>
              <Value label="Día de pago">Día {client.billing_day || "Sin registrar"}</Value>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "service") {
      return (
        <ClientServiceEditor
          clientId={clientId}
          api={api}
          token={token}
          onSave={handleServiceSaveSuccess}
          onCancel={() => {}}
        />
      );
    }

    if (activeTab === "billing") {
      return (
        <ClientBilling
          clientId={clientId}
          onBalanceUpdate={handleBalanceUpdate}
        />
      );
    }

    if (activeTab === "tickets") {
      const tickets = client.tickets || [];
      return tickets.length ? (
        <div className="space-y-3">
          {tickets.map((ticket) => <div key={ticket.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold text-slate-200">{ticket.subject || "Ticket sin asunto"}</p>
              <span className="text-xs text-cyan-300">{ticket.status || "Abierto"}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{ticket.description || ticket.notes || "Sin detalle registrado."}</p>
            <p className="mt-3 text-xs text-slate-500">{date(ticket.created_at)}</p>
          </div>)}
        </div>
      ) : <EmptyState title="Sin tickets registrados" description="Los tickets de soporte de este cliente se mostrarán en esta pestaña." />;
    }

    if (activeTab === "messages") {
      return (
        <ClientCommunications
          clientId={clientId}
          api={api}
          token={token}
          client={client}
        />
      );
    }

    if (activeTab === "documents") {
      return <EmptyState title="Módulo de documentos en revisión" description="La gestión de documentos se habilitará nuevamente después de validar su compatibilidad con el panel." />;
    }

    if (activeTab === "stats") {
      const paid = (client.invoices || []).filter((item) => item.status === "paid").length;
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Value label="Servicios activos">{client.status === "active" ? 1 : 0}</Value>
          <Value label="Facturas registradas">{(client.invoices || []).length}</Value>
          <Value label="Facturas pagadas">{paid}</Value>
          <Value label="Tickets creados">{(client.tickets || []).length}</Value>
          <Value label="Saldo pendiente">{money(client.balance_due)}</Value>
          <Value label="Última conexión">{date(client.last_connection_time)}</Value>
          <Value label="Fecha de instalación">{date(client.installation_date)}</Value>
          <Value label="Tecnología">{client.technology === "wireless" ? "Inalámbrico" : "Fibra óptica"}</Value>
        </div>
      );
    }

    const activities = client.activities || [];
    return activities.length ? (
      <div className="space-y-3">
        {activities.map((item) => <div key={item.id} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="mt-1 rounded-lg bg-cyan-500/10 p-2 text-cyan-300"><Activity className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-200">{item.action}</p>
              <p className="text-xs text-slate-500">{date(item.created_at)}</p>
            </div>
            <p className="mt-1 text-sm text-slate-400">{item.detail || "Sin detalle registrado."}</p>
            <p className="mt-2 text-xs text-cyan-400">Operador: {item.operator_name || "Sistema"}</p>
          </div>
        </div>)}
      </div>
    ) : <EmptyState title="Aún no hay movimientos registrados" description="Las nuevas acciones sobre el cliente quedarán guardadas automáticamente en esta bitácora." />;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Ficha del cliente</p>
            <h2 className="mt-1 text-xl font-bold text-white">{client?.full_name || "Cargando…"}</h2>
            {client && <p className="mt-1 text-sm text-slate-400">{client.dni_ruc} · {client.plan_name || "Sin plan"}</p>}
          </div>
          <button onClick={onClose} aria-label="Cerrar ficha" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
        </header>

        <nav className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/45 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>;
          })}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-5">{content()}</main>
      </div>
    </div>
  );
}
