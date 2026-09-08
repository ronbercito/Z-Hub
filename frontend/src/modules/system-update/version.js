/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.46, minimapa de ubicación en el listado de abonados.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.46";
export const CHANGELOG = [
  { type: "Mejora", text: "La dirección del abonado ahora funciona como botón de ubicación cuando tiene coordenadas GPS registradas." },
  { type: "Mejora", text: "Al pulsar la dirección se abre un minimapa de Google Maps con la ubicación guardada y sus coordenadas." },
];
