/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.26: lectura reforzada del Resumen del sistema.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.26";
export const CHANGELOG = [
  { type: "Dashboard", text: "El Resumen del sistema incorpora letras azul tinta más claras y con mayor peso visual." },
  { type: "Indicadores", text: "Los contadores circulares ahora muestran números más oscuros, gruesos y notorios." },
  { type: "Compatibilidad", text: "El ajuste es visual y exclusivo de zhub-light; no modifica datos, rutas, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
