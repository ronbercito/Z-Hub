/**
 * Archivo: frontend/src/modules/clientes/editor/ClientServiceEditor.jsx
 * Función: lista los servicios de Internet del cliente y abre un flujo guiado para crear o editar cada servicio.
 * Recibe de: ClientDetail.jsx y backend/app/routers/clientes/services.py.
 * Entrega a: backend mediante /clients/{clientId}/service para el servicio principal histórico y /clients/{clientId}/services para servicios adicionales.
 */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  Link2,
  Loader,
  Pencil,
  Plus,
  Save,
  Server,
  Settings,
  Trash2,
  Wifi,
  X,
} from "lucide-react";
import "./client-service-wizard.css";

const inputClass = "service-wizard-input";
const labelClass = "service-wizard-label mb-1.5 block";
const emptyForm = {
  plan_id: "",
  router_id: "",
  connection_type: "IP Estática",
  ipv4_network_id: "",
  ip_address: "",
  pppoe_user: "",
  pppoe_password: "",
  technology: "",
  zone_id: "",
  nap_box_id: "",
  nap_port: "",
  onu_sn: "",
  optical_power_dbm: "",
  monitoring_equipment_id: "",
  antenna_type: "",
  management_ip: "",
};

const mapServiceToForm = (s) => ({
  plan_id: s?.plan_id || "",
  router_id: s?.router_id || "",
  connection_type: s?.connection_type || "IP Estática",
  ipv4_network_id: s?.ipv4_network_id || "",
  ip_address: s?.ip_address || "",
  pppoe_user: s?.pppoe_user || "",
  pppoe_password: s?.pppoe_password || "",
  technology: s?.technology || "",
  zone_id: s?.zone_id || "",
  nap_box_id: s?.nap_box_id || "",
  nap_port: s?.nap_port ? String(s.nap_port) : "",
  onu_sn: s?.onu_sn || "",
  optical_power_dbm: s?.optical_power_dbm ?? "",
  monitoring_equipment_id: s?.monitoring_equipment_id || "",
  antenna_type: s?.antenna_type || "",
  management_ip: s?.management_ip || "",
});

const planTechnology = (type = "") => {
  const value = String(type).toLowerCase();
  if (value.includes("hotspot")) return "hotspot";
  if (value.includes("radio") || value.includes("inalam") || value.includes("inalám") || value.includes("ubiquiti") || value.includes("mimosa")) return "wireless";
  return "fiber";
};

const downstreamReset = {
  ipv4_network_id: "",
  ip_address: "",
  pppoe_user: "",
  pppoe_password: "",
  zone_id: "",
  nap_box_id: "",
  nap_port: "",
  onu_sn: "",
  optical_power_dbm: "",
  monitoring_equipment_id: "",
  antenna_type: "",
  management_ip: "",
};

function getOpticalPowerTone(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || value === "") return "normal";
  const dbm = -Math.abs(number);
  if (dbm <= -28) return "critical";
  if (dbm <= -25) return "warning";
  return "good";
}

const opticalPowerBadgeClass = (value) => {
  const tone = getOpticalPowerTone(value);
  if (tone === "critical") return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30";
  if (tone === "warning") return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
  if (tone === "good") return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20";
  return "bg-slate-800 text-slate-300";
};

function Field({ label, children, hint }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="service-wizard-hint mt-1.5 text-[11px]">{hint}</p>}
    </div>
  );
}

