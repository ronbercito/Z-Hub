/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.39, corrección de edición de colas y comentarios con DNI.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.39";
export const CHANGELOG = [
  { type: "Mejora", text: "Al editar un servicio, ahora se modifica la cola existente en MikroTik en lugar de crear otra." },
  { type: "Mejora", text: "El comentario de la cola ahora muestra nombre del cliente, DNI y plan para identificar mejor el servicio." },
];
