/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.22: hover transparente con marco azul para menú claro.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.22";
export const CHANGELOG = [
  { type: "Apariencia", text: "El hover del menú lateral claro deja de usar una barra gris oscura que dificulta la lectura." },
  { type: "Navegación", text: "Al pasar el mouse, cada opción conserva fondo transparente con una carga azul translúcida y marco azul sutil." },
  { type: "Tipografía", text: "La opción bajo el cursor mantiene texto azul oscuro y peso 900 para distinguirse claramente." },
  { type: "Submenús", text: "El mismo tratamiento de hover se aplica a los submenús del template zhub-light." },
  { type: "Compatibilidad", text: "El ajuste se limita al template zhub-light y no modifica rutas, permisos ni lógica de navegación." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente hover de menú y submenús en el panel desplegado." },
];