function StepCard({ number, icon: Icon, title, subtitle, locked = false, children }) {
  return (
    <section className={`service-wizard-card p-4 sm:p-5 ${locked ? "is-locked" : ""}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="service-wizard-icon"><Icon className="h-5 w-5" /></span>
        <div className="min-w-0">
          <h3 className="service-wizard-card-title text-sm font-extrabold sm:text-base">{number}. {title}</h3>
          <p className="service-wizard-card-subtitle mt-0.5 text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ServiceModal({ clientId, api, token, service, onSaved, onClose }) {
  const editingPrimary = service?.is_primary;
  const [formData, setFormData] = useState(() => service ? mapServiceToForm(service) : { ...emptyForm });
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [ipv4Networks, setIpv4Networks] = useState([]);
  const [zones, setZones] = useState([]);
  const [napBoxes, setNapBoxes] = useState([]);
  const [monitoringEquipment, setMonitoringEquipment] = useState([]);
  const [availableAddresses, setAvailableAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [plansRes, routersRes, networksRes, zonesRes, napRes, equipRes] = await Promise.all([
          axios.get(`${api}/plans`, { headers }),
          axios.get(`${api}/routers`, { headers }),
          axios.get(`${api}/ipv4-networks`, { headers }),
          axios.get(`${api}/zones`, { headers }),
          axios.get(`${api}/nap-boxes`, { headers }),
          axios.get(`${api}/monitoring-equipment`, { headers }),
        ]);
        if (!active) return;
        setPlans(plansRes.data || []);
        setRouters((routersRes.data || []).filter((r) => r.device_type === "mikrotik"));
        setIpv4Networks(networksRes.data || []);
        setZones(zonesRes.data || []);
        setNapBoxes(napRes.data || []);
        setMonitoringEquipment(equipRes.data || []);
      } catch (err) {
        if (active) setError(err.response?.data?.detail || "No se pudieron cargar los datos del servicio.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [api, token]);

  const compatiblePlans = useMemo(
    () => plans.filter((p) => p.is_active !== false && planTechnology(p.type) === formData.technology),
    [plans, formData.technology]
  );
  const connectionUsage = { "PPPoE": "pppoe_pool", "IP Estática": "static", "DHCP": "dhcp" }[formData.connection_type] || "static";
  const compatibleNetworks = useMemo(
    () => ipv4Networks.filter((n) => n.router_id === formData.router_id && n.usage_type === connectionUsage),
    [ipv4Networks, formData.router_id, connectionUsage]
  );
  const selectedNap = napBoxes.find((n) => n.id === formData.nap_box_id);
  const occupiedNapPorts = new Set(Object.keys(selectedNap?.assigned_ports || {}).map(Number));
  const availableNapPorts = Array.from({ length: selectedNap?.ports || 0 }, (_, i) => i + 1)
    .filter((p) => !occupiedNapPorts.has(p) || Number(formData.nap_port) === p);

  const routerReady = Boolean(formData.router_id);
  const technologyReady = routerReady && Boolean(formData.technology);
  const planReady = technologyReady && Boolean(formData.plan_id);
  const connectionReady = planReady && Boolean(formData.connection_type);
  const accessReady = formData.connection_type === "PPPoE"
    ? connectionReady && Boolean(formData.pppoe_user.trim())
    : connectionReady && Boolean(formData.ipv4_network_id) && Boolean(formData.ip_address);
  const zoneReady = accessReady && Boolean(formData.zone_id);
  const technicalReady = formData.technology === "fiber"
    ? zoneReady && Boolean(formData.nap_box_id) && Boolean(formData.nap_port)
    : zoneReady && Boolean(formData.monitoring_equipment_id);
  const canSubmit = routerReady && technologyReady && planReady && connectionReady && accessReady && zoneReady && technicalReady;

  const wizardSteps = [
    { label: "Router", ready: routerReady, active: !routerReady },
    { label: "Tecnología", ready: technologyReady, active: routerReady && !technologyReady },
    { label: "Plan", ready: planReady, active: technologyReady && !planReady },
    { label: "Conexión", ready: connectionReady, active: planReady && !connectionReady },
    { label: "Configuración", ready: canSubmit, active: connectionReady && !canSubmit },
  ];

  useEffect(() => {
    if (!formData.ipv4_network_id || formData.connection_type === "PPPoE") {
      setAvailableAddresses([]);
      return undefined;
    }
    let active = true;
    setLoadingAddresses(true);
    axios.get(`${api}/ipv4-networks/${formData.ipv4_network_id}/available-addresses`, {
      params: { exclude_client_id: clientId },
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => {
      if (active) setAvailableAddresses(r.data.addresses || []);
    }).catch(() => {
      if (active) setAvailableAddresses([]);
    }).finally(() => {
      if (active) setLoadingAddresses(false);
    });
    return () => { active = false; };
  }, [api, clientId, formData.connection_type, formData.ipv4_network_id, token]);

  const handleRouterChange = (e) => {
    const router_id = e.target.value;
    setFormData((p) => ({
      ...p,
      router_id,
      technology: "",
      plan_id: "",
      connection_type: "IP Estática",
      ...downstreamReset,
    }));
  };

  const handleTechnologyChange = (e) => {
    const technology = e.target.value;
    setFormData((p) => ({
      ...p,
      technology,
      plan_id: "",
      connection_type: "IP Estática",
      ...downstreamReset,
    }));
  };

  const handlePlanChange = (e) => {
    const plan_id = e.target.value;
    setFormData((p) => ({
      ...p,
      plan_id,
      connection_type: "IP Estática",
      ...downstreamReset,
    }));
  };

  const handleConnectionChange = (e) => {
    const connection_type = e.target.value;
    setFormData((p) => ({ ...p, connection_type, ...downstreamReset }));
  };

  const handleNetworkChange = (e) => {
    const ipv4_network_id = e.target.value;
    setFormData((p) => ({ ...p, ipv4_network_id, ip_address: "", zone_id: "", nap_box_id: "", nap_port: "", onu_sn: "", optical_power_dbm: "", monitoring_equipment_id: "", antenna_type: "", management_ip: "" }));
  };

  const handleIpChange = (e) => {
    const ip_address = e.target.value;
    setFormData((p) => ({ ...p, ip_address, zone_id: "", nap_box_id: "", nap_port: "", onu_sn: "", optical_power_dbm: "", monitoring_equipment_id: "", antenna_type: "", management_ip: "" }));
  };

  const handlePppoeUserChange = (e) => {
    const pppoe_user = e.target.value;
    setFormData((p) => ({ ...p, pppoe_user, zone_id: "", nap_box_id: "", nap_port: "", onu_sn: "", optical_power_dbm: "", monitoring_equipment_id: "", antenna_type: "", management_ip: "" }));
  };

  const handleZoneChange = (e) => {
    const zone_id = e.target.value;
    setFormData((p) => ({ ...p, zone_id, nap_box_id: "", nap_port: "", onu_sn: "", optical_power_dbm: "", monitoring_equipment_id: "", antenna_type: "", management_ip: "" }));
  };

  const handleOpticalPowerChange = (e) => {
    const { value } = e.target;
    setFormData((p) => ({ ...p, optical_power_dbm: value === "" ? "" : String(-Math.abs(Number(value))) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!formData.router_id) throw new Error("Selecciona un router.");
      if (!formData.technology) throw new Error("Selecciona la tecnología.");
      if (!formData.plan_id) throw new Error("Selecciona un plan.");
      const selectedPlan = plans.find((p) => String(p.id) === String(formData.plan_id));
      if (!selectedPlan || planTechnology(selectedPlan.type) !== formData.technology) throw new Error("El plan seleccionado no corresponde a la tecnología elegida.");
      if (!formData.connection_type) throw new Error("Selecciona el tipo de conexión.");
      if (formData.connection_type === "PPPoE") {
        if (!formData.pppoe_user.trim()) throw new Error("Ingresa usuario PPPoE.");
      } else {
        if (!formData.ipv4_network_id) throw new Error("Selecciona una red IPv4.");
        if (!formData.ip_address) throw new Error("Selecciona una IP disponible.");
      }
      if (!formData.zone_id) throw new Error("Selecciona una zona.");
      if (formData.technology === "fiber") {
        if (!formData.nap_box_id) throw new Error("Selecciona una caja NAP.");
        if (!formData.nap_port) throw new Error("Selecciona un puerto NAP.");
      } else if (!formData.monitoring_equipment_id) {
        throw new Error("Selecciona el equipo al que se conectará el servicio inalámbrico.");
      }

      const payload = {
        plan_id: formData.plan_id,
        router_id: formData.router_id,
        connection_type: formData.connection_type,
        ipv4_network_id: formData.ipv4_network_id || null,
        ip_address: formData.ip_address || null,
        pppoe_user: formData.pppoe_user || null,
        pppoe_password: formData.pppoe_password || null,
        technology: formData.technology,
        zone_id: formData.zone_id || null,
        nap_box_id: formData.technology === "fiber" ? formData.nap_box_id || null : null,
        nap_port: formData.technology === "fiber" && formData.nap_port ? parseInt(formData.nap_port, 10) : null,
        onu_sn: formData.technology === "fiber" ? formData.onu_sn || null : null,
        optical_power_dbm: formData.technology === "fiber" && formData.optical_power_dbm !== "" ? parseFloat(formData.optical_power_dbm) : null,
        monitoring_equipment_id: formData.technology === "wireless" ? formData.monitoring_equipment_id || null : null,
        antenna_type: formData.technology === "wireless" ? formData.antenna_type || null : null,
        management_ip: formData.technology === "wireless" ? formData.management_ip || null : null,
      };

      const headers = { Authorization: `Bearer ${token}` };
      if (editingPrimary) await axios.patch(`${api}/clients/${clientId}/service`, payload, { headers });
      else if (service) await axios.patch(`${api}/clients/${clientId}/services/${service.service_id}`, payload, { headers });
      else await axios.post(`${api}/clients/${clientId}/services`, payload, { headers });

      onSaved?.({ type: editingPrimary || service ? "edit" : "create", service: { ...(service || {}), ...formData } });
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Error al guardar el servicio.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="service-wizard-overlay fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="service-wizard-modal rounded-2xl p-8 text-center">
          <Loader className="mx-auto mb-3 h-6 w-6 animate-spin text-cyan-300" />
          <p className="service-wizard-subtitle text-sm">Cargando servicio…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-wizard-overlay fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose?.(); }}>
      <div className="service-wizard-modal flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <header className="service-wizard-header shrink-0 border-b px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="service-wizard-title text-xl font-black">{editingPrimary ? "Editar servicio principal" : service ? "Editar servicio" : "Nuevo servicio"}</h2>
              <p className="service-wizard-subtitle mt-1 text-xs sm:text-sm">Configura el servicio en orden. Cada opción se habilita cuando completas la anterior.</p>
            </div>
            <button type="button" onClick={onClose} disabled={saving} className="service-wizard-close rounded-lg p-2 transition"><X className="h-5 w-5" /></button>
          </div>
        </header>

        <div className="service-wizard-stepper shrink-0 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-5xl items-center gap-2">
            {wizardSteps.map((step, index) => (
              <React.Fragment key={step.label}>
                <div className={`service-wizard-step flex items-center gap-2 ${step.ready ? "is-ready" : ""} ${step.active ? "is-active" : ""}`}>
                  <span className="service-wizard-step-number">{step.ready ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                  <span className="service-wizard-step-label text-xs font-bold">{step.label}</span>
                </div>
                {index < wizardSteps.length - 1 && <span className={`service-wizard-step-line ${step.ready ? "is-ready" : ""}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {error && <div className="service-wizard-error mb-4 flex gap-3 rounded-xl p-4"><AlertCircle className="h-5 w-5 shrink-0" /><p className="text-sm">{typeof error === "string" ? error : error?.message || "Error al guardar el servicio."}</p></div>}

          <form id="client-service-form" onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[0.95fr_1.35fr]">
            <div className="space-y-4">
              <StepCard number="1" icon={Server} title="Selecciona el router" subtitle="Elige el router donde se configurará este servicio.">
                <Field label="Router *" hint="Después de seleccionar el router se habilitará la tecnología.">
                  <select name="router_id" value={formData.router_id} onChange={handleRouterChange} required className={inputClass}>
                    <option value="">Selecciona un router</option>
                    {routers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
              </StepCard>

              <section className="service-wizard-flow p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="service-wizard-icon"><Info className="h-5 w-5" /></span>
                  <div>
                    <h3 className="service-wizard-flow-title font-extrabold">Flujo de configuración</h3>
                    <p className="service-wizard-flow-text mt-1 text-xs">Las opciones se habilitan en este orden:</p>
                  </div>
                </div>
                <div className="service-wizard-flow-text mt-4 space-y-2.5 text-xs sm:text-sm">
                  {["Router", "Tecnología", "Plan de internet", "Tipo de conexión", "Datos de acceso", "Zona y configuración técnica"].map((item, index) => (
                    <div key={item} className="flex items-center gap-2.5"><span className="service-wizard-flow-index">{index + 1}</span><span>{item}</span></div>
                  ))}
                </div>
              </section>

              <div className="service-wizard-success flex items-start gap-3 rounded-xl p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div><p className="text-sm font-bold">Control automático</p><p className="mt-1 text-xs">El plan siempre se valida contra la tecnología seleccionada.</p></div>
              </div>
            </div>

            <div className="space-y-4">
              <StepCard number="2" icon={Wifi} title="Selecciona la tecnología" subtitle="Define si el servicio será por fibra óptica o inalámbrico." locked={!routerReady}>
                <Field label="Tecnología *" hint={!routerReady ? "Primero selecciona un router." : "Al cambiar la tecnología se mostrarán únicamente sus planes compatibles."}>
                  <select name="technology" value={formData.technology} onChange={handleTechnologyChange} disabled={!routerReady} required className={inputClass}>
                    <option value="">{routerReady ? "Selecciona una tecnología" : "Primero selecciona un router"}</option>
                    <option value="fiber">Fibra óptica</option>
                    <option value="wireless">Inalámbrico</option>
                  </select>
                </Field>
              </StepCard>

              <StepCard number="3" icon={FileText} title="Plan de internet" subtitle="Solo se muestran planes activos de la tecnología seleccionada." locked={!technologyReady}>
                <Field label="Plan de internet *" hint={technologyReady ? `Planes disponibles para ${formData.technology === "wireless" ? "Inalámbrico" : "Fibra óptica"}.` : "Primero selecciona la tecnología."}>
                  <select name="plan_id" value={formData.plan_id} onChange={handlePlanChange} disabled={!technologyReady} required className={inputClass}>
                    <option value="">{technologyReady ? "Selecciona un plan" : "Primero selecciona una tecnología"}</option>
                    {compatiblePlans.map((p) => <option key={p.id} value={p.id}>{p.name} — S/. {Number(p.price || 0).toFixed(2)}</option>)}
                  </select>
                </Field>
              </StepCard>

              <StepCard number="4" icon={Link2} title="Tipo de conexión" subtitle="IP estática es la opción predeterminada; también puedes elegir PPPoE o DHCP." locked={!planReady}>
                <Field label="Tipo de conexión *" hint={!planReady ? "Primero selecciona el plan de internet." : "La opción predeterminada es IP estática."}>
                  <select name="connection_type" value={formData.connection_type} onChange={handleConnectionChange} disabled={!planReady} required className={inputClass}>
                    <option value="IP Estática">IP estática</option>
                    <option value="PPPoE">PPPoE</option>
                    <option value="DHCP">DHCP</option>
                  </select>
                </Field>
              </StepCard>

              <StepCard number="5" icon={Settings} title="Configuración y datos técnicos" subtitle="Completa cada dato en secuencia según el tipo de conexión y la tecnología." locked={!connectionReady}>
                <div className="space-y-4">
                  {formData.connection_type === "PPPoE" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Usuario PPPoE *" hint={!connectionReady ? "Primero completa los pasos 1 al 4." : "Al ingresar el usuario se habilita la contraseña y luego la zona."}>
                        <input name="pppoe_user" value={formData.pppoe_user} onChange={handlePppoeUserChange} disabled={!connectionReady} placeholder="Ej. cliente001" className={inputClass} />
                      </Field>
                      <Field label="Contraseña PPPoE" hint="Opcional según la configuración actual del servicio.">
                        <input type="password" name="pppoe_password" value={formData.pppoe_password} onChange={(e) => setFormData((p) => ({ ...p, pppoe_password: e.target.value }))} disabled={!connectionReady || !formData.pppoe_user.trim()} placeholder={!formData.pppoe_user.trim() ? "Primero ingresa el usuario" : "Contraseña"} className={inputClass} />
                      </Field>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Red IPv4 *" hint={!connectionReady ? "Primero completa los pasos 1 al 4." : "Solo aparecen redes del router y tipo de conexión elegidos."}>
                        <select name="ipv4_network_id" value={formData.ipv4_network_id} onChange={handleNetworkChange} disabled={!connectionReady} className={inputClass}>
                          <option value="">{connectionReady ? "Selecciona una red" : "Primero selecciona el tipo de conexión"}</option>
                          {compatibleNetworks.map((n) => <option key={n.id} value={n.id}>{n.name} — {n.cidr}</option>)}
                        </select>
                      </Field>
                      <Field label="IP disponible *" hint="Se habilita después de elegir una red.">
                        <select name="ip_address" value={formData.ip_address} disabled={!formData.ipv4_network_id || loadingAddresses} onChange={handleIpChange} className={inputClass}>
                          <option value="">{loadingAddresses ? "Consultando IPs disponibles…" : !formData.ipv4_network_id ? "Primero selecciona una red" : "Selecciona una IP disponible"}</option>
                          {formData.ip_address && !availableAddresses.includes(formData.ip_address) && <option value={formData.ip_address}>{formData.ip_address} (asignada a este servicio)</option>}
                          {availableAddresses.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </Field>
                    </div>
                  )}

                  <Field label="Zona *" hint={!accessReady ? (formData.connection_type === "PPPoE" ? "Primero ingresa el usuario PPPoE." : "Primero selecciona una IP disponible.") : "Después de la zona se habilitan los datos técnicos."}>
                    <select name="zone_id" value={formData.zone_id} onChange={handleZoneChange} disabled={!accessReady} required className={inputClass}>
                      <option value="">{accessReady ? "Selecciona una zona" : "Completa primero los datos de conexión"}</option>
                      {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </Field>

                  {formData.technology === "fiber" ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Caja NAP *" hint={!formData.zone_id ? "Primero selecciona una zona." : "Solo se muestran cajas NAP de la zona seleccionada."}>
                          <select name="nap_box_id" value={formData.nap_box_id} disabled={!formData.zone_id} onChange={(e) => setFormData((p) => ({ ...p, nap_box_id: e.target.value, nap_port: "", onu_sn: "", optical_power_dbm: "" }))} className={inputClass}>
                            <option value="">{!formData.zone_id ? "Primero selecciona una zona" : "Selecciona una caja NAP"}</option>
                            {napBoxes.filter((n) => n.zone_id === formData.zone_id).map((n) => <option key={n.id} value={n.id}>{n.display_name || n.name} ({n.ports} puertos)</option>)}
                          </select>
                        </Field>
                        <Field label="Puerto NAP *" hint="Se habilita después de elegir la caja NAP.">
                          <select name="nap_port" value={formData.nap_port} disabled={!formData.nap_box_id} onChange={(e) => setFormData((p) => ({ ...p, nap_port: e.target.value, onu_sn: "", optical_power_dbm: "" }))} className={inputClass}>
                            <option value="">{formData.nap_box_id ? "Selecciona un puerto" : "Primero selecciona una caja NAP"}</option>
                            {availableNapPorts.map((p) => <option key={p} value={p}>Puerto {p}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Serie ONU (opcional)" hint="Disponible después de elegir el puerto NAP.">
                          <input name="onu_sn" value={formData.onu_sn} onChange={(e) => setFormData((p) => ({ ...p, onu_sn: e.target.value }))} disabled={!formData.nap_port} placeholder={!formData.nap_port ? "Primero selecciona un puerto" : "Ej. VSOL12345678"} className={inputClass} />
                        </Field>
                        <Field label="Potencia óptica (dBm, opcional)" hint="Puedes escribir 14 o -14; el panel lo normaliza a -14 dBm.">
                          <input type="number" step="0.1" min="-40" max="0" name="optical_power_dbm" value={formData.optical_power_dbm} onChange={handleOpticalPowerChange} disabled={!formData.nap_port} placeholder={!formData.nap_port ? "Primero selecciona un puerto" : "Ej. -19.5"} className={inputClass} />
                        </Field>
                      </div>
                    </>
                  ) : formData.technology === "wireless" ? (
                    <>
                      <Field label="Conectado a *" hint={!formData.zone_id ? "Primero selecciona una zona." : "Selecciona el equipo inalámbrico de acceso."}>
                        <select name="monitoring_equipment_id" value={formData.monitoring_equipment_id} onChange={(e) => setFormData((p) => ({ ...p, monitoring_equipment_id: e.target.value, antenna_type: "", management_ip: "" }))} disabled={!formData.zone_id} required className={inputClass}>
                          <option value="">{formData.zone_id ? "Selecciona el equipo" : "Primero selecciona una zona"}</option>
                          {monitoringEquipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}{eq.management_ip ? ` — ${eq.management_ip}` : ""}</option>)}
                        </select>
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tipo de antena (opcional)"><input name="antenna_type" value={formData.antenna_type} onChange={(e) => setFormData((p) => ({ ...p, antenna_type: e.target.value }))} disabled={!formData.monitoring_equipment_id} placeholder={!formData.monitoring_equipment_id ? "Primero selecciona el equipo" : "Ej. LiteBeam 5AC"} className={inputClass} /></Field>
                        <Field label="IP de administración (opcional)"><input name="management_ip" value={formData.management_ip} onChange={(e) => setFormData((p) => ({ ...p, management_ip: e.target.value }))} disabled={!formData.monitoring_equipment_id} placeholder={!formData.monitoring_equipment_id ? "Primero selecciona el equipo" : "Ej. 192.168.1.20"} className={inputClass} /></Field>
                      </div>
                    </>
                  ) : null}
                </div>
              </StepCard>
            </div>
          </form>
        </div>

        <footer className="service-wizard-footer flex shrink-0 items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <p className="service-wizard-subtitle hidden text-xs sm:block">{canSubmit ? "Configuración completa. Ya puedes guardar el servicio." : "Completa los campos obligatorios en orden para habilitar Guardar."}</p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="service-wizard-close inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold"><X className="h-4 w-4" /> Cancelar</button>
            <button type="submit" form="client-service-form" disabled={saving || !canSubmit} className="service-wizard-save inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-100">{saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? "Guardando…" : editingPrimary || service ? "Guardar cambios" : "Guardar servicio"}</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ClientServiceEditor({ clientId, api, token, onSave, onSaveSuccess }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalService, setModalService] = useState(undefined);

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await axios.get(`${api}/clients/${clientId}/services`, { headers: { Authorization: `Bearer ${token}` } });
      setServices(r.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudieron cargar los servicios del cliente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, [api, clientId, token]);

  const afterSaved = (event = {}) => {
    setModalService(undefined);
    loadServices();
    onSave?.();
    onSaveSuccess?.(event);
  };

  const deleteService = async (s) => {
    if (s.is_primary) return;
    const serviceLabel = s.service_id ? `Servicio ${s.service_id}` : "este servicio adicional";
    const serviceDetails = [
      s.plan_name ? `Plan: ${s.plan_name}` : null,
      s.plan_price != null ? `Precio: S/. ${Number(s.plan_price).toFixed(2)}` : null,
      s.ip_address ? `IP: ${s.ip_address}` : null,
      s.pppoe_user ? `Usuario PPPoE: ${s.pppoe_user}` : null,
      s.router_name ? `Router: ${s.router_name}` : null,
      s.technology ? `Tecnología: ${s.technology === "wireless" ? "Inalámbrico" : "Fibra óptica"}` : null,
    ].filter(Boolean).join(" | ");
    const confirmed = window.confirm(`⚠️ ADVERTENCIA: ELIMINACIÓN DE SERVICIO\n\nVas a eliminar ${serviceLabel}.\n${serviceDetails}\n\nEsta acción es permanente y no se puede deshacer. El servicio dejará de aparecer en la ficha del cliente.\n\nSi este servicio tiene facturas pendientes o deuda asociada, el sistema te mostrará una segunda advertencia antes de eliminarlas.\n\n¿Estás seguro de que deseas continuar?`);
    if (!confirmed) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const deleteUrl = `${api}/clients/${clientId}/services/${s.service_id}`;
      let deleteResult;
      try {
        deleteResult = await axios.delete(deleteUrl, { headers });
      } catch (err) {
        const detail = err.response?.data?.detail;
        if (err.response?.status !== 409 || detail?.code !== "PENDING_INVOICES") throw err;
        const count = Number(detail.count || 0);
        const total = Number(detail.total || 0).toFixed(2);
        const confirmedPending = window.confirm(`⚠️ SEGUNDA ADVERTENCIA\n\nEl servicio tiene ${count} factura(s) pendiente(s) por un total de S/. ${total}.\n\nSi continúas, se eliminará el servicio y también esas facturas pendientes. Las facturas pagadas o parcialmente pagadas no se eliminan por este flujo.\n\nEsta acción no se puede deshacer.\n\n¿Deseas confirmar la eliminación?`);
        if (!confirmedPending) return;
        deleteResult = await axios.delete(`${deleteUrl}?confirm_delete_invoices=true`, { headers });
      }
      await loadServices();
      onSave?.();
      onSaveSuccess?.({ type: "delete", service: s, result: deleteResult?.data || {} });
    } catch (err) {
      setError(err.response?.data?.detail?.message || err.response?.data?.detail || "No se pudo eliminar el servicio.");
    }
  };

  if (loading) return <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-10 text-center"><Loader className="mx-auto mb-3 h-5 w-5 animate-spin text-cyan-300" /><p className="text-sm text-slate-400">Cargando servicios…</p></div>;

  return (
    <div className="client-services-panel space-y-4">
      {error && <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4"><AlertCircle className="h-5 w-5 shrink-0 text-rose-300" /><p className="text-sm text-rose-300">{error}</p></div>}
      <section className="client-services-card overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/35">
        <div className="client-services-heading flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div><h3 className="text-base font-bold text-white">Servicios de Internet</h3><p className="mt-1 text-xs text-slate-500">Todos los servicios del cliente se agrupan aquí.</p></div>
          <button type="button" onClick={() => setModalService(null)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"><Plus className="h-4 w-4" /> Nuevo servicio</button>
        </div>
        <div className="overflow-x-auto">
          <table className="client-services-table min-w-full text-left text-sm">
            <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Servicio</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Router</th><th className="px-4 py-3">Tecnología</th><th className="px-4 py-3">Señal ONU</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-800/80">
              {services.length === 0 ? <tr><td colSpan="8" className="px-4 py-12 text-center text-slate-500">No hay servicios registrados.</td></tr> : services.map((s, i) => (
                <tr key={s.service_id || i} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-200">{s.is_primary ? "Principal" : `Servicio ${i}`}</td>
                  <td className="px-4 py-3 text-slate-300">{s.plan_name || "Sin plan"}<div className="text-xs text-slate-500">S/. {Number(s.plan_price || 0).toFixed(2)}</div></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{s.ip_address || s.pppoe_user || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{s.router_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{s.technology === "wireless" ? "Inalámbrico" : "Fibra óptica"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.technology === "fiber" && s.optical_power_dbm != null ? <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${opticalPowerBadgeClass(s.optical_power_dbm)}`}>{Number(s.optical_power_dbm).toFixed(1)} dBm</span> : "—"}</td>
                  <td className="px-4 py-3"><span className={`client-service-status client-service-status--${s.status === "active" ? "active" : "inactive"} inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{s.status === "active" ? "Activo" : s.status || "Sin estado"}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" title="Editar" onClick={() => setModalService(s)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"><Pencil className="h-4 w-4" /></button>{!s.is_primary && <button type="button" title="Eliminar" onClick={() => deleteService(s)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {modalService !== undefined && <ServiceModal clientId={clientId} api={api} token={token} service={modalService} onSaved={afterSaved} onClose={() => setModalService(undefined)} />}
    </div>
  );
}
