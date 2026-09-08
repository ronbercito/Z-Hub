/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.81, confirmación de eliminación desde el módulo Clientes.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.81";
export const CHANGELOG = [
  { type: "Corrección", text: "La eliminación ahora consulta el resumen desde Clientes, con el ID real que se va a borrar." },
  { type: "Corrección", text: "El modal muestra los servicios, facturas y saldo antes de enviar el DELETE." },
  { type: "Seguridad", text: "Si el resumen no responde, no se habilita la eliminación." },
];
