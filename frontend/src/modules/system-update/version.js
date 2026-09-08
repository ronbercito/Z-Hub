/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.48, navegación desde el minimapa y selector mapa/satélite.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.48";
export const CHANGELOG = [
  { type: "Mejora", text: "El minimapa permite alternar entre modo Mapa y Satélite, iniciando siempre en modo Mapa." },
  { type: "Mejora", text: "Se agregó el botón Cómo llegar para abrir la ruta de la ubicación en Google Maps; en celulares se entrega al sistema para abrir la aplicación de mapas cuando está disponible." },
];
