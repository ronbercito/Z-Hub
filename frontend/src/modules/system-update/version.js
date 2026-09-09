/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.76: icono y estado ONLINE reforzados.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.76";
export const CHANGELOG = [
  { type: "Routers", text: "El icono principal del MikroTik usa fondo blanco, borde celeste y sombra para destacar sobre la tarjeta." },
  { type: "Estado", text: "ONLINE ahora usa verde sólido, texto blanco, punto blanco y borde visible." },
  { type: "Tema claro", text: "Los dos elementos conservan contraste alto en Claro Suave." },
  { type: "Compatibilidad", text: "No cambian el tamaño, datos, RouterOS, acciones, permisos, OLT ni API." },
  { type: "Validación", text: "Revisión estática completada sobre icono, estado y estilos de tema." },
];
