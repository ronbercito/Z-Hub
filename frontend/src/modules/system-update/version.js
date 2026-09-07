/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.9, editor de comunicaciones y documentos.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe: no recibe datos; es leído por UpdateCenter.jsx y system_update/router.py.
 * Entrega: PANEL_VERSION y CHANGELOG al centro de actualizaciones.
 */
export const PANEL_VERSION = "1.0.9";
export const CHANGELOG = [
  { type: "Nueva herramienta", text: "La ficha del cliente ahora permite registrar comunicaciones Email, SMS, WhatsApp y notas internas." },
  { type: "Nueva herramienta", text: "Se pueden adjuntar, descargar y eliminar documentos del expediente de cada cliente." },
  { type: "Mejora", text: "Las comunicaciones y documentos quedan vinculados al cliente y al usuario que realizó la acción." }
];
