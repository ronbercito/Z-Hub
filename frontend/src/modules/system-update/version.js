/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.6, consulta no intrusiva.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.6";
export const CHANGELOG = [
  { type: "Mejora", text: "Las actualizaciones solo se buscan al iniciar sesión, recargar manualmente o pulsar Comprobar." },
  { type: "Corrección", text: "El panel no realiza consultas periódicas mientras se trabaja en formularios u operaciones." }
];
