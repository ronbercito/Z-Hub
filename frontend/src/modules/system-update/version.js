/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.34, servicios agrupados y edición en ventana emergente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.34";
export const CHANGELOG = [
  { type: "Mejora", text: "Los servicios de Internet de cada cliente ahora se agrupan en una sola lista dentro de la pestaña Servicio." },
  { type: "Mejora", text: "Se puede crear y editar cada servicio desde una ventana emergente, permitiendo varios servicios independientes por cliente." },
];
