/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.75: edición de router compacta y legible.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.75";
export const CHANGELOG = [
  { type: "Edición", text: "El modal Editar equipo es más compacto y sus textos, etiquetas y campos tienen mayor contraste." },
  { type: "Ubicación", text: "Elegir coordenadas en el mapa ahora usa un botón azul sólido con texto e icono blancos." },
  { type: "Routers", text: "Editar router en la tarjeta usa superficie blanca, texto azul oscuro, borde y sombra para leerse sobre el fondo azul." },
  { type: "Compatibilidad", text: "No cambian coordenadas, mapa, API, datos, permisos, RouterOS, OLT ni guardado." },
  { type: "Validación", text: "Revisión estática completada sobre modal, controles, selector de tema claro y acción de edición." },
];
