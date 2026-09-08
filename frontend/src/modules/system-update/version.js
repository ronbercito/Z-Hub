/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.86, fuente única de versión del panel.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.86";
export const CHANGELOG = [
  { type: "Arquitectura", text: "La versión del panel queda administrada desde una única fuente de verdad: frontend/src/modules/system-update/version.js." },
  { type: "Mantenimiento", text: "Los consumidores de versión deben consultar PANEL_VERSION y CHANGELOG desde este archivo, evitando números de versión duplicados." },
  { type: "Seguridad", text: "Se conserva un backup de version.js anterior a este cambio para facilitar la recuperación si la actualización presenta problemas." },
];
