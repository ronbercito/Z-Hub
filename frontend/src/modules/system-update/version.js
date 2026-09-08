/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.41, sincronización de identidad con MikroTik.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.41";
export const CHANGELOG = [
  { type: "Corrección", text: "Al cambiar el nombre o DNI de un cliente desde Resumen, se actualiza la misma cola simple de MikroTik sin crear duplicados." },
  { type: "Mejora", text: "Los servicios adicionales conservan la identificación serv 2, serv 3, etc. y actualizan su comentario con el nuevo nombre y DNI." },
];
