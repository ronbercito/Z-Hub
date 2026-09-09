/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.31: controles de Navbar adaptados al tema claro.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.31";
export const CHANGELOG = [
  { type: "Plantilla", text: "Los controles Moneda, notificaciones y perfil de la barra superior se adaptan al tema Z-Hub Claro." },
  { type: "Interfaz", text: "Sus letras usan azul tinta y mayor grosor; se eliminan los fondos oscuros de esos controles." },
  { type: "Compatibilidad", text: "No modifica búsquedas, notificaciones, datos, rutas, permisos, autenticación ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
