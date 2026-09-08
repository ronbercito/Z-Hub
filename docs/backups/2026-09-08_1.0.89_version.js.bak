/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.89, feedback visual de comprobación.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.89";
export const CHANGELOG = [
  { type: "Interfaz", text: "El botón Comprobar muestra inmediatamente que la búsqueda de actualizaciones está en curso." },
  { type: "Interfaz", text: "Durante la comprobación se muestra giro, pulso, resplandor y puntos animados para dar feedback visual claro." },
  { type: "Interfaz", text: "La ventana indica explícitamente que está consultando el servidor y bloquea comprobaciones repetidas mientras espera la respuesta." },
  { type: "Interfaz", text: "La versión del panel continúa administrada desde una única fuente de verdad: frontend/src/modules/system-update/version.js." },
];
