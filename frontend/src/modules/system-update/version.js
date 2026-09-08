/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.22, corrección de guardado de ficha de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.20";
export const CHANGELOG = [
  { type: "Corrección", text: "El actualizador valida que exista una versión nueva antes de ofrecer la instalación." },
  { type: "Estabilidad", text: "Se refuerza la descarga de las actualizaciones oficiales del panel." },
  { type: "Sincronización", text: "La ficha y el listado general conservan los cambios del cliente al guardar." }
];
