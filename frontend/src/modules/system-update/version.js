/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.47, botón Ubicación y minimapa con datos de dirección.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.47";
export const CHANGELOG = [
  { type: "Mejora", text: "En el listado de abonados la dirección ahora se muestra únicamente mediante un botón rectangular Ubicación." },
  { type: "Mejora", text: "El minimapa muestra la ubicación a un lado y, en un panel lateral, la dirección, referencia y coordenadas del abonado." },
];
