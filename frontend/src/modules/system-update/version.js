/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-10 — versión 1.2.16.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.16";
export const CHANGELOG = [
  { type: "Instalaciones", text: "La ventana de nueva instalación ya no cubre ni blanquea la pantalla." },
  { type: "Tema", text: "El contenido del módulo permanece visible alrededor de la ventana en ambos temas." },
];
