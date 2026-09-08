/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.54, actualización con rollback confiable.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.54";
export const CHANGELOG = [
  { type: "Corrección", text: "El rollback de una actualización ahora conserva realmente la versión anterior sin volver a sincronizar origin/main durante la restauración." },
  { type: "Mejora", text: "El instalador conserva las últimas líneas del error para identificar por qué una actualización no pudo completarse." },
  { type: "Mejora", text: "Se mantiene la facturación ligada al cliente y a cada servicio específico." },
];
