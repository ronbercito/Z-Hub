/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.15 de verificación del flujo de actualización.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.15";
export const CHANGELOG = [
  { type: "Verificación", text: "Actualización de prueba para confirmar la detección, instalación y cierre de sesión desde el panel." },
  { type: "Servicio", text: "Se mantiene la edición de plan, router, conexión y datos técnicos desde la pestaña Servicio." }
];
