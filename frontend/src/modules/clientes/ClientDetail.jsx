/**
 * Archivo: frontend/src/modules/clientes/ClientDetail.jsx
 * Actualización: 2026-09-07 — pestaña Resumen completamente editable; desactivados temporalmente los editores de comunicaciones y documentos.
 * Función: ficha operativa del cliente organizada en pestañas; Resumen permite editar datos personales, contacto, dirección, zona, coordenadas y fecha.
 * Recibe de: backend/app/routers/clientes/router.py mediante GET /api/clients/{id}.
 * Entrega a: Clients.jsx y al operador una ficha con capacidad de editar el resumen directamente.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity, BarChart3, CreditCard, FileText, Mail, MessageSquare,
  Radio, ReceiptText, Ticket, UserRound, Wifi, X, AlertCircle, CheckCircle2, Loader, Save
} from "lucide-react";

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

export default function ClientDetail({ clientId, api, token, onClose }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado del formulario de edición
  const [formData, setFormData] = useState({
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
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Cargar cliente, zonas y llenar formulario
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
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
          
          // Llenar formulario con datos del cliente
          setFormData({
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
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [api, clientId, token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveResumen = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setFormSuccess("");
    
    try {
      // Validaciones básicas
      if (!formData.full_name.trim()) {
        throw new Error("El nombre del cliente es obligatorio.");
      }
      if (!formData.dni_ruc.trim()) {
        throw new Error("El DNI/RUC es obligatorio.");
      }
      
      // Validar coordenadas si se ingresan
      if (formData.latitude || formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (isNaN(lat) || isNaN(lng)) {
          throw new Error("Latitud y longitud deben ser números válidos.");
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error("Coordenadas fuera de rango válido.");
        }
      }

      const payload = {
        full_name: formData.full_name.trim(),
        dni_ruc: formData.dni_ruc.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        reference: formData.reference.trim(),
        installation_date: formData.installation_date || null,
        zone_id: formData.zone_id || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      await axios.put(`${api}/clients/${clientId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormSuccess("Datos del cliente actualizados correctamente.");
      
      // Recargar datos después de 1.5 segundos
      setTimeout(() => {
        const reload = async () => {
          try {
            const response = await axios.get(`${api}/clients/${clientId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setClient(response.data);
            setFormData({
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
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const content = () => {
    if (loading) return <div className="py-16 text-center text-slate-400">Cargando información del cliente…</div>;
    if (error) return <div className="py-16 text-center text-rose-400">{error}</div>;
    if (!client) return null;

    if (activeTab === "summary") {
      return (
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="space-y-5 lg:col-span-2">
            {formError && (
              <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
                <p className="text-sm text-rose-300">{formError}</p>
              </div>
            )}
            
            {formSuccess && (
              <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                <p className="text-sm text-emerald-300">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSaveResumen} className="space-y-5">
              {/* Identidad */}
              <div>
                <h3 className="mb-3 text-base font-bold text-white">Datos de identidad</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    placeholder="Nombre completo o razón social"
                    required
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="dni_ruc"
                    value={formData.dni_ruc}
                    onChange={handleFormChange}
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
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Celular / WhatsApp"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
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
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Dirección de instalación"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleFormChange}
                    placeholder="Referencia (ej: frente a la tienda, después de la casa roja)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <select
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleFormChange}
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
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="Latitud (-90 a 90)"
                    step="0.000001"
                    min="-90"
                    max="90"
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
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
                  value={formData.installation_date}
                  onChange={handleFormChange}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Botón guardar */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
                >
                  {saving ? (
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
      const fiber = client.technology !== "wireless";
      return (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div>
              <p className="text-sm font-semibold text-cyan-300">{fiber ? "Fibra óptica" : "Servicio inalámbrico"}</p>
              <p className="mt-1 text-sm text-slate-400">Configuración técnica y aprovisionamiento del cliente.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">{client.connection_type || "Sin conexión"}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Value label="MikroTik">{client.router_name}</Value>
            <Value label="Plan">{client.plan_name}</Value>
            <Value label="Red IPv4">{client.ipv4_network_name || client.ipv4_network_id}</Value>
            <Value label="IP del cliente">{client.ip_address}</Value>
            {client.connection_type === "PPPoE" && <Value label="Usuario PPPoE">{client.pppoe_user}</Value>}
            {client.connection_type === "PPPoE" && <Value label="Clave PPPoE">{client.pppoe_password ? "Configurada" : "Sin registrar"}</Value>}
          </div>
          {fiber ? (
            <>
              <h3 className="pt-2 text-base font-bold text-white">Instalación de fibra</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Value label="Zona">{client.zone_name}</Value>
                <Value label="Caja NAP">{client.nap_box}</Value>
                <Value label="Puerto NAP">{client.nap_port ? `Puerto ${client.nap_port}` : "Sin registrar"}</Value>
                <Value label="Serie ONU">{client.onu_sn}</Value>
                <Value label="Potencia ONU">{client.optical_power_dbm !== null && client.optical_power_dbm !== undefined ? `${client.optical_power_dbm} dBm` : "Sin registrar"}</Value>
              </div>
            </>
          ) : (
            <>
              <h3 className="pt-2 text-base font-bold text-white">Instalación inalámbrica</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Value label="Conectado a">{client.monitoring_equipment_name}</Value>
                <Value label="Tipo de antena">{client.antenna_type}</Value>
                <Value label="IP administración">{client.management_ip}</Value>
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === "billing") {
      const invoices = client.invoices || [];
      return invoices.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Factura</th><th className="px-4 py-3">Periodo</th><th className="px-4 py-3">Emisión</th><th className="px-4 py-3">Vencimiento</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Estado</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((invoice) => <tr key={invoice.id} className="text-slate-300">
                <td className="px-4 py-3 font-mono text-cyan-300">{invoice.invoice_number}</td>
                <td className="px-4 py-3">{invoice.month_period || "—"}</td>
                <td className="px-4 py-3">{date(invoice.issue_date)}</td>
                <td className="px-4 py-3">{date(invoice.due_date)}</td>
                <td className="px-4 py-3">{money(invoice.amount)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${invoice.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{invoice.status === "paid" ? "Pagada" : "Pendiente"}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Sin facturas registradas" description="Las facturas creadas para este cliente aparecerán aquí." />;
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
      return <EmptyState title="Módulo de comunicaciones en revisión" description="El editor de Email y SMS se habilitará nuevamente después de validar su compatibilidad con el panel." />;
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
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${active ? "border-cyan-500 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-300"}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>;
          })}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-5">{content()}</main>
      </div>
    </div>
  );
}
