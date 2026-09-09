/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.24: tarjetas KPI del Dashboard alineadas con la referencia visual aprobada.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.24";
export const CHANGELOG = [
  { type: "Dashboard", text: "Las cuatro tarjetas KPI ahora conservan fondos completos verde, azul, violeta y azul oscuro en Z-Hub Claro." },
  { type: "Interfaz", text: "Se corrigieron color de letras, pesos, iconos, bordes y contraste para igualar la referencia aprobada." },
  { type: "Compatibilidad", text: "El cambio está aislado al Dashboard de zhub-light y no altera datos, rutas, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
