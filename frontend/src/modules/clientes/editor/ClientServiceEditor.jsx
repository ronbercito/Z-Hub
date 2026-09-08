/**
 * Archivo: frontend/src/modules/clientes/editor/ClientServiceEditor.jsx
 * Actualización: 2026-09-08 — orden visual del formulario y selector de routers limitado a MikroTik.
 * Función: formulario editable para plan, router, tipo conexión, IP, tecnología (fibra/inalámbrico), NAP, ONU.
 * Recibe de: ClientDetail.jsx cuando el usuario está en la pestaña "service".
 * Entrega a: backend/app/routers/clientes/router.py mediante PATCH /api/clients/{client_id}/service.
 * No modifica: datos personales, facturación, tickets ni comunicaciones; solo configuración de servicio.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader, Save, X } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400";
const sectionClass = "rounded-2xl border border-slate-800 bg-slate-900/35 p-4 sm:p-5";

export default function ClientServiceEditor({ clientId, api, token, onSave, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    plan_id: "",
    router_id: "",
    connection_type: "PPPoE",
    ipv4_network_id: "",
    ip_address: "",
    pppoe_user: "",
    pppoe_password: "",
    technology: "fiber",
    zone_id: "",
    nap_box_id: "",
    nap_port: "",
    onu_sn: "",
    optical_power_dbm: "",
    monitoring_equipment_id: "",
    antenna_type: "",
    management_ip: "",
  });

  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [ipv4Networks, setIpv4Networks] = useState([]);
  const [zones, setZones] = useState([]);
  const [napBoxes, setNapBoxes] = useState([]);
  const [monitoringEquipment, setMonitoringEquipment] = useState([]);
  const [availableAddresses, setAvailableAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const connectionUsage = { "PPPoE": "pppoe_pool", "IP Estática": "static", "DHCP": "dhcp" }[formData.connection_type] || "static";
  const compatibleNetworks = ipv4Networks.filter((network) => network.router_id === formData.router_id && network.usage_type === connectionUsage);
  const selectedNap = napBoxes.find((nap) => nap.id === formData.nap_box_id);
  const occupiedNapPorts = new Set(Object.keys(selectedNap?.assigned_ports || {}).map(Number));
  const availableNapPorts = Array.from({ length: selectedNap?.ports || 0 }, (_, index) => index + 1)
    .filter((port) => !occupiedNapPorts.has(port) || Number(formData.nap_port) === port);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [clientRes, plansRes, routersRes, networksRes, zonesRes, napRes, equipRes] = await Promise.all([
          axios.get(`${api}/clients/${clientId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/plans`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/routers`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/ipv4-networks`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/zones`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/nap-boxes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${api}/monitoring-equipment`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const client = clientRes.data;
        setFormData({
          plan_id: client.plan_id || "",
          router_id: client.router_id || "",
          connection_type: client.connection_type || "PPPoE",
          ipv4_network_id: client.ipv4_network_id || "",
          ip_address: client.ip_address || "",
          pppoe_user: client.pppoe_user || "",
          pppoe_password: client.pppoe_password || "",
          technology: client.technology || "fiber",
          zone_id: client.zone_id || "",
          nap_box_id: client.nap_box_id || "",
          nap_port: client.nap_port ? String(client.nap_port) : "",
          onu_sn: client.onu_sn || "",
          optical_power_dbm: client.optical_power_dbm ?? "",
          monitoring_equipment_id: client.monitoring_equipment_id || "",
          antenna_type: client.antenna_type || "",
          management_ip: client.management_ip || "",
        });

        setPlans(plansRes.data || []);
        setRouters((routersRes.data || []).filter((router) => router.device_type === "mikrotik"));
        setIpv4Networks(networksRes.data || []);
        setZones(zonesRes.data || []);
        setNapBoxes(napRes.data || []);
        setMonitoringEquipment(equipRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || "No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api, clientId, token]);

  useEffect(() => {
    if (!formData.ipv4_network_id || formData.connection_type === "PPPoE") {
      setAvailableAddresses([]);
      return;
    }
    let active = true;
    setLoadingAddresses(true);
    axios.get(`${api}/ipv4-networks/${formData.ipv4_network_id}/available-addresses`, {
      params: { exclude_client_id: clientId },
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      if (active) setAvailableAddresses(response.data.addresses || []);
    }).catch(() => {
      if (active) setAvailableAddresses([]);
    }).finally(() => {
      if (active) setLoadingAddresses(false);
    });
    return () => { active = false; };
  }, [api, clientId, formData.connection_type, formData.ipv4_network_id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.plan_id) throw new Error("Selecciona un plan.");
      if (!formData.router_id) throw new Error("Selecciona un MikroTik.");
      if (!formData.technology) throw new Error("Selecciona la tecnología (Fibra u Inalámbrico).");

      if (formData.technology === "fiber") {
        if (!formData.zone_id) throw new Error("Selecciona una zona para fibra.");
        if (!formData.nap_box_id) throw new Error("Selecciona una caja NAP.");
        if (!formData.nap_port) throw new Error("Selecciona un puerto NAP.");
        if (formData.connection_type === "PPPoE") {
          if (!formData.pppoe_user) throw new Error("Ingresa usuario PPPoE.");
        } else {
          if (!formData.ipv4_network_id) throw new Error("Selecciona una red IPv4.");
          if (!formData.ip_address) throw new Error("Ingresa la IP del cliente.");
        }
      } else if (!formData.monitoring_equipment_id) {
        throw new Error("Selecciona un equipo de monitoreo.");
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
        nap_box_id: formData.nap_box_id || null,
        nap_port: formData.nap_port ? parseInt(formData.nap_port) : null,
        onu_sn: formData.onu_sn || null,
        optical_power_dbm: formData.optical_power_dbm === "" ? null : parseFloat(formData.optical_power_dbm),
        monitoring_equipment_id: formData.monitoring_equipment_id || null,
        antenna_type: formData.antenna_type || null,
        management_ip: formData.management_ip || null,
      };

      await axios.patch(`${api}/clients/${clientId}/service`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Servicio del cliente actualizado correctamente.");
      const closeAfterSave = onSave || onSaveSuccess;
      if (closeAfterSave) closeAfterSave();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Error al guardar los cambios.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-10 text-center">
        <Loader className="mx-auto mb-3 h-5 w-5 animate-spin text-cyan-300" />
        <p className="text-sm text-slate-400">Cargando datos de servicio…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className={sectionClass}>
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Configuración básica</h3>
            <p className="mt-1 text-xs text-slate-500">Define el plan y el router MikroTik que atenderá este servicio.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Plan</label>
              <select name="plan_id" value={formData.plan_id} onChange={handleChange} required className={inputClass}>
                <option value="">Selecciona un plan</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - S/. {plan.price}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Router MikroTik</label>
              <select name="router_id" value={formData.router_id} onChange={handleChange} required className={inputClass}>
                <option value="">Selecciona un MikroTik</option>
                {routers.map((router) => <option key={router.id} value={router.id}>{router.name}</option>)}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-500">Solo se muestran equipos MikroTik. Las OLT no aparecen aquí.</p>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Tecnología y conexión</h3>
            <p className="mt-1 text-xs text-slate-500">Selecciona cómo se conectará el abonado a la red.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Tecnología</label>
              <select name="technology" value={formData.technology} onChange={handleChange} required className={inputClass}>
                <option value="fiber">Fibra óptica</option>
                <option value="wireless">Inalámbrico</option>
              </select>
            </div>
            {formData.technology === "fiber" && (
              <div>
                <label className={labelClass}>Tipo de conexión</label>
                <select name="connection_type" value={formData.connection_type} onChange={handleChange} className={inputClass}>
                  <option value="PPPoE">PPPoE</option>
                  <option value="IP Estática">IP Estática</option>
                  <option value="DHCP">DHCP</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {formData.technology === "fiber" && formData.connection_type !== "PPPoE" && (
          <section className={sectionClass}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Red y dirección IP</h3>
              <p className="mt-1 text-xs text-slate-500">La red se filtra automáticamente según el MikroTik y el tipo de conexión.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Red IPv4</label>
                <select name="ipv4_network_id" value={formData.ipv4_network_id} onChange={(e) => setFormData((prev) => ({ ...prev, ipv4_network_id: e.target.value, ip_address: "" }))} className={inputClass}>
                  <option value="">Selecciona una red</option>
                  {compatibleNetworks.map((net) => <option key={net.id} value={net.id}>{net.name} (${net.cidr})</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Dirección IP del cliente</label>
                <select name="ip_address" value={formData.ip_address} disabled={!formData.ipv4_network_id || loadingAddresses} onChange={handleChange} className={inputClass}>
                  <option value="">{loadingAddresses ? "Consultando IPs disponibles…" : !formData.ipv4_network_id ? "Primero selecciona una red" : "Selecciona una IP disponible"}</option>
                  {formData.ip_address && !availableAddresses.includes(formData.ip_address) && <option value={formData.ip_address}>{formData.ip_address} (asignada a este cliente)</option>}
                  {availableAddresses.map((address) => <option key={address} value={address}>{address}</option>)}
                </select>
              </div>
            </div>
          </section>
        )}

        {formData.technology === "fiber" && formData.connection_type === "PPPoE" && (
          <section className={sectionClass}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Credenciales PPPoE</h3>
              <p className="mt-1 text-xs text-slate-500">Datos utilizados para autenticar al cliente en el servicio PPPoE.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Usuario PPPoE</label>
                <input type="text" name="pppoe_user" value={formData.pppoe_user} onChange={handleChange} placeholder="Ej. cliente001" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contraseña PPPoE</label>
                <input type="password" name="pppoe_password" value={formData.pppoe_password} onChange={handleChange} placeholder="Contraseña" className={inputClass} />
              </div>
            </div>
          </section>
        )}

        {formData.technology === "fiber" && (
          <section className={sectionClass}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Instalación de fibra</h3>
              <p className="mt-1 text-xs text-slate-500">Ubicación física del abonado y parámetros ópticos de la ONU.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Zona</label>
                <select name="zone_id" value={formData.zone_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selecciona una zona</option>
                  {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Caja NAP</label>
                <select name="nap_box_id" value={formData.nap_box_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selecciona una caja NAP</option>
                  {napBoxes.filter((nap) => nap.zone_id === formData.zone_id).map((nap) => <option key={nap.id} value={nap.id}>{nap.name} ({nap.ports} puertos)</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Puerto NAP</label>
                <select name="nap_port" value={formData.nap_port} disabled={!selectedNap || availableNapPorts.length === 0} onChange={handleChange} className={inputClass}>
                  <option value="">{!selectedNap ? "Primero selecciona una caja NAP" : availableNapPorts.length === 0 ? "No hay puertos libres" : "Selecciona un puerto libre"}</option>
                  {availableNapPorts.map((port) => <option key={port} value={port}>Puerto {port}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Serie ONU <span className="normal-case tracking-normal text-slate-600">(opcional)</span></label>
                <input type="text" name="onu_sn" value={formData.onu_sn} onChange={handleChange} placeholder="Ej. VSOL12345678" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Potencia óptica <span className="normal-case tracking-normal text-slate-600">(dBm, opcional)</span></label>
                <input type="number" step="0.1" name="optical_power_dbm" value={formData.optical_power_dbm} onChange={handleChange} placeholder="Ej. -19.5" className={inputClass} />
              </div>
            </div>
          </section>
        )}

        {formData.technology === "wireless" && (
          <section className={sectionClass}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Instalación inalámbrica</h3>
              <p className="mt-1 text-xs text-slate-500">Equipo de monitoreo y datos de administración del enlace.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Equipo de monitoreo</label>
                <select name="monitoring_equipment_id" value={formData.monitoring_equipment_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selecciona un equipo</option>
                  {monitoringEquipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipo de antena <span className="normal-case tracking-normal text-slate-600">(opcional)</span></label>
                <input type="text" name="antenna_type" value={formData.antenna_type} onChange={handleChange} placeholder="Ej. Ubiquiti 5 GHz" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>IP de administración <span className="normal-case tracking-normal text-slate-600">(opcional)</span></label>
                <input type="text" name="management_ip" value={formData.management_ip} onChange={handleChange} placeholder="Ej. 192.168.1.20" className={inputClass} />
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4">
          <button type="button" onClick={onCancel} disabled={saving} className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50">
            <X className="h-4 w-4" /> Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50">
            {saving ? <><Loader className="h-4 w-4 animate-spin" /> Guardando…</> : <><Save className="h-4 w-4" /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}
