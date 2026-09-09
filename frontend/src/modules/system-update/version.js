/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.34: tablero OLT adaptado al tema claro con color operativo.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.34";
export const CHANGELOG = [
  { type: "OLT", text: "Resumen, salud, disponibilidad, estado y actividad de OLT se presentan sobre superficies claras." },
  { type: "Interfaz", text: "Las métricas OLT usan acentos verde, turquesa, índigo y ámbar; alertas y estados conservan rojo/verde visibles." },
  { type: "Compatibilidad", text: "No modifica comandos CLI, ONUs, PON, RouterOS, OLT, API, datos, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente y validar lecturas OLT en el panel desplegado." },
];
