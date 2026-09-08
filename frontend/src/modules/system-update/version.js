/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.58, corrección final de compilación de facturación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.58";
export const CHANGELOG = [
  { type: "Corrección", text: "Se cierra correctamente el campo Recordatorio #3 en ClientBilling.jsx para eliminar el error de compilación JSX." },
  { type: "Corrección", text: "La facturación del cliente conserva las facturas, pagos, transacciones, saldos y configuración ligados a sus servicios." },
];
