/**
 * Configuración aislada de versión y changelog del panel.
 * Al publicar una actualización, incrementar PATCH: 1.0.0 → 1.0.1.
 */
export const PANEL_VERSION = "1.0.0";
export const CHANGELOG = [
  { type: "Nueva herramienta", text: "Acceso visible al centro de actualizaciones desde la barra superior." },
  { type: "Mejora", text: "Resumen OLT con conteo de ONUs, estado y actividad reciente." },
  { type: "Mejora", text: "Lectura de tráfico uplink en módulo aislado." }
];
