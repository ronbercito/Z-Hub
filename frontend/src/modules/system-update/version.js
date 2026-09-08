/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.21, corrección de guardado de ficha de cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.20";
export const CHANGELOG = [
  { type: "Sincronización", text: "Los cambios guardados en Resumen se reflejan de inmediato en el listado general del cliente." },
  { type: "Sincronización", text: "Los cambios técnicos de Servicio actualizan de inmediato plan, router, IP y conexión en el registro general." },
  { type: "Estabilidad", text: "La ficha conserva sus datos personales y técnicos separados al guardar." }
];
