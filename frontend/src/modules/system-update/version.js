/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.4, corrección de recarga repetida.
 * Función: define la versión y changelog que el frontend muestra y que el backend
 *          compara entre el panel instalado y la versión publicada.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y por
 *         backend/app/modules/system_update/router.py mediante Git.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.4";
export const CHANGELOG = [
  { type: "Corrección", text: "El panel ya no se recarga repetidamente después de terminar una actualización." },
  { type: "Mejora", text: "La recarga final solo ocurre una vez y únicamente para la actualización iniciada desde el panel." }
];
