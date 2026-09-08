/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.24, selector de IPs y puertos libres en Servicio.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.24";
export const CHANGELOG = [
  { type: "Mejora", text: "Servicio ahora muestra solo IPs disponibles de la red elegida y conserva la IP actual del cliente." },
  { type: "Mejora", text: "La caja NAP muestra únicamente puertos libres al editar un abonado." },
  { type: "Registro", text: "Se puede guardar manualmente la potencia óptica inicial de la ONU en dBm." }
];
