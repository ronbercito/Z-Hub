/**
 * Configuración aislada de versión y changelog del panel.
 * Al publicar una actualización, incrementar PATCH: 1.0.1 → 1.0.2.
 */
export const PANEL_VERSION = "1.0.1";
export const CHANGELOG = [
  { type: "Nueva herramienta", text: "Motor de actualizaciones: detecta versiones nuevas, muestra changelog e instala desde el panel." },
  { type: "Mejora", text: "Actualización transaccional con registro de instalación y restauración automática si falla." },
  { type: "Corrección", text: "El centro de actualizaciones ya consulta el estado real del backend." }
];
