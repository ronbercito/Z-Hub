/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.19: resaltado de navegación activa.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.19";
export const CHANGELOG = [
  { type: "Apariencia", text: "El menú principal activo ahora usa negrita para resaltar claramente la sección seleccionada." },
  { type: "Navegación", text: "Los submenús activos también se muestran en negrita sin cambiar la lógica de navegación." },
  { type: "Interfaz", text: "Los estados no activos conservan su peso visual anterior para mantener la jerarquía." },
  { type: "Compatibilidad", text: "El cambio se limita al componente Sidebar y no modifica rutas, permisos ni datos." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente el menú desplegado." },
];
