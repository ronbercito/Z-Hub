/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.36, aprovisionamiento real de servicios adicionales y consulta de potencia óptica.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.36";
export const CHANGELOG = [
  { type: "Mejora", text: "Los servicios adicionales ahora también se crean y actualizan en el MikroTik seleccionado." },
  { type: "Mejora", text: "Los servicios de fibra pueden consultar y guardar la potencia óptica de su ONU de forma independiente." },
];
