/**
 * Archivo: frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx
 * Función: Registro guiado de clientes en tres pasos: datos personales,
 *          facturación y servicio técnico.
 * Alcance: conserva el guardado/aprovisionamiento existente y aplica al alta
 *          el mismo orden progresivo del modal Nuevo servicio.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CreditCard, MapPin, UserRound, Wifi, X } from "lucide-react";
import CoordinatesPicker from "../../red/components/CoordinatesPicker";
import { toast } from "sonner";
import "./client-registration-service.css";

const planTechnology = (type = "") => {
  const value = String(type).toLowerCase();
  if (value.includes("hotspot")) return "hotspot";
  if (value.includes("radio") || value.includes("inalam") || value.includes("inalám") || value.includes("ubiquiti") || value.includes("mimosa")) return "wireless";
  return "fiber";
};

const Step = ({ number, label, subtitle, active, done, onClick }) => (
  <button type="button" onClick={onClick} className={`flex-1 min-w-44 text-left p-4 border-b-2 transition ${active ? "border-cyan-400 bg-cyan-500/10" : "border-transparent hover:bg-slate-800/50"}`}>
    <div className="flex gap-2 items-center">
      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${active ? "bg-cyan-500 text-white" : done ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>{done ? <Check className="w-4 h-4" /> : number}</span>
      <div><p className="text-xs font-bold text-slate-100">{label}</p><p className="text-[10px] text-slate-400">{subtitle}</p></div>
    </div>
  </button>
);

export default function ClientRegistrationWizard({ selectedClient, formData, setFormData, plans, routers, ipv4Networks, napBoxes, onClose, onSubmit, api, token }) {
  const [step, setStep] = useState(1);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [showCoordinatesPicker, setShowCoordinatesPicker] = useState(false);
  const [registrationPolicy, setRegistrationPolicy] = useState({ installationDateRequired: true });
  const [availableAddresses, setAvailableAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [zones, setZones] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const selectedTechnology = formData.technology || "fiber";
  const activePlans = plans.filter((plan) => plan.is_active && planTechnology(plan.type) === selectedTechnology);
  const routersAvailable = routers.filter((router) => router.device_type === "mikrotik");
  const connectionUsage = { "PPPoE": "pppoe_pool", "IP Estática": "static", "DHCP": "dhcp" }[formData.connection_type] || "static";
  const networks = ipv4Networks.filter((network) => network.router_id === formData.router_id && network.usage_type === connectionUsage);
  const napBoxesForZone = formData.zone_id ? napBoxes.filter((box) => box.zone_id === formData.zone_id) : [];
  const nap = napBoxesForZone.find((box) => box.id === formData.nap_box_id);
  const occupiedNapPorts = new Set(Object.keys(nap?.assigned_ports || {}).map(Number));
  const availableNapPorts = Array.from({ length: nap?.ports || 0 }, (_, index) => index + 1)
    .filter((port) => !occupiedNapPorts.has(port) || (selectedClient?.id && Number(formData.nap_port) === port));

  const routerReady = Boolean(formData.router_id);
  const technologyReady = routerReady && Boolean(formData.technology);
  const planReady = technologyReady && activePlans.some((plan) => String(plan.id) === String(formData.plan_id));
  const connectionReady = planReady && Boolean(formData.connection_type);
  const networkReady = connectionReady && Boolean(formData.ipv4_network_id);
  const accessReady = formData.connection_type === "PPPoE"
    ? networkReady && Boolean(formData.pppoe_user?.trim()) && Boolean(formData.pppoe_password?.trim())
    : networkReady && Boolean(formData.ip_address);
  const zoneReady = accessReady && Boolean(formData.zone_id);
  const technicalReady = formData.technology === "wireless"
    ? zoneReady && Boolean(formData.monitoring_equipment_id)
    : zoneReady && Boolean(formData.nap_box_id) && formData.nap_port !== "" && formData.nap_port != null;
  const serviceReady = routerReady && technologyReady && planReady && connectionReady && accessReady && technicalReady;

  useEffect(() => {
    axios.get(`${api}/client-registration-settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const policy = {
          billingDay: Math.min(30, Math.max(1, Number(response.data.billing_day || 5))),
          technology: response.data.technology === "wireless" ? "wireless" : "fiber",
          installationDateRequired: response.data.installation_date_required !== false,
          createFirstInvoice: response.data.create_first_invoice_default !== false,
        };
        setRegistrationPolicy(policy);
        if (!selectedClient) {
          setFormData((current) => {
            const prefilledIdentity = Boolean(current.full_name || current.dni_ruc || current.address || current.phone);
            const technology = prefilledIdentity && current.technology ? current.technology : policy.technology;
            return {
              ...current,
              billing_day: policy.billingDay,
              create_first_invoice: policy.createFirstInvoice,
              technology,
              connection_type: "IP Estática",
              plan_id: technology === current.technology ? current.plan_id : "",
              ipv4_network_id: "",
              ip_address: "",
              pppoe_user: "",
              pppoe_password: "",
            };
          });
        }
      })
      .catch(() => setRegistrationPolicy({ installationDateRequired: true }));
  }, [api, token, selectedClient?.id, setFormData]);

  useEffect(() => {
    axios.all([
      axios.get(`${api}/zones`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${api}/monitoring-equipment`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([zoneResponse, equipmentResponse]) => {
      setZones(zoneResponse.data || []);
      setEquipment(equipmentResponse.data || []);
    }).catch(() => {});
  }, [api, token]);

  useEffect(() => {
    if (!formData.ipv4_network_id || formData.connection_type === "PPPoE") {
      setAvailableAddresses([]);
      return undefined;
    }
    let active = true;
    setLoadingAddresses(true);
    axios.get(`${api}/ipv4-networks/${formData.ipv4_network_id}/available-addresses`, {
      params: { exclude_client_id: selectedClient?.id || "" },
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      if (active) setAvailableAddresses(response.data.addresses || []);
    }).catch(() => {
      if (active) {
        setAvailableAddresses([]);
        toast.error("No se pudieron consultar las IPs disponibles.");
      }
    }).finally(() => { if (active) setLoadingAddresses(false); });
    return () => { active = false; };
  }, [api, token, selectedClient?.id, formData.connection_type, formData.ipv4_network_id]);

  const validateInstallationDate = () => {
    if (!selectedClient && registrationPolicy.installationDateRequired && !formData.installation_date) {
      toast.error("La fecha de instalación es obligatoria según Configuración clientes.");
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 1 && (!formData.full_name?.trim() || !formData.dni_ruc?.trim() || !formData.address?.trim() || !formData.phone?.trim())) {
      toast.error("Completa nombre, identificación, dirección y celular antes de continuar.");
      return;
    }
    if (step === 1 && !validateInstallationDate()) return;
    setStep((value) => Math.min(3, value + 1));
  };

  const resetTechnical = () => ({
    ipv4_network_id: "", ip_address: "", pppoe_user: "", pppoe_password: "",
    zone_id: "", nap_box_id: "", nap_box: "", nap_port: "", onu_sn: "", optical_power_dbm: "",
    monitoring_equipment_id: "", antenna_type: "", management_ip: "",
  });

  const changeRouter = (value) => setFormData((current) => ({
    ...current,
    router_id: value,
    technology: "",
    plan_id: "",
    connection_type: "IP Estática",
    ...resetTechnical(),
  }));

  const changeTechnology = (value) => setFormData((current) => ({
    ...current,
    technology: value,
    plan_id: "",
    connection_type: "IP Estática",
    ...resetTechnical(),
  }));

  const changePlan = (value) => setFormData((current) => ({
    ...current,
    plan_id: value,
    connection_type: "IP Estática",
    ...resetTechnical(),
  }));

  const changeConnection = (value) => setFormData((current) => ({
    ...current,
    connection_type: value,
    ...resetTechnical(),
  }));

  const changeNetwork = (value) => setFormData((current) => ({
    ...current,
    ipv4_network_id: value,
    ip_address: "",
    pppoe_user: "",
    pppoe_password: "",
    zone_id: "",
    nap_box_id: "",
    nap_box: "",
    nap_port: "",
    onu_sn: "",
    optical_power_dbm: "",
    monitoring_equipment_id: "",
    antenna_type: "",
    management_ip: "",
  }));

  const changeZone = (value) => setFormData((current) => ({
    ...current,
    zone_id: value,
    nap_box_id: "",
    nap_box: "",
    nap_port: "",
    onu_sn: "",
    optical_power_dbm: "",
    monitoring_equipment_id: "",
    antenna_type: "",
    management_ip: "",
  }));

  const submit = (event) => {
    event.preventDefault();
    if (!validateInstallationDate()) { setStep(1); return; }
    if (!formData.router_id) return toast.error("Selecciona el Router del abonado.");
    if (!formData.technology) return toast.error("Selecciona la tecnología del abonado.");
    if (!formData.plan_id || !activePlans.some((plan) => String(plan.id) === String(formData.plan_id))) {
      return toast.error(selectedTechnology === "wireless" ? "Selecciona un plan inalámbrico para este abonado." : "Selecciona un plan de fibra óptica para este abonado.");
    }
    if (!formData.connection_type) return toast.error("Selecciona el tipo de conexión.");
    if (!formData.ipv4_network_id) return toast.error(formData.connection_type === "PPPoE" ? "Selecciona un pool PPPoE." : "Selecciona una red IPv4.");
    if (formData.connection_type === "PPPoE" && (!formData.pppoe_user?.trim() || !formData.pppoe_password?.trim())) return toast.error("Ingresa el usuario y la clave PPPoE.");
    if (formData.connection_type !== "PPPoE" && !formData.ip_address) return toast.error("Selecciona una IP disponible.");
    if (!formData.zone_id) return toast.error("Selecciona una zona.");
    if (formData.technology === "wireless" && !formData.monitoring_equipment_id) return toast.error("Para un cliente inalámbrico selecciona el equipo al que se conectará.");
    if (formData.technology === "fiber" && (!formData.nap_box_id || formData.nap_port === "" || formData.nap_port == null)) return toast.error("Para fibra selecciona una Caja NAP y un puerto libre.");
    onSubmit(event);
  };

  return <>
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-5xl mx-auto my-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div><h3 className="text-lg font-bold text-slate-100">{selectedClient ? "Editar usuario" : "Nuevo usuario"}</h3><p className="text-xs text-slate-400">Registro guiado de abonado y aprovisionamiento de servicio.</p></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-100"><X /></button>
        </div>
        <div className="flex overflow-x-auto bg-slate-950/40">
          <Step number="1" label="Datos personales" subtitle="Nombre, dirección y contacto" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
          <Step number="2" label="Facturación" subtitle="Cobro y primera factura" active={step === 2} done={step > 2} onClick={() => setStep(2)} />
          <Step number="3" label="Servicio" subtitle="Router, tecnología, plan y red" active={step === 3} done={false} onClick={() => setStep(3)} />
        </div>
        <form noValidate onSubmit={submit}>
          <div className="p-6 min-h-[400px]">
            {step === 1 && <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre completo / Razón social *"><input required value={formData.full_name} onChange={e=>setFormData({...formData,full_name:e.target.value})} placeholder="Ej. Carlos Pérez / Empresa SAC" /></Field>
              <Field label="DNI / RUC *"><input required value={formData.dni_ruc} onChange={e=>setFormData({...formData,dni_ruc:e.target.value})} placeholder="DNI o RUC" /></Field>
              <div className="md:col-span-2"><Field label="Dirección principal *"><input required value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} placeholder="Av. / Jr. / Mz. Lt. / distrito" /></Field></div>
              <Field label="Celular / WhatsApp *"><input required value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder="987654321" /></Field>
              <Field label="Correo electrónico"><input type="email" value={formData.email || ""} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="cliente@correo.com" /></Field>
              <div className="md:col-span-2"><Field label="Referencia de instalación"><input value={formData.reference || ""} onChange={e=>setFormData({...formData,reference:e.target.value})} placeholder="Casa de dos pisos, portón negro..." /></Field></div>
              <Field label="Coordenadas (latitud)"><input type="number" step="any" value={formData.latitude ?? ""} onChange={e=>setFormData({...formData,latitude:e.target.value})} placeholder="-8.0679" /></Field>
              <Field label="Coordenadas (longitud)"><input type="number" step="any" value={formData.longitude ?? ""} onChange={e=>setFormData({...formData,longitude:e.target.value})} placeholder="-78.9859" /></Field>
              <div className="md:col-span-2"><button type="button" onClick={() => setShowCoordinatesPicker(true)} className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"><MapPin className="w-4 h-4" /> Elegir coordenadas en el mapa</button><p className="mt-1 text-[10px] text-slate-500">Mueve el marcador o haz clic en el punto de instalación.</p></div>
              <div className="md:col-span-2 relative z-50 text-xs text-slate-300 font-semibold space-y-1">
                <span>Fecha de instalación{registrationPolicy.installationDateRequired ? " *" : " (opcional)"}</span>
                <div className="flex gap-2"><input required={registrationPolicy.installationDateRequired} readOnly value={formatDate(formData.installation_date)} placeholder="Selecciona una fecha" onClick={() => setDatePickerOpen(!datePickerOpen)} className="flex-1 cursor-pointer p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-normal" /><button type="button" onClick={() => setDatePickerOpen(!datePickerOpen)} className="px-3 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 hover:bg-slate-700" title="Elegir fecha"><CalendarDays className="w-4 h-4" /></button>{!registrationPolicy.installationDateRequired && formData.installation_date && <button type="button" onClick={() => setFormData({...formData, installation_date: ""})} className="px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700">Sin fecha</button>}</div>
                {datePickerOpen && <CalendarPicker value={formData.installation_date} month={calendarMonth} onMonthChange={setCalendarMonth} onSelect={(date) => { setFormData({...formData, installation_date: date}); setDatePickerOpen(false); }} />}
              </div>
            </div>}

            {step === 2 && <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Facturación" icon={CreditCard}>
                <Field label="Tipo de servicio"><select value={formData.billing_type || "prepaid"} onChange={e=>setFormData({...formData,billing_type:e.target.value})}><option value="prepaid">Prepago (adelantado)</option><option value="postpaid">Postpago</option></select></Field>
                <Field label="Día de pago"><select value={formData.billing_day ?? 5} onChange={e=>setFormData({...formData,billing_day:Number(e.target.value)})}>{Array.from({length:30},(_,index)=>index+1).map(day=><option key={day} value={day}>Día {day} de cada mes</option>)}</select></Field>
                <Field label="Crear factura"><select value={formData.invoice_lead_days ?? 5} onChange={e=>setFormData({...formData,invoice_lead_days:Number(e.target.value)})}>{Array.from({length:20},(_,index)=>index+1).map(day=><option key={day} value={day}>{day} día{day !== 1 ? "s" : ""} antes</option>)}</select></Field>
                <Field label="Días de gracia"><select value={formData.grace_days ?? 5} onChange={e=>setFormData({...formData,grace_days:Number(e.target.value)})}>{Array.from({length:20},(_,index)=>index+1).map(day=><option key={day} value={day}>{day} día{day !== 1 ? "s" : ""}</option>)}</select></Field>
                <Field label="Aplicar corte"><select value={formData.cut_after_months ?? 1} onChange={e=>setFormData({...formData,cut_after_months:Number(e.target.value)})}>{Array.from({length:6},(_,index)=>index+1).map(month=><option key={month} value={month}>{month} mes{month !== 1 ? "es" : ""} vencido{month !== 1 ? "s" : ""}</option>)}</select></Field>
                <label className="flex gap-3 items-center text-xs text-slate-300"><input type="checkbox" checked={formData.create_first_invoice !== false} onChange={e=>setFormData({...formData,create_first_invoice:e.target.checked})} /> Crear primera factura al registrar</label>
                <Field label="Estado inicial"><select value={formData.status || "active"} onChange={e=>setFormData({...formData,status:e.target.value})}><option value="active">Activo</option><option value="pending_install">Pendiente de instalación</option><option value="suspended">Suspendido</option></select></Field>
              </Card>
              <Card title="Notificaciones" icon={UserRound}>
                <p className="text-xs text-slate-400">Los avisos usarán los datos de contacto del usuario.</p>
                <Field label="Aviso de nueva factura"><select value={formData.invoice_notification_channel || "none"} onChange={e=>setFormData({...formData,invoice_notification_channel:e.target.value})}><option value="none">Desactivado</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option><option value="sms">SMS</option></select></Field>
                <Field label="Recordatorios de pago"><select value={formData.payment_reminder_channel || "none"} onChange={e=>setFormData({...formData,payment_reminder_channel:e.target.value})}><option value="none">Desactivado</option><option value="whatsapp">WhatsApp</option><option value="email">Correo</option><option value="sms">SMS</option></select></Field>
                <Reminder label="Recordatorio #1" field="reminder_1_days" value={formData.reminder_1_days} setFormData={setFormData} formData={formData} />
                <Reminder label="Recordatorio #2" field="reminder_2_days" value={formData.reminder_2_days} setFormData={setFormData} formData={formData} />
                <Reminder label="Recordatorio #3" field="reminder_3_days" value={formData.reminder_3_days} setFormData={setFormData} formData={formData} />
                <div className="pt-2 text-[11px] text-cyan-300"><p>Celular: {formData.phone || "Sin registrar"}</p><p className="mt-1">Correo: {formData.email || "Sin registrar"}</p></div>
              </Card>
            </div>}

            {step === 3 && <div className="client-registration-service max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Internet y Router" icon={Wifi}>
                <Field label="Router *"><select required value={formData.router_id || ""} onChange={e=>changeRouter(e.target.value)}><option value="">Selecciona un Router</option>{routersAvailable.map(router=><option key={router.id} value={router.id}>{router.name}</option>)}</select></Field>
                <Field label="Tecnología *"><select required disabled={!routerReady} value={formData.technology || ""} onChange={e=>changeTechnology(e.target.value)}><option value="">Selecciona la tecnología</option><option value="fiber">Fibra óptica</option><option value="wireless">Inalámbrico</option></select></Field>
                <Field label="Plan de internet *"><select required disabled={!technologyReady} value={planReady ? formData.plan_id : ""} onChange={e=>changePlan(e.target.value)}><option value="">Selecciona un plan</option>{activePlans.map(plan=><option key={plan.id} value={plan.id}>{plan.name} — S/. {Number(plan.price).toFixed(2)}</option>)}</select></Field>
                <Field label="Tipo de conexión *"><select disabled={!planReady} value={formData.connection_type || "IP Estática"} onChange={e=>changeConnection(e.target.value)}><option value="IP Estática">IP estática</option><option value="PPPoE">PPPoE</option><option value="DHCP">DHCP</option></select></Field>
                <Field label={formData.connection_type === "PPPoE" ? "Pool PPPoE *" : formData.connection_type === "DHCP" ? "Pool DHCP *" : "Red IP estática *"}><select disabled={!connectionReady} value={formData.ipv4_network_id || ""} onChange={e=>changeNetwork(e.target.value)}><option value="">Selecciona {formData.connection_type === "PPPoE" ? "un pool PPPoE" : "una red"}</option>{networks.map(network=><option key={network.id} value={network.id}>{network.name} — {network.cidr}</option>)}</select></Field>
                {formData.connection_type === "PPPoE" ? <>
                  <Field label="Usuario PPPoE *"><input required disabled={!networkReady} value={formData.pppoe_user || ""} onChange={e=>setFormData({...formData,pppoe_user:e.target.value,pppoe_password:"",zone_id:"",nap_box_id:"",nap_port:"",monitoring_equipment_id:""})} placeholder="usuario_pppoe" /></Field>
                  <Field label="Clave PPPoE *"><input required type="password" disabled={!networkReady || !formData.pppoe_user?.trim()} value={formData.pppoe_password || ""} onChange={e=>setFormData({...formData,pppoe_password:e.target.value,zone_id:"",nap_box_id:"",nap_port:"",monitoring_equipment_id:""})} placeholder="Clave del usuario PPPoE" /></Field>
                </> : <Field label={formData.connection_type === "DHCP" ? "IP disponible / reserva DHCP *" : "IP disponible del cliente *"}><select disabled={!networkReady || loadingAddresses} value={formData.ip_address || ""} onChange={e=>setFormData({...formData,ip_address:e.target.value,zone_id:"",nap_box_id:"",nap_port:"",monitoring_equipment_id:""})}><option value="">{loadingAddresses ? "Consultando IPs disponibles..." : "Selecciona una IP disponible"}</option>{formData.ip_address && !availableAddresses.includes(formData.ip_address) && <option value={formData.ip_address}>{formData.ip_address} (asignada a este cliente)</option>}{availableAddresses.map(address=><option key={address} value={address}>{address}</option>)}</select></Field>}
              </Card>

              <Card title="Instalación y datos técnicos" icon={Wifi}>
                <Field label="Zona *"><select required disabled={!accessReady} value={formData.zone_id || ""} onChange={e=>changeZone(e.target.value)}><option value="">Selecciona una zona</option>{zones.map(zone=><option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></Field>
                {(formData.technology || "fiber") === "fiber" ? <>
                  <Field label="Caja NAP *"><select disabled={!zoneReady} value={formData.nap_box_id || ""} onChange={e=>setFormData({...formData,nap_box_id:e.target.value,nap_port:"",nap_box:"",onu_sn:"",optical_power_dbm:""})}><option value="">Selecciona una caja NAP</option>{napBoxesForZone.map(box=><option key={box.id} value={box.id}>{box.name}</option>)}</select></Field>
                  <Field label="Puerto NAP *"><select required disabled={!nap || availableNapPorts.length === 0} value={formData.nap_port ?? ""} onChange={e=>setFormData({...formData,nap_port:e.target.value === "" ? "" : Number(e.target.value),onu_sn:"",optical_power_dbm:""})}><option value="">{!nap ? "Selecciona una caja NAP" : availableNapPorts.length === 0 ? "No hay puertos libres" : "Selecciona un puerto libre"}</option>{availableNapPorts.map(port=><option key={port} value={port}>Puerto {port}</option>)}</select></Field>
                  <Field label="Serie ONU (opcional)"><input disabled={!formData.nap_port} value={formData.onu_sn || ""} onChange={e=>setFormData({...formData,onu_sn:e.target.value})} placeholder="SN / MAC de la ONU" /></Field>
                  <Field label="Potencia de la ONU (dBm, opcional)"><input disabled={!formData.nap_port} type="number" step="0.1" value={formData.optical_power_dbm ?? ""} onChange={e=>setFormData({...formData,optical_power_dbm:e.target.value === "" ? "" : String(-Math.abs(Number(e.target.value)))})} placeholder="-19.5" /></Field>
                </> : <>
                  <Field label="Conectado a *"><select required disabled={!zoneReady} value={formData.monitoring_equipment_id || ""} onChange={e=>setFormData({...formData,monitoring_equipment_id:e.target.value,antenna_type:"",management_ip:""})}><option value="">Selecciona un equipo</option>{equipment.map(item=><option key={item.id} value={item.id}>{item.name}{item.ip_address ? ` — ${item.ip_address}` : ""}</option>)}</select></Field>
                  <Field label="Tipo de antena (opcional)"><input disabled={!formData.monitoring_equipment_id} value={formData.antenna_type || ""} onChange={e=>setFormData({...formData,antenna_type:e.target.value})} placeholder="Ej. LiteBeam 5AC" /></Field>
                  <Field label="IP administración (opcional)"><input disabled={!formData.monitoring_equipment_id} value={formData.management_ip || ""} onChange={e=>setFormData({...formData,management_ip:e.target.value})} placeholder="192.168.x.x" /></Field>
                </>}
              </Card>
            </div>}
          </div>

          <div className="flex justify-between gap-3 p-5 bg-slate-950/50 border-t border-slate-800">
            <button type="button" onClick={step === 1 ? onClose : () => setStep(step - 1)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> {step === 1 ? "Cancelar" : "Anterior"}</button>
            {step < 3 ? <button type="button" onClick={next} className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold flex items-center gap-1">Siguiente <ChevronRight className="w-4 h-4" /></button> : <button type="submit" disabled={!serviceReady} className="client-registration-submit px-5 py-2 rounded-xl bg-cyan-500 text-white font-semibold disabled:cursor-not-allowed disabled:opacity-40">Registrar usuario</button>}
          </div>
        </form>
      </div>
    </div>
    {showCoordinatesPicker && <CoordinatesPicker title={`Ubicación · ${formData.full_name || "Cliente"}`} latitude={formData.latitude} longitude={formData.longitude} onApply={({ lat, lng }) => setFormData({ ...formData, latitude: lat, longitude: lng })} onClose={() => setShowCoordinatesPicker(false)} />}
  </>;
}

const Field = ({ label, children }) => <label className="block text-xs text-slate-300 font-semibold space-y-1"><span>{label}</span>{React.cloneElement(children,{className:"client-registration-service-input w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-normal disabled:opacity-50"})}</label>;
const Reminder = ({ label, field, value, formData, setFormData }) => <Field label={label}><select value={value ?? ""} onChange={e=>setFormData({...formData,[field]:e.target.value === "" ? null : Number(e.target.value)})}><option value="">Desactivado</option>{Array.from({length:20},(_,index)=>index+1).map(day=><option key={day} value={day}>{day} día{day !== 1 ? "s" : ""} antes</option>)}</select></Field>;
const formatDate = (value) => { if (!value) return ""; const [year, month, day] = value.split("-"); return year && month && day ? `${day}/${month}/${year}` : value; };
const toISODate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CalendarPicker = ({ value, month, onMonthChange, onSelect }) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - start + 1));
  return <div className="absolute z-[60] left-0 top-full mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
    <div className="flex items-center justify-between mb-2"><button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1 text-slate-300 hover:text-cyan-300"><ChevronLeft className="w-4 h-4" /></button><b className="text-xs text-slate-100">{MONTHS[month.getMonth()]} {month.getFullYear()}</b><button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1 text-slate-300 hover:text-cyan-300"><ChevronRight className="w-4 h-4" /></button></div>
    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-1">{["Lu","Ma","Mi","Ju","Vi","Sa","Do"].map(day => <span key={day}>{day}</span>)}</div>
    <div className="grid grid-cols-7 gap-1">{cells.map((day) => { const iso = toISODate(day), selected = iso === value, current = day.getMonth() === month.getMonth(); return <button type="button" key={iso} onClick={() => onSelect(iso)} className={`h-8 rounded-lg text-xs transition ${selected ? "bg-cyan-500 text-white font-bold" : current ? "text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-800/50"}`}>{day.getDate()}</button>; })}</div>
  </div>;
};

const Card = ({ title, icon: Icon, children }) => <section className="client-registration-service-card p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4"><h4 className="text-sm font-bold text-slate-100 flex items-center gap-2"><Icon className="w-4 h-4 text-cyan-400" /> {title}</h4>{children}</section>;
