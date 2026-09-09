/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.27: tipografía de Recaudación Diaria reforzada.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.27";
export const CHANGELOG = [
  { type: "Dashboard", text: "Recaudación Diaria usa una tipografía más gruesa y contrastada en título, leyenda y medidor." },
  { type: "Gráficos", text: "Las escalas del gráfico y los datos de descarga/subida ganan peso visual sin alterar valores." },
  { type: "Compatibilidad", text: "El cambio es visual y exclusivo de zhub-light; no modifica datos, rutas, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
