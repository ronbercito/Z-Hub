/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.7, comprobación automática de prueba.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.7";
export const CHANGELOG = [
  { type: "Prueba", text: "La comprobación automática de actualizaciones vuelve a ejecutarse cada minuto." },
  { type: "Seguridad", text: "La consulta automática no recarga la página ni cierra la sesión." }
];
