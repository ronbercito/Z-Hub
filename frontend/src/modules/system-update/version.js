/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-10 — versión 1.2.13: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.13";
export const CHANGELOG = [
  { type: "Actualizaciones", text: "Al finalizar, el panel recarga automáticamente sin cerrar sesión." },
  { type: "Verificación", text: "La recarga espera éxito del servidor y coincidencia de la versión instalada." },
];
