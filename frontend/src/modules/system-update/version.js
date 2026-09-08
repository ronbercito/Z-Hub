/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.57, corrección de compilación de facturación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.57";
export const CHANGELOG = [
  { type: "Corrección", text: "Se corrige el encabezado de ClientBilling.jsx para que el frontend vuelva a compilar correctamente." },
  { type: "Corrección", text: "Se conserva la facturación ligada al cliente y a cada servicio específico." },
  { type: "Corrección", text: "El rollback conserva realmente el commit anterior sin volver a sincronizar origin/main." },
  { type: "Mejora", text: "El motivo del fallo de instalación queda visible para facilitar la revisión." },
];
