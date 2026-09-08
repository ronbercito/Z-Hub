/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.44, disponibilidad real de IP y puertos NAP.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.44";
export const CHANGELOG = [
  { type: "Corrección", text: "Al crear un servicio nuevo, las IP ya ocupadas por clientes o servicios adicionales ya no aparecen como disponibles." },
  { type: "Corrección", text: "Los puertos NAP ocupados por clientes o servicios adicionales ya no aparecen en el selector de un servicio nuevo." },
  { type: "Mejora", text: "Al editar un servicio se conserva su IP y puerto NAP actuales aunque estén ocupados por ese mismo servicio." },
];
