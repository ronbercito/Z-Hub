/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.62, borrado integral del cliente y trazabilidad histórica de facturas.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.62";
export const CHANGELOG = [
  { type: "Seguridad", text: "Las facturas pagadas quedan protegidas al eliminar servicios adicionales y no se borran automáticamente." },
  { type: "Mejora", text: "Al eliminar un cliente completo se limpian sus facturas, servicios, tickets, tareas, comunicaciones, documentos e historial asociado." },
  { type: "Mejora", text: "Cada factura conserva la identificación del servicio principal o adicional para reconocer rápidamente a qué cuenta corresponde." },
];
