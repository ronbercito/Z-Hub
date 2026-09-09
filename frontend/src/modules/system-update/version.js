/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.68: versión junto al control global de actualizaciones.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.68";
export const CHANGELOG = [
  { type: "Interfaz", text: "La versión instalada ahora aparece en la barra superior, justo antes del botón global de actualizaciones con ícono de descarga." },
  { type: "Orden", text: "Se retiró la versión duplicada del encabezado del Dashboard." },
  { type: "Temas", text: "El indicador tiene estilo compatible con Claro Suave y tema oscuro." },
  { type: "Validación", text: "Revisión estática completada sobre ubicación superior, orden de controles y ausencia de duplicado." },
];
