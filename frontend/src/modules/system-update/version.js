/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.64: tarjetas OLT con geometría común entre temas.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.64";
export const CHANGELOG = [
  { type: "Interfaz", text: "Las tarjetas OLT de Gestión de Red ahora usan la misma geometría en tema claro y oscuro: 380 px en escritorio y ancho completo en móvil." },
  { type: "Temas", text: "Cada tema conserva sus colores, estados, bordes y la visibilidad de la acción Probar conexión CLI; solo se unificó la distribución." },
  { type: "Compatibilidad", text: "No se modifican OLTs, lecturas, comandos, acciones, permisos, rutas, navegación ni API." },
  { type: "Validación", text: "Revisión estática completada: la medida OLT está en RouterCard.jsx y no existe una regla de ancho exclusiva del tema claro." },
];
