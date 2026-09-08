/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.69, normalización y umbrales de potencia óptica.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.69";
export const CHANGELOG = [
  { type: "Corrección", text: "La potencia óptica de los servicios de fibra se normaliza automáticamente a dBm negativo al guardar; por ejemplo, 14 se guarda como -14 dBm." },
  { type: "Mejora", text: "Se mantienen los valores que ya vienen expresados en negativo y no se modifica la potencia cuando queda vacía." },
  { type: "Mejora", text: "Se definen los umbrales de potencia óptica para identificar niveles críticos y de advertencia en los servicios de fibra." },
  { type: "Corrección", text: "Al eliminar una factura pendiente desde la ficha del cliente, se recalculan inmediatamente el número de facturas por cobrar y el saldo total del cliente." },
  { type: "Corrección", text: "Al editar el monto de una factura pendiente, el resumen del cliente ahora refleja el nuevo saldo real." },
  { type: "Seguridad", text: "Las facturas pagadas o con pagos registrados mantienen la protección contra edición, eliminación y anulación." },
];
