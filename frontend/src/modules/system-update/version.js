/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.55, diagnóstico visible de actualizaciones.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.55";
export const CHANGELOG = [
  { type: "Corrección", text: "El rollback de una actualización conserva realmente la versión anterior sin volver a sincronizar origin/main." },
  { type: "Mejora", text: "El instalador conserva el detalle del error que provocó el fallo para facilitar la revisión." },
  { type: "Mejora", text: "El centro de actualizaciones muestra el motivo del fallo cuando una instalación debe restaurarse." },
  { type: "Mejora", text: "La facturación continúa ligada al cliente y a cada servicio específico." },
];
