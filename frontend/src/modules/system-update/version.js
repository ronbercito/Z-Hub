/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.72: métricas y edición integradas en Routers MikroTik.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.72";
export const CHANGELOG = [
  { type: "Routers", text: "CPU, memoria, uptime, latencia, PPPoE activos y colas se integran dentro de la tarjeta del MikroTik seleccionado." },
  { type: "Edición", text: "La tarjeta incluye el botón Editar router, visible únicamente para cuentas con permiso de edición de red." },
  { type: "Diseño", text: "La tarjeta seleccionada ocupa el ancho del módulo; las pestañas en vivo quedan debajo y ya no repiten indicadores." },
  { type: "Compatibilidad", text: "No cambian lecturas RouterOS, API, permisos de backend, OLT ni acciones existentes." },
  { type: "Validación", text: "Revisión estática completada sobre métricas, permiso de edición, formulario, geometría y ausencia de duplicados." },
];
