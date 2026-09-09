/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.11: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.11";
export const CHANGELOG = [
  { type: "Clientes", text: "Se agrega el submenú y pantalla de Instalaciones." },
  { type: "Instalaciones", text: "Incluye búsqueda y filtros de fechas sobre los clientes registrados." },
];
