/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.38, nombres de colas por DNI y señal ONU visible en servicios.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.38";
export const CHANGELOG = [
  { type: "Mejora", text: "Las colas de servicios adicionales ahora se identifican con el DNI, sin mostrar la IP en el nombre." },
  { type: "Mejora", text: "La señal óptica de la ONU ahora se muestra directamente en la fila del servicio." },
];
