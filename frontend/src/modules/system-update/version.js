/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.74: memoria visible en tarjeta MikroTik.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.74";
export const CHANGELOG = [
  { type: "Routers", text: "La tarjeta MikroTik ahora muestra CPU, Memoria y Ping en su resumen inferior." },
  { type: "Diseño", text: "El resumen usa tres columnas compactas y conserva el tamaño de tarjeta de 290 px." },
  { type: "Compatibilidad", text: "En OLT se conserva la distribución de dos indicadores; no cambian permisos ni acciones." },
  { type: "Validación", text: "Revisión estática completada sobre el icono, dato de memoria, columnas y ancho." },
];
