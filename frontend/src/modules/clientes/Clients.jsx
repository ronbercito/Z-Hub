/**
 * Archivo: frontend/src/modules/clientes/Clients.jsx
 * Actualización: 2026-09-08 — la eliminación se valida con APIs reales y muestra una alerta roja desde su módulo; la tabla muestra deuda y meses pendientes.
 * Función: listado, alta/edición y gestión operativa de abonados; la ubicación permite consultar el mapa sin modificar coordenadas.
 * Trabaja con: backend/app/routers/clientes/router.py, ClientRegistrationWizard.jsx, ClientDetail.jsx y CoordinatesPicker.jsx.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { TEST_IDS } from "../../constants/testIds";
import { Users, UserPlus, Search, Phone, MapPin, ShieldAlert, CheckCircle2, XCircle, MessageSquare, Edit3, Trash2, ExternalLink, Radio } from "lucide-react";
import { toast } from "sonner";
import ClientRegistrationWizard from "./usuarios/ClientRegistrationWizard";
import ClientDetail from "./ClientDetail";
import CoordinatesPicker from "../red/components/CoordinatesPicker";
import { showDeleteModal } from "../../constants/clientDeleteGuard";

const emptyForm = (planId = "", routerId = "") => ({
  full_name: "", dni_ruc: "", phone: "", email: "", address: "", reference: "",
  latitude: "", longitude: "", ip_address: "", onu_sn: "", connection_type: "PPPoE",
  pppoe_user: "", pppoe_password: "", plan_id: planId, router_id: routerId,
  ipv4_network_id: "", nap_box: "", nap_box_id: "", nap_port: "", optical_power_dbm: "",
  installation_date: "", technology: "fiber", zone_id: "", zone_name: "",
  monitoring_equipment_id: "", monitoring_equipment_name: "", antenna_type: "", management_ip: "",
  status: "active", billing_day: new Date().getDate(), billing_type: "prepaid", invoice_lead_days: 5,
  grace_days: 5, cut_after_months: 1, invoice_notification_channel: "none",
  payment_reminder_channel: "none", reminder_1_days: null, reminder_2_days: null,
  reminder_3_days: null, create_first_invoice: true
});

export default function Clients({ onSelectClient }) {
  const { API, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [ipv4Networks, setIpv4Networks] = useState([]);
  const [napBoxes, setNapBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailClientId, setDetailClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [locationClient, setLocationClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const activePlans = plans.filter((plan) => plan.is_active);
  const mikrotikRouters = routers.filter((router) => router.device_type === "mikrotik");

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resClients, resPlans, resRouters, resNetworks, resNapBoxes] = await Promise.all([
        axios.get(`${API}/clients`, { params: { search, status: statusFilter }, headers }),
        axios.get(`${API}/plans`, { headers }),
        axios.get(`${API}/routers`, { headers }),
        axios.get(`${API}/ipv4-networks`, { headers }),
        axios.get(`${API}/nap-boxes`, { headers })
      ]);
      setClients(resClients.data);
      setPlans(resPlans.data);
      setRouters(resRouters.data);
      setIpv4Networks(resNetworks.data);
      setNapBoxes(resNapBoxes.data);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar la lista de abonados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const handleToggleStatus = async (id, name) => {
    try {
      const res = await axios.post(`${API}/clients/${id}/toggle-status`, {}, { headers: { Authorization: `Bearer ${token}` } });
      (res.data.mikrotik?.ok ? toast.success : toast.warning)(`${name}: ${res.data.message}`);
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Error al cambiar estado del cliente");
    }
  };

  const handleOnuStatus = async (c) => {
    toast.info(`Consultando ONU ${c.onu_sn} en la OLT...`);
    try {
      const res = await axios.get(`${API}/clients/${c.id}/onu-status`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.data.ok) return toast.error(res.data.error);
      if (!res.data.found) return toast.warning(res.data.message);
      const onu = Object.entries(res.data.onu).map(([k, v]) => `${k}: ${v}`).join(" · ");
      const opt = Object.entries(res.data.optical || {}).map(([k, v]) => `${k}: ${v}`).join(" · ");
      toast.success(`${res.data.olt} · PON 0/${res.data.pon} · ONU ${res.data.onu_id}\n${onu}${opt ? `\nÓptica: ${opt}` : ""}`, { duration: 12000 });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo consultar la OLT");
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const isWireless = formData.technology === "wireless";
    const payload = {
      ...formData,
      nap_box_id: isWireless ? "" : formData.nap_box_id,
      nap_box: isWireless ? "" : formData.nap_box,
      nap_port: isWireless || formData.nap_port === "" || formData.nap_port == null ? null : Number(formData.nap_port),
      optical_power_dbm: formData.optical_power_dbm === "" ? null : formData.optical_power_dbm,
      latitude: formData.latitude === "" || formData.latitude == null ? 0 : Number(formData.latitude),
      longitude: formData.longitude === "" || formData.longitude == null ? 0 : Number(formData.longitude)
    };
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = selectedClient
        ? await axios.put(`${API}/clients/${selectedClient.id}`, payload, { headers })
        : await axios.post(`${API}/clients`, payload, { headers });
      toast.success(selectedClient ? "Abonado actualizado correctamente" : "Nuevo abonado registrado y primera factura emitida");
      if (res.data.mikrotik) (res.data.mikrotik.ok ? toast.success : toast.warning)(`MikroTik: ${res.data.mikrotik.message}`);
      setShowAddModal(false);
      setSelectedClient(null);
      fetchData();
    } catch (e) {
      const d = e.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Error al guardar abonado (revisa los campos obligatorios)");
    }
  };

  const handleDeleteClient = async (id, name) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      // Estas son exactamente las rutas que ya alimentan las pestañas Servicios y Facturación.
      const [servicesRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/clients/${id}/services`, { headers }),
        axios.get(`${API}/clients/${id}/invoices`, { headers }),
      ]);
      const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      const pending = invoices.filter((invoice) => ["unpaid", "overdue"].includes(String(invoice.status || "").toLowerCase()));
      const balance = pending.reduce((total, invoice) => total + Math.max(0, Number(invoice.amount || 0) - Number(invoice.paid_amount || 0)), 0);
      const confirmed = await showDeleteModal({
        clientName: name,
        services,
        pendingCount: pending.length,
        pendingTotal: balance,
        priority: true,
      });
      if (!confirmed) return;
      await axios.delete(`${API}/clients/${id}`, { headers, __mikrohubDeleteConfirmed: true });
      toast.success("Cliente eliminado del sistema");
      fetchData();
    } catch (e) {
      console.error("MikroHub: resumen de eliminación", e);
      toast.error("No se pudo verificar servicios y facturas; la eliminación fue cancelada.");
    }
  };

  const openWhatsAppReminder = (client) => {
    const text = `Hola ${client.full_name}, le saludamos de FibraZ Perú. Su servicio de internet de ${client.plan_name} presenta un saldo pendiente de S/. ${Number(client.balance_due || 0).toFixed(2)}. Puede realizar su pago por Yape/Plin al 987654321 o BCP. ¡Gracias!`;
    const cleanPhone = (client.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/51${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const startNew = () => {
    setSelectedClient(null);
    setFormData(emptyForm(activePlans[0]?.id || "", mikrotikRouters[0]?.id || ""));
    setShowAddModal(true);
  };

  const startEdit = (c) => {
    setSelectedClient(c);
    setFormData({
      ...emptyForm(c.plan_id, c.router_id),
      full_name: c.full_name, dni_ruc: c.dni_ruc, phone: c.phone, email: c.email || "",
      address: c.address, reference: c.reference || "", latitude: c.latitude ?? "", longitude: c.longitude ?? "",
      ip_address: c.ip_address, onu_sn: c.onu_sn || "", connection_type: c.connection_type || "PPPoE",
      pppoe_user: c.pppoe_user || "", pppoe_password: c.pppoe_password || "", ipv4_network_id: c.ipv4_network_id || "",
      nap_box: c.nap_box || "", nap_box_id: c.nap_box_id || "", nap_port: c.nap_port ?? "",
      optical_power_dbm: c.optical_power_dbm ?? "", installation_date: c.installation_date || "",
      technology: c.technology || "fiber", zone_id: c.zone_id || "", zone_name: c.zone_name || "",
      monitoring_equipment_id: c.monitoring_equipment_id || "", monitoring_equipment_name: c.monitoring_equipment_name || "",
      antenna_type: c.antenna_type || "", management_ip: c.management_ip || "", status: c.status,
      billing_day: c.billing_day ?? 5, billing_type: c.billing_type || "prepaid", invoice_lead_days: c.invoice_lead_days ?? 5,
      grace_days: c.grace_days ?? 5, cut_after_months: c.cut_after_months ?? 1,
      invoice_notification_channel: c.invoice_notification_channel || "none", payment_reminder_channel: c.payment_reminder_channel || "none",
      reminder_1_days: c.reminder_1_days ?? null, reminder_2_days: c.reminder_2_days ?? null,
      reminder_3_days: c.reminder_3_days ?? null, create_first_invoice: false
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2"><Users className="w-6 h-6 text-cyan-400" /> Control de Abonados y Clientes</h2>
          <p className="text-xs text-slate-400 mt-0.5">Administración de contratos de fibra óptica, IP asignada, cortes y reactivaciones</p>
        </div>
        <button data-testid={TEST_IDS.BTN_NEW_CLIENT} onClick={startNew} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Nuevo Abonado</button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96"><Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" /><input data-testid={TEST_IDS.CLIENT_SEARCH} type="text" placeholder="Buscar por nombre, DNI/RUC, IP, teléfono o dirección..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500" /></div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "all" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"}`}>Todos ({clients.length})</button>
          <button onClick={() => setStatusFilter("active")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "active" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}>Activos</button>
          <button onClick={() => setStatusFilter("suspended")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === "suspended" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"}`}>Suspendidos</button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800"><tr>
            <th className="py-3 px-4">Abonado / Contacto</th><th className="py-3 px-4">Plan / Tarifa</th><th className="py-3 px-4">IP / Conexión</th><th className="py-3 px-4">Estado / Deuda</th><th className="py-3 px-4 text-center">Acciones</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading ? <tr><td colSpan="5" className="py-8 text-center text-slate-500">Cargando abonados...</td></tr> : clients.length === 0 ? <tr><td colSpan="5" className="py-8 text-center text-slate-500">No se encontraron abonados con los filtros aplicados.</td></tr> : clients.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4"><div className="font-bold text-slate-100 flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${c.is_online ? "bg-emerald-400" : "bg-rose-400"}`}></span>{c.full_name}</div><div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5"><span>DNI: {c.dni_ruc}</span><span>•</span><span className="flex items-center gap-1 text-slate-300"><Phone className="w-3 h-3 text-cyan-400" /> {c.phone}</span></div><div className="text-[10px] mt-0.5"><button type="button" disabled={!c.latitude || !c.longitude} onClick={() => setLocationClient(c)} title={c.latitude && c.longitude ? "Ver ubicación en el mapa" : "El abonado no tiene coordenadas registradas"} className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 font-semibold transition ${c.latitude && c.longitude ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" : "border-slate-700 bg-slate-800/50 text-slate-500 cursor-default"}`}><MapPin className="w-3 h-3 mr-1" />Ubicación</button></div></td>
                <td className="py-3 px-4"><div className="font-semibold text-cyan-300">{c.plan_name}</div><div className="text-[11px] font-bold text-emerald-400">S/. {Number(c.plan_price || 0).toFixed(2)} / mes</div><div className="text-[10px] text-slate-500">Día de cobro: {c.billing_day} de cada mes</div></td>
                <td className="py-3 px-4"><button type="button" onClick={() => window.open(`http://${c.ip_address}`, "_blank")} title="Abrir MikroTik / equipo en una nueva pestaña" className="font-mono text-slate-200 hover:text-cyan-300 cursor-pointer">{c.ip_address}</button><div className="text-[11px] text-slate-400">{c.connection_type}: <span className="font-mono text-cyan-400">{c.pppoe_user || "estática"}</span></div><div className="text-[10px] text-slate-500">Router: {c.router_name}</div></td>
                <td className="py-3 px-4"><div>{c.status === "active" ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30"><CheckCircle2 className="w-3.5 h-3.5" /> ACTIVO</span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/30"><XCircle className="w-3.5 h-3.5" /> CORTADO</span>}</div>{c.balance_due > 0 && <div className="text-[11px] text-rose-400 font-bold mt-1 flex items-center gap-2"><span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold" title={`${c.unpaid_invoices_count || 0} meses pendientes`}>{c.unpaid_invoices_count || 0}</span><span>S/. {Number(c.balance_due).toFixed(2)}</span></div>}</td>
                <td className="py-3 px-4 text-center"><div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => setDetailClientId(c.id)} title="Ver ficha del cliente" className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"><ExternalLink className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleStatus(c.id, c.full_name)} title={c.status === "active" ? "Cortar Servicio MikroTik" : "Reactivar Servicio"} className={`p-1.5 rounded-lg border ${c.status === "active" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}><ShieldAlert className="w-4 h-4" /></button>
                  {c.onu_sn && <button onClick={() => handleOnuStatus(c)} title="Ver ONU en la OLT" className="p-1.5 rounded-lg bg-cyan-600/10 text-cyan-300 border border-cyan-600/30"><Radio className="w-4 h-4" /></button>}
                  <button onClick={() => openWhatsAppReminder(c)} title="Enviar aviso WhatsApp" className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/30"><MessageSquare className="w-4 h-4" /></button>
                  <button onClick={() => startEdit(c)} title="Editar Abonado" className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClient(c.id, c.full_name)} title="Eliminar" className="p-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {locationClient && <CoordinatesPicker title={`Ubicación de ${locationClient.full_name}`} latitude={locationClient.latitude} longitude={locationClient.longitude} address={locationClient.address} reference={locationClient.reference} readOnly onClose={() => setLocationClient(null)} />}
      {detailClientId && <ClientDetail clientId={detailClientId} api={API} token={token} onClose={() => setDetailClientId(null)} onClientUpdated={fetchData} />}
      {showAddModal && <ClientRegistrationWizard selectedClient={selectedClient} formData={formData} setFormData={setFormData} plans={plans} routers={routers} ipv4Networks={ipv4Networks} napBoxes={napBoxes} onClose={() => { setShowAddModal(false); setSelectedClient(null); }} onSubmit={handleSaveClient} api={API} token={token} />}
    </div>
  );
}