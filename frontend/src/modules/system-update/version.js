/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.10, corrección de pestañas de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.10";
export const CHANGELOG = [
  { type: "Corrección", text: "Se corrigió la pantalla vacía al abrir Email y SMS o Documentos en la ficha del cliente." },
  { type: "Mejora", text: "Las pestañas de comunicaciones y documentos cargan sus formularios vinculados al cliente." }
];
