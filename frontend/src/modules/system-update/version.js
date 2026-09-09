/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.28: versión visible junto al botón Actualizar del Dashboard.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.28";
export const CHANGELOG = [
  { type: "Dashboard", text: "La versión instalada del panel se muestra junto al botón Actualizar para facilitar su comprobación." },
  { type: "Interfaz", text: "La etiqueta usa el mismo estilo sobrio y legible del template Z-Hub Claro." },
  { type: "Compatibilidad", text: "La etiqueta toma PANEL_VERSION como fuente única; no modifica actualización, datos, rutas, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
