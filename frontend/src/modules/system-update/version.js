/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.3.
 * Función: define la versión y changelog que el frontend muestra y que el backend
 *          compara entre el panel instalado y la versión publicada.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y por
 *         backend/app/modules/system_update/router.py mediante Git.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.3";
export const CHANGELOG = [
  { type: "Mejora", text: "La ventana de actualizaciones muestra solo versiones y cambios comprensibles." },
  { type: "Corrección", text: "Se ocultaron identificadores técnicos internos de Git en el panel." }
];
