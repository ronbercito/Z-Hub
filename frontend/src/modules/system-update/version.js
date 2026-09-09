/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.63: tarjeta MikroTik con geometría común entre temas.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.63";
export const CHANGELOG = [
  { type: "Interfaz", text: "La tarjeta MikroTik de Gestión de Red usa ahora el mismo ancho en los temas claro y oscuro: 290 px en escritorio y ancho completo en móvil." },
  { type: "Temas", text: "Se separó la geometría de los estilos visuales: Claro Suave mantiene su gradiente azul y Oscuro mantiene sus colores cian sobre fondo oscuro." },
  { type: "Compatibilidad", text: "No se modifican equipos, datos, acciones, permisos, rutas, navegación ni API." },
  { type: "Validación", text: "Revisión estática completada: la medida está en RouterCard.jsx y no existen reglas de ancho exclusivas para el tema claro." },
];
