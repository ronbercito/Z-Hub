/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.25: contenido del panel ampliado para aprovechar el ancho disponible.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.25";
export const CHANGELOG = [
  { type: "Plantilla", text: "El área principal del panel ahora usa todo el ancho disponible después del menú lateral." },
  { type: "Dashboard", text: "Las tarjetas, gráfico, resumen y tablas se amplían de forma proporcional como la referencia visual." },
  { type: "Compatibilidad", text: "No se modifican datos, API, navegación, permisos, autenticación ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
