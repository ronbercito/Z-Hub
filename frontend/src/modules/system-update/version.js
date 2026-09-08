/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.79, resumen autoritativo sin caché en la eliminación de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.79";
export const CHANGELOG = [
  { type: "Corrección", text: "La confirmación de eliminación consulta un resumen único y autoritativo desde la base de datos." },
  { type: "Corrección", text: "Se evita que respuestas antiguas del navegador muestren 0 servicios, 0 facturas o saldo S/. 0.00." },
  { type: "Seguridad", text: "Si el resumen no puede obtenerse, la eliminación se cancela y no se envía el DELETE." },
];
