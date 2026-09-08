/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.32, formulario de Servicio en dos columnas.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.32";
export const CHANGELOG = [
  { type: "Mejora", text: "El formulario de Servicio ahora se organiza en dos columnas para visualizar y configurar los datos de Internet e instalación de forma más clara." },
  { type: "Mejora", text: "La sección de Internet y MikroTik queda separada de la sección de Instalación y tecnología, siguiendo un diseño más ordenado y fácil de usar." },
];
