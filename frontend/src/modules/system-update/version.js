/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.29: tablas recientes con tipografía y cobros reforzados.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.29";
export const CHANGELOG = [
  { type: "Dashboard", text: "Las tablas Últimos pagos y Últimos conectados usan letras más gruesas y legibles." },
  { type: "Cobros", text: "Los importes cobrados se destacan con verde más vivo y peso alto." },
  { type: "Compatibilidad", text: "El cambio es visual y exclusivo de zhub-light; no modifica datos, rutas, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
