/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.8, resultado de actualización claro.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.8";
export const CHANGELOG = [
  { type: "Corrección", text: "Una actualización anterior completada ya no muestra una barra al existir una versión nueva." },
  { type: "Mejora", text: "El panel indica de forma simple qué versión se instaló correctamente." }
];
