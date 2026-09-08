/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.59, sincronización de recursos IPv4 y NAP.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.59";
export const CHANGELOG = [
  { type: "Corrección", text: "Al eliminar un abonado, sus IP y puertos NAP dejan de aparecer como ocupados en el inventario." },
  { type: "Mejora", text: "La disponibilidad de IP y NAP considera tanto el servicio principal como los servicios adicionales activos del abonado." },
  { type: "Corrección", text: "Los registros de servicios adicionales sin cliente ya no reservan recursos para nuevos abonados." },
];
