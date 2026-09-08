/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.60, ciclo completo de recursos del abonado.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.60";
export const CHANGELOG = [
  { type: "Corrección", text: "Al eliminar un abonado, también se eliminan sus servicios adicionales y se liberan sus IP y puertos NAP." },
  { type: "Mejora", text: "La disponibilidad de IP y NAP considera el servicio principal y los servicios adicionales activos." },
  { type: "Corrección", text: "Los servicios adicionales sin cliente ya no pueden mantener ocupados recursos para nuevos registros." },
];
