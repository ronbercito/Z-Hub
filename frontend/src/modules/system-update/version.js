/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.84, eliminación validada desde Clientes con APIs reales.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.84";
export const CHANGELOG = [
  { type: "Corrección", text: "La eliminación consulta directamente las mismas APIs que muestran Servicios y Facturación." },
  { type: "Corrección", text: "Se eliminó el interceptor global que perdía la ruta /api y mostraba datos vacíos." },
  { type: "Seguridad", text: "Si no se puede verificar la información, el cliente no se elimina." },
];
