/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.67: sondeo silencioso y progreso claro legible.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.67";
export const CHANGELOG = [
  { type: "Actualizaciones", text: "Durante la instalación, el panel consulta el progreso en segundo plano sin activar ni vaciar el botón Comprobar." },
  { type: "Tema claro", text: "El progreso de instalación, sus textos y controles tienen contraste reforzado en Claro Suave." },
  { type: "Compatibilidad", text: "La consulta manual sigue mostrando su estado; no se modifican descarga, instalación, sesión ni API." },
  { type: "Validación", text: "Revisión estática completada sobre sondeo silencioso, activación manual, contraste y rutas del sistema." },
];
