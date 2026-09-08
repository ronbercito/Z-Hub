/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.37, limpieza de servicios en MikroTik y nombres de colas por DNI.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.37";
export const CHANGELOG = [
  { type: "Mejora", text: "Al eliminar un cliente, también se eliminan sus servicios asociados de MikroTik." },
  { type: "Mejora", text: "Las colas de servicios adicionales ahora se identifican con el DNI y la IP del cliente para facilitar su orden." },
];
