/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.55: Ajustes con tarjetas claras organizadas en dos columnas.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.55";
export const CHANGELOG = [
  { type: "Gestión de red", text: "Las métricas CPU, memoria, uptime, latencia, PPPoE y colas ahora son tarjetas de color sólido." },
  { type: "Interfaz", text: "Cada tarjeta conserva texto e icono blanco, grueso y legible; la tabla permanece clara para operación." },
  { type: "Compatibilidad", text: "El cambio es visual y exclusivo de zhub-light; no modifica RouterOS, OLT, API, datos, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
