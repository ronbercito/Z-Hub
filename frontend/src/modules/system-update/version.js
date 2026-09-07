/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.2 de prueba.
 * Función: define la versión y changelog que el frontend muestra y que el backend
 *          compara entre el commit instalado y origin/main.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y por
 *         backend/app/modules/system_update/router.py mediante Git.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.2";
export const CHANGELOG = [
  { type: "Prueba", text: "Actualización de verificación para confirmar la detección e instalación desde el panel." },
  { type: "Mejora", text: "Se documentó el origen y destino de esta configuración de versión." }
];
