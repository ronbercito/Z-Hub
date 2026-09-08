/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.35, selección de zona obligatoria antes de cajas NAP.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.35";
export const CHANGELOG = [
  { type: "Mejora", text: "Las cajas NAP ahora se muestran únicamente después de seleccionar una zona." },
  { type: "Mejora", text: "Al cambiar de zona se reinician la caja y el puerto NAP para evitar asignaciones incorrectas." },
];
