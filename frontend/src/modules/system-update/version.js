/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.49, fecha de instalación en el listado de abonados.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.49";
export const CHANGELOG = [
  { type: "Mejora", text: "La columna Caja NAP / Potencia del listado de abonados ahora muestra Fecha de instalación." },
  { type: "Mejora", text: "La fecha se presenta en formato local de Perú y muestra un guion cuando el cliente no tiene fecha registrada." },
];
