/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.11, recuperación segura de la ficha de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.11";
export const CHANGELOG = [
  { type: "Corrección", text: "Se evita la pantalla vacía al abrir Email y SMS o Documentos en la ficha del cliente." },
  { type: "Estado", text: "Los editores de comunicaciones y documentos quedan temporalmente en revisión, sin afectar los demás datos del cliente." }
];
