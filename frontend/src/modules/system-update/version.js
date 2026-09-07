/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.12, editor de resumen del cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.12";
export const CHANGELOG = [
  { type: "Nuevo", text: "Se agrega editor de Resumen en la ficha del cliente: datos personales, contacto, dirección, zona y coordenadas GPS." },
  { type: "Mejora", text: "Botón Editar visible en la pestaña Resumen para activar el modo de edición sin recargar la ficha." },
  { type: "Corrección", text: "Validación de coordenadas GPS y sincronización automática después de guardar cambios." }
];
