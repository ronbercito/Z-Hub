/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.87, fuente única de versión del panel.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.87";
export const CHANGELOG = [
  { type: "Interfaz", text: "El botón Comprobar ahora muestra feedback visual inmediato mientras consulta si existe una nueva actualización." },
  { type: "Interfaz", text: "Durante la comprobación, el icono gira, el botón se anima y cambia a 'Buscando actualización…' para confirmar que el clic fue recibido." },
  { type: "Arquitectura", text: "La versión del panel continúa administrada desde una única fuente de verdad: frontend/src/modules/system-update/version.js." },
];
