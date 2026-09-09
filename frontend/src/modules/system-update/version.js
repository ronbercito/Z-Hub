/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.73: resumen compacto de Routers MikroTik.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.73";
export const CHANGELOG = [
  { type: "Routers", text: "La tarjeta MikroTik recupera su tamaño compacto de 290 px en escritorio." },
  { type: "Métricas", text: "CPU, memoria, uptime y latencia pasan debajo de la tarjeta en cuatro recuadros resumidos." },
  { type: "Limpieza", text: "Se retiraron los indicadores PPPoE activos y Colas de esta vista." },
  { type: "Edición", text: "Editar router se conserva dentro de la tarjeta y continúa sujeto al permiso de edición de red." },
  { type: "Compatibilidad", text: "No cambian API, RouterOS, pestañas en vivo, OLT ni permisos de backend." },
  { type: "Validación", text: "Revisión estática completada sobre las cuatro métricas, el tamaño y los permisos." },
];
