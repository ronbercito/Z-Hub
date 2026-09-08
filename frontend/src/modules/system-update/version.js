/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.31, mejora visual y selector de routers MikroTik.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.31";
export const CHANGELOG = [
  { type: "Mejora", text: "Se ordenó el formulario de Servicio por secciones para facilitar la configuración del cliente." },
  { type: "Mejora", text: "El selector de equipo de Servicio ahora muestra únicamente routers MikroTik y oculta las OLT." },
];
