/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.68, sincronización del saldo al modificar facturas.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.68";
export const CHANGELOG = [
  { type: "Corrección", text: "Al eliminar una factura pendiente desde la ficha del cliente, se recalculan inmediatamente el número de facturas por cobrar y el saldo total del cliente." },
  { type: "Corrección", text: "Al editar el monto de una factura pendiente, el resumen del cliente ahora refleja el nuevo saldo real." },
  { type: "Mejora", text: "El recálculo del saldo se realiza desde las facturas reales del cliente para evitar que el resumen quede desfasado." },
  { type: "Mejora", text: "La pestaña Facturación dentro de la ficha del cliente ofrece las mismas acciones de factura que Facturación principal." },
  { type: "Seguridad", text: "Las facturas pagadas o con pagos registrados mantienen la protección contra edición, eliminación y anulación." },
];
