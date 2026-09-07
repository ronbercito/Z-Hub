/**
 * Archivo: frontend/src/modules/clientes/editor/ClientServiceEditor.jsx
 * Actualización: 2026-09-07 — editor completo de servicio del cliente.
 * Función: formulario editable para plan, router, tipo conexión, IP, tecnología (fibra/inalámbrico), NAP, ONU.
 * Recibe de: ClientDetail.jsx cuando el usuario está en la pestaña "service".
 * Entrega a: backend/app/routers/clientes/router.py mediante PUT /api/clients/{client_id}.
 * No modifica: datos personales, facturación, tickets ni comunicaciones; solo configuración de servicio.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader, Save, X } from "lucide-react";

export default function ClientServiceEditor({ clientId, api, token, onSave, onCancel }) {
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar datos iniciales
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
          monitoring_equipment_id: client.monitoring_equipment_id || "",
          antenna_type: client.antenna_type || "",
          management_ip: client.management_ip || "",
        });

        setPlans(plansRes.data || []);
        setRouters(routersRes.data || []);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validaciones básicas
      if (!formData.plan_id) {
        throw new Error("Selecciona un plan.");
      }
      if (!formData.router_id) {
        throw new Error("Selecciona un MikroTik.");
      }
      if (!formData.technology) {
        throw new Error("Selecciona la tecnología (Fibra u Inalámbrico).");
      }

      // Validaciones por tipo de conexión
      if (formData.technology === "fiber") {
        if (!formData.zone_id) {
          throw new Error("Selecciona una zona para fibra.");
        }
        if (!formData.nap_box_id) {
          throw new Error("Selecciona una caja NAP.");
        }
        if (!formData.nap_port) {
          throw new Error("Selecciona un puerto NAP.");
        }

        // Validar tipo de conexión
        if (formData.connection_type === "PPPoE") {
          if (!formData.pppoe_user) {
            throw new Error("Ingresa usuario PPPoE.");
          }
        } else if (formData.connection_type !== "PPPoE") {
          if (!formData.ipv4_network_id) {
            throw new Error("Selecciona una red IPv4.");
          }
          if (!formData.ip_address) {
            throw new Error("Ingresa la IP del cliente.");
          }
        }
      } else {
        // Inalámbrico
        if (!formData.monitoring_equipment_id) {
          throw new Error("Selecciona un equipo de monitoreo.");
        }
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
        monitoring_equipment_id: formData.monitoring_equipment_id || null,
        antenna_type: formData.antenna_type || null,
        management_ip: formData.management_ip || null,
      };

      await axios.put(`${api}/clients/${clientId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Servicio del cliente actualizado correctamente.");
      setTimeout(() => {
        if (onSave) onSave();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Error al guardar los cambios.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-8 text-center">
        <Loader className="mx-auto mb-3 h-5 w-5 animate-spin text-cyan-300" />
        <p className="text-slate-400">Cargando datos de servicio…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plan y Router */}
        <div>
          <h3 className="mb-3 text-base font-bold text-white">Configuración básica</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="plan_id"
              value={formData.plan_id}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">-- Selecciona un plan --</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name} - S/. {plan.price}</option>
              ))}
            </select>

            <select
              name="router_id"
              value={formData.router_id}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">-- Selecciona un MikroTik --</option>
              {routers.map(router => (
                <option key={router.id} value={router.id}>{router.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tecnología */}
        <div>
          <h3 className="mb-3 text-base font-bold text-white">Tecnología</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              required
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="fiber">Fibra óptica</option>
              <option value="wireless">Inalámbrico</option>
            </select>
          </div>
        </div>

        {/* Tipo de conexión (solo para fibra) */}
        {formData.technology === "fiber" && (
          <div>
            <h3 className="mb-3 text-base font-bold text-white">Tipo de conexión</h3>
            <select
              name="connection_type"
              value={formData.connection_type}
              onChange={handleChange}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="PPPoE">PPPoE</option>
              <option value="IP Estática">IP Estática</option>
              <option value="DHCP">DHCP</option>
            </select>
          </div>
        )}

        {/* Red IPv4 e IP (si no es PPPoE) */}
        {formData.technology === "fiber" && formData.connection_type !== "PPPoE" && (
          <div>
            <h3 className="mb-3 text-base font-bold text-white">Red y dirección IP</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="ipv4_network_id"
                value={formData.ipv4_network_id}
                onChange={handleChange}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Selecciona una red --</option>
                {ipv4Networks.map(net => (
                  <option key={net.id} value={net.id}>{net.name} ({net.cidr})</option>
                ))}
              </select>

              <input
                type="text"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleChange}
                placeholder="IP del cliente (ej: 192.168.1.10)"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* PPPoE (si está seleccionado) */}
        {formData.technology === "fiber" && formData.connection_type === "PPPoE" && (
          <div>
            <h3 className="mb-3 text-base font-bold text-white">Credenciales PPPoE</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                name="pppoe_user"
                value={formData.pppoe_user}
                onChange={handleChange}
                placeholder="Usuario PPPoE"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="password"
                name="pppoe_password"
                value={formData.pppoe_password}
                onChange={handleChange}
                placeholder="Contraseña PPPoE"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Fibra */}
        {formData.technology === "fiber" && (
          <div>
            <h3 className="mb-3 text-base font-bold text-white">Instalación de fibra</h3>
            <div className="space-y-3">
              <select
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Selecciona una zona --</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>

              <select
                name="nap_box_id"
                value={formData.nap_box_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Selecciona una caja NAP --</option>
                {napBoxes.filter(nap => nap.zone_id === formData.zone_id).map(nap => (
                  <option key={nap.id} value={nap.id}>{nap.name} ({nap.ports} puertos)</option>
                ))}
              </select>

              <input
                type="number"
                name="nap_port"
                value={formData.nap_port}
                onChange={handleChange}
                placeholder="Puerto NAP (1-N)"
                min="1"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />

              <input
                type="text"
                name="onu_sn"
                value={formData.onu_sn}
                onChange={handleChange}
                placeholder="Serie ONU (opcional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Inalámbrico */}
        {formData.technology === "wireless" && (
          <div>
            <h3 className="mb-3 text-base font-bold text-white">Instalación inalámbrica</h3>
            <div className="space-y-3">
              <select
                name="monitoring_equipment_id"
                value={formData.monitoring_equipment_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Selecciona un equipo --</option>
                {monitoringEquipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>

              <input
                type="text"
                name="antenna_type"
                value={formData.antenna_type}
                onChange={handleChange}
                placeholder="Tipo de antena (opcional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />

              <input
                type="text"
                name="management_ip"
                value={formData.management_ip}
                onChange={handleChange}
                placeholder="IP de administración (opcional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
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
    </div>
  );
}
