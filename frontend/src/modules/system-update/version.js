/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.83, restauración confirmada del aviso funcional de eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.83";
export const CHANGELOG = [
  { type: "Corrección", text: "Se mantiene restaurado el aviso anterior de eliminación, que muestra servicios, facturas y saldo reales." },
  { type: "Corrección", text: "La confirmación de eliminación conserva el comportamiento probado que informa correctamente las dependencias del cliente." },
];
