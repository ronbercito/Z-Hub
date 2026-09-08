/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.82, restauración del aviso anterior de eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.82";
export const CHANGELOG = [
  { type: "Corrección", text: "Se restauró la alerta anterior de eliminación, que ya mostraba servicios, facturas y saldo reales." },
  { type: "Corrección", text: "Se retiró el recuadro nuevo que mostraba datos vacíos." },
];
