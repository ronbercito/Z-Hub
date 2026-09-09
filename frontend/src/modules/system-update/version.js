/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.57: Unificación del layout de Ajustes entre tema oscuro y Claro Suave.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.57";
export const CHANGELOG = [
  { type: "Ajustes", text: "El tema oscuro reutiliza la misma distribución compacta de tarjetas que ya estaba validada en Z-Hub Claro Suave, manteniendo el orden y la geometría del formulario." },
  { type: "Interfaz", text: "La distribución de Ajustes se normaliza en una capa CSS compartida: dos columnas compactas en pantallas amplias, una columna en pantallas menores y botón Guardar al ancho completo." },
  { type: "Compatibilidad", text: "El cambio es exclusivamente visual; conserva colores propios de cada tema y no modifica datos, API, permisos, navegación ni lógica funcional de Ajustes." },
  { type: "Validación", text: "Revisión estática completada: Settings.jsx conserva el mismo DOM y flujo de guardado; el nuevo CSS solo controla distribución y espaciado. Build y validación visual real del servidor quedan pendientes." },
];
