/**
 * Archivo: frontend/src/modules/clientes/editor/ClientSummaryEditor.jsx
 * Actualización: 2026-09-07 — nuevo editor de resumen para la ficha del cliente.
 * Función: formulario editable para datos personales, contacto, dirección, zona, coordenadas y fecha.
 * Recibe de: ClientDetail.jsx cuando el usuario está en la pestaña "summary" y abre el modo edición.
 * Entrega a: backend/app/routers/clientes/router.py mediante PUT /api/clients/{client_id}.
 * No modifica: los datos de servicio, facturación, tickets ni comunicaciones; solo el resumen del cliente.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader, Save, X } from "lucide-react";

export default function ClientSummaryEditor({ clientId, api, token, onSave, onCancel }) {
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar datos iniciales del cliente y lista de zonas
  useEffect(() => {
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
        
        const client = clientRes.data;
        setFormData({
          full_name: client.full_name || "",
          dni_ruc: client.dni_ruc || "",
          phone: client.phone || "",
          email: client.email || "",
          address: client.address || "",
          reference: client.reference || "",
          installation_date: client.installation_date || "",
          zone_id: client.zone_id || "",
          latitude: client.latitude ? String(client.latitude) : "",
          longitude: client.longitude ? String(client.longitude) : ""
        });
        
        setZones(zonesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || "No se pudieron cargar los datos del cliente.");
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

      setSuccess("Datos del cliente actualizados correctamente.");
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
        <p className="text-slate-400">Cargando datos del cliente…</p>
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
        {/* Identidad */}
        <div>
          <h3 className="mb-3 text-base font-bold text-white">Datos de identidad</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nombre completo o razón social"
              required
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="text"
              name="dni_ruc"
              value={formData.dni_ruc}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Celular / WhatsApp"
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Dirección de instalación"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Referencia (ej: frente a la tienda, después de la casa roja)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
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
              onChange={handleChange}
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
              onChange={handleChange}
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
            onChange={handleChange}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Botones de acción */}
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
