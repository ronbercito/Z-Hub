/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.65: ventana de actualizaciones adaptada a Claro Suave.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.65";
export const CHANGELOG = [
  { type: "Tema claro", text: "La ventana de actualizaciones ahora usa fondo blanco, bordes azules y tipografía oscura legible en Claro Suave." },
  { type: "Interfaz", text: "Los avisos de estado, changelog y botones Comprobar/Actualizar tienen contraste y colores propios del tema claro." },
  { type: "Compatibilidad", text: "El tema oscuro mantiene su presentación actual y no se altera la comprobación ni la instalación de actualizaciones." },
  { type: "Validación", text: "Revisión estática completada sobre modal, selectores de Claro Suave y rutas del sistema de actualización." },
];
