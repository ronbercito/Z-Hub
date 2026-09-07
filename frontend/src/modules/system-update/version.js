/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.5, progreso y cierre de sesión seguro.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.5";
export const CHANGELOG = [
  { type: "Mejora", text: "La actualización muestra una barra de progreso por etapas hasta el 100 %." },
  { type: "Seguridad", text: "Al finalizar, la sesión se cierra para ingresar nuevamente con los cambios aplicados." },
  { type: "Mejora", text: "Antes de actualizar aparece una confirmación clara sobre el cierre de sesión." }
];
