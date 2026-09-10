/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.17.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.17";
export const CHANGELOG = [
  { type: "Instalaciones", text: "Nueva instalación ahora se registra como pendiente y ya no abre inmediatamente Nuevo abonado." },
  { type: "Instalaciones", text: "Se agregó botón GPS para completar automáticamente latitud y longitud desde el dispositivo." },
  { type: "Instalaciones", text: "Las solicitudes pendientes se muestran en tarjetas con botón Dar de alta cliente." },
  { type: "Abonados", text: "Dar de alta cliente transfiere los datos capturados al formulario existente de Nuevo abonado sin modificar sus opciones." },
];
