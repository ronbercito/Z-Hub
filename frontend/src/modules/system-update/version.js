/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.03: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.04";
export const CHANGELOG = [
  { type: "PPPoE", text: "Se añade búsqueda de secrets por usuario, perfil, IP o comentario." },
  { type: "Compatibilidad", text: "No cambian los secretos ni la configuración del MikroTik." },
];
