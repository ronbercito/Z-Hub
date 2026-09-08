/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.19, corrección de detección de actualizaciones.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.19";
export const CHANGELOG = [
  { type: "Corrección", text: "La comprobación de actualizaciones solicita siempre el estado más reciente, sin reutilizar resultados guardados." },
  { type: "Mejora", text: "El panel informa claramente si el servidor no logra consultar GitHub." },
  { type: "Documentos", text: "Se mantienen las mejoras recientes de documentos, comunicaciones y facturación de la versión anterior." }
];
