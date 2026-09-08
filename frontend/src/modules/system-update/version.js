/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.70, confirmación reforzada al eliminar clientes con múltiples servicios y deuda.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.70";
export const CHANGELOG = [
  { type: "Seguridad", text: "La eliminación definitiva de un cliente ahora verifica sus servicios y facturación antes de ejecutar la operación." },
  { type: "Seguridad", text: "Si el cliente tiene más de un servicio y facturas pendientes, se muestra una alerta detallada con servicios, facturas y saldo pendiente." },
  { type: "Seguridad", text: "En la alerta reforzada se debe escribir SI para continuar o NO para cancelar; cualquier otra respuesta cancela la eliminación." },
  { type: "Seguridad", text: "Si no se puede verificar la información del cliente antes de eliminarlo, la operación se cancela por seguridad." },
  { type: "Corrección", text: "La potencia óptica de los servicios de fibra se normaliza automáticamente a dBm negativo al guardar; por ejemplo, 14 se guarda como -14 dBm." },
  { type: "Mejora", text: "Se mantienen los valores que ya vienen expresados en negativo y se aplican los umbrales visuales de potencia óptica." },
];
