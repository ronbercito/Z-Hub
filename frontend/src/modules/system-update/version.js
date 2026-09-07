/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.13, sistema de actualización mejorado con manejo de errores.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.13";
export const CHANGELOG = [
  { type: "Mejora", text: "Sistema de actualizaciones robusto: valida estado previo, detecta errores y restaura versión anterior si falla." },
  { type: "Nuevo", text: "Logs de error detallados en caso de fallo; no se aplican cambios parciales." },
  { type: "Corrección", text: "Se limpian archivos sin rastrear de directorios no críticos antes de actualizar." }
];
