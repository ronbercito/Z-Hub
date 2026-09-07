/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.12, pestaña Resumen completamente editable.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.12";
export const CHANGELOG = [
  { type: "Nuevo", text: "Pestaña Resumen completamente editable: modifica datos personales, contacto, dirección, zona y coordenadas GPS directamente." },
  { type: "Mejora", text: "Formulario integrado en la pestaña sin necesidad de activar modo edición; cambios se guardan al presionar 'Guardar cambios'." },
  { type: "Corrección", text: "Validación de coordenadas GPS y sincronización automática después de guardar." }
];
