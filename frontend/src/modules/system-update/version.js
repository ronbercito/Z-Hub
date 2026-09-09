/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.30: confirmación visible al actualizar el Dashboard.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.30";
export const CHANGELOG = [
  { type: "Dashboard", text: "El botón Actualizar muestra ahora estado de carga y confirma cuando termina de recargar los datos." },
  { type: "Interfaz", text: "Las recargas automáticas continúan silenciosas; solo la acción manual informa el resultado." },
  { type: "Compatibilidad", text: "No modifica datos, API, rutas, permisos, autenticación ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
