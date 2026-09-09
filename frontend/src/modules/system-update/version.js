/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.94: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.1.94";
export const CHANGELOG = [
  { type: "Actualizaciones", text: "La ventana de actualización muestra únicamente el changelog correspondiente a la versión que se está ofreciendo para instalar." },
  { type: "Interfaz", text: "Se eliminan de la ventana los cambios históricos de versiones anteriores para mantener la información de actualización clara y directa." },
  { type: "Compatibilidad", text: "La lógica de comprobación, descarga, instalación, progreso, cierre de sesión y rollback no cambia." },
];
