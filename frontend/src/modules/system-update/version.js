/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.94: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.1.103";
export const CHANGELOG = [
  { type: "Colas simples", text: "Se añade búsqueda por nombre, comentario o IP." },
  { type: "Compatibilidad", text: "No cambian las colas ni la configuración del MikroTik." },
];
