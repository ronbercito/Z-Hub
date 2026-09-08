/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.20, corrección de guardado de ficha de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.20";
export const CHANGELOG = [
  { type: "Corrección", text: "Resumen ahora guarda datos personales sin modificar el plan, router ni servicio del cliente." },
  { type: "Corrección", text: "Servicio guarda su configuración técnica mediante una ruta aislada y validada." },
  { type: "Estabilidad", text: "Se evita que el panel quede vacío al guardar datos de la ficha del cliente." }
];
