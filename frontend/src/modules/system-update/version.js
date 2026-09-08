/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.76, resumen autoritativo antes de eliminar clientes.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.76";
export const CHANGELOG = [
  { type: "Corrección", text: "La ventana de eliminación obtiene del backend un resumen autoritativo del cliente antes de mostrar la confirmación." },
  { type: "Corrección", text: "La alerta muestra el nombre real del cliente y todos sus servicios, incluyendo el principal y los adicionales con su plan." },
  { type: "Corrección", text: "La alerta muestra la cantidad real de facturas pendientes y el saldo pendiente calculado con pagos registrados." },
  { type: "Seguridad", text: "Si no se puede verificar el resumen de servicios y facturación, la eliminación se cancela por seguridad." },
  { type: "Corrección", text: "La eliminación continúa utilizando el modal propio de MikroHub y no los diálogos nativos del navegador." },
  { type: "Corrección", text: "La potencia óptica de fibra continúa normalizándose a dBm negativo al guardar; por ejemplo, 14 se almacena como -14 dBm." },
];
