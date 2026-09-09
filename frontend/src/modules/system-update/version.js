/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.77: icono MikroTik visible.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.77";
export const CHANGELOG = [
  { type: "Routers", text: "Se corrigió el trazo del icono del servidor MikroTik para que se vea dentro del recuadro blanco." },
  { type: "Compatibilidad", text: "No cambian tamaños, datos, permisos ni acciones." },
];
