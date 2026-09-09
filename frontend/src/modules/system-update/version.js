/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.69: estado Buscando visible en tema claro.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.69";
export const CHANGELOG = [
  { type: "Tema claro", text: "El botón Comprobar muestra un fondo azul y el texto Buscando actualización con contraste mientras consulta." },
  { type: "Interfaz", text: "Al terminar la consulta, el botón vuelve a su estilo claro normal." },
  { type: "Compatibilidad", text: "No se modifica el sondeo silencioso de instalación, descarga, sesión ni API." },
  { type: "Validación", text: "Revisión estática completada sobre el estado aria-busy, texto, ícono y colores del botón." },
];
