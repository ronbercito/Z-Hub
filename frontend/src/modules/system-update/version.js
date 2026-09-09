/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.21: menú claro con texto negro/negrita y hover reforzado.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.21";
export const CHANGELOG = [
  { type: "Apariencia", text: "El menú lateral del template Z-Hub Claro usa texto oscuro y negrita para mejorar la lectura." },
  { type: "Navegación", text: "Las opciones normales del menú usan peso 700 y las opciones activas usan peso 900." },
  { type: "Interacción", text: "Al pasar el mouse por una opción del menú, la tipografía aumenta a peso 900 para resaltar claramente la opción bajo el cursor." },
  { type: "Submenús", text: "Los submenús mantienen texto oscuro y se vuelven más gruesos al estar activos o recibir hover." },
  { type: "Compatibilidad", text: "El ajuste visual se aplica al template zhub-light sin modificar rutas, permisos ni lógica de navegación." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente menú, submenús y hover en el panel desplegado." },
];
