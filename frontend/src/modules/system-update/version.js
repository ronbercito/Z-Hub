/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.59: Redes IPv4 y Cajas NAP adaptadas completamente al tema claro.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.59";
export const CHANGELOG = [
  { type: "Tema claro", text: "Los submenús del lateral, incluidos Redes IPv4 y Cajas NAP, recuperan una superficie clara y ya no heredan visualmente el fondo oscuro del tema base." },
  { type: "Interfaz", text: "Se añade una capa visual específica para los submenús de Claro Suave: fondo transparente/claro, hover azul muy suave y estado activo claro, manteniendo la lectura de texto e iconos." },
  { type: "Compatibilidad", text: "El cambio es exclusivamente visual; no modifica rutas, permisos, selección de módulos, navegación, datos, API ni lógica funcional." },
  { type: "Validación", text: "Revisión estática completada sobre Sidebar.jsx y las reglas de tema: Redes IPv4 y Cajas NAP usan el mismo bloque de submenú y quedan cubiertas por la nueva capa. Pendiente validación visual en el panel desplegado." },
];
