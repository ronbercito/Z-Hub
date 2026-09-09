/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.70: inicio de sesión adaptado al tema seleccionado.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.70";
export const CHANGELOG = [
  { type: "Tema claro", text: "La pantalla de inicio de sesión usa ahora fondo luminoso, tarjeta blanca y campos legibles en Claro Suave." },
  { type: "Tema oscuro", text: "Oscuro conserva su presentación actual; ambos temas mantienen la misma distribución de inicio de sesión." },
  { type: "Compatibilidad", text: "No se modifican credenciales, roles, API, sesión, redirecciones ni acceso." },
  { type: "Validación", text: "Revisión estática completada sobre aplicación del tema guardado, estructura visual y llamada de autenticación." },
];
