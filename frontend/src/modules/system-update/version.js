/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.40, comentarios de servicios adicionales numerados por cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.40";
export const CHANGELOG = [
  { type: "Mejora", text: "Las colas de servicios adicionales ahora identifican el servicio como serv 2, serv 3, etc., junto al nombre y DNI del cliente." },
  { type: "Mejora", text: "Al editar un servicio se conserva su número dentro de los servicios del mismo cliente y se actualiza el comentario de la cola existente." },
];
