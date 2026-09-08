/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.25, corrige disponibilidad IPv4 y consolida Servicio.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.25";
export const CHANGELOG = [
  { type: "Corrección", text: "El inventario y el selector de Servicio calculan las IPs libres con el mismo criterio de red, gateway y broadcast." },
  { type: "Mejora", text: "Servicio muestra solo IPs disponibles de la red elegida y conserva la IP actual del cliente." },
  { type: "Mejora", text: "La caja NAP muestra únicamente puertos libres al editar un abonado." },
  { type: "Registro", text: "Se puede guardar manualmente la potencia óptica inicial de la ONU en dBm." }
];
