/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.78: icono explícito de servidor MikroTik.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.78";
export const CHANGELOG = [
  { type: "Routers", text: "El icono del MikroTik se reemplazó por un servidor con engranaje de trazo azul fijo." },
  { type: "Compatibilidad", text: "No cambian tamaños, datos, permisos ni acciones." },
];
