/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-10 — versión 1.2.15.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.15";
export const CHANGELOG = [
  { type: "Instalaciones", text: "Nueva instalación abre un registro inicial con los datos personales y técnicos básicos." },
  { type: "Flujo", text: "Al continuar, se abre Nuevo abonado con los datos ya cargados para completar el alta." },
];
