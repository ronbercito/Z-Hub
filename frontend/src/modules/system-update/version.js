/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.66: versión alineada junto al botón Actualizar.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.66";
export const CHANGELOG = [
  { type: "Interfaz", text: "La versión instalada queda agrupada y alineada a la izquierda del botón Actualizar, en el extremo derecho del encabezado del Dashboard." },
  { type: "Diseño adaptable", text: "En móvil, la versión y el botón permanecen unidos y alineados sin aparecer al inicio del contenido." },
  { type: "Compatibilidad", text: "La versión sigue tomando PANEL_VERSION; no se modifican las métricas, actualización del Dashboard, datos ni API." },
  { type: "Validación", text: "Revisión estática completada sobre orden, anclaje de escritorio, alineamiento móvil y fuente de versión." },
];
