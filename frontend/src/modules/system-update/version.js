/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.80, ruta correcta del resumen previo a eliminar cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.80";
export const CHANGELOG = [
  { type: "Corrección", text: "La eliminación conserva la ruta /api correcta al consultar los datos del cliente." },
  { type: "Corrección", text: "El modal vuelve a mostrar nombre, servicios, facturas y saldo reales antes de borrar." },
  { type: "Seguridad", text: "Si no se obtiene el resumen del cliente, la eliminación permanece bloqueada." },
];
