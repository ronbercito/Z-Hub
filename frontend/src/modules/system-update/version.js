/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.50, deuda y meses pendientes en el listado de abonados.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.50";
export const CHANGELOG = [
  { type: "Mejora", text: "El listado de abonados vuelve a mostrar la deuda directamente en su columna correspondiente." },
  { type: "Mejora", text: "La deuda muestra al costado un indicador con la cantidad de meses pendientes, según las facturas impagas." },
  { type: "Corrección", text: "Se elimina la fecha de instalación de la tabla principal; continúa disponible en la ficha del cliente." },
];
