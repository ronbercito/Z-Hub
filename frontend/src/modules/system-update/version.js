/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.45, acceso rápido a IPs de abonados.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.45";
export const CHANGELOG = [
  { type: "Mejora", text: "Las IP de los abonados en el listado ahora se pueden abrir con un clic en una nueva pestaña del navegador." },
  { type: "Mejora", text: "El acceso rápido abre directamente http://IP para facilitar el ingreso al equipo/router del abonado." },
];
