/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.33, alineación del formulario inalámbrico con la referencia visual.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.33";
export const CHANGELOG = [
  { type: "Mejora", text: "El formulario de Servicio inalámbrico ahora mantiene la misma distribución de Internet, red e instalación que el diseño de referencia." },
  { type: "Mejora", text: "Los servicios inalámbricos con IP estática ahora muestran la red IPv4 y la IP disponible del cliente." },
];
