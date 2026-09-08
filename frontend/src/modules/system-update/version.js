/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.61, eliminación controlada de servicios y facturas pendientes.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.61";
export const CHANGELOG = [
  { type: "Mejora", text: "Al eliminar un servicio adicional, primero se verifica si tiene facturas pendientes asociadas." },
  { type: "Corrección", text: "Las facturas pendientes no pagadas del servicio se eliminan junto con el servicio cuando el operador confirma la advertencia." },
  { type: "Seguridad", text: "Las facturas pagadas nunca se eliminan automáticamente al retirar un servicio." },
];
