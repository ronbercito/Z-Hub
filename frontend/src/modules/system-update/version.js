/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.19.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.19";
export const CHANGELOG = [
  { type: "Instalaciones", text: "El selector de ubicación de Nueva instalación ahora reutiliza el mismo minimapa de Google Maps que ya usa Z-Hub en otros módulos." },
  { type: "Ubicación", text: "El operador puede hacer clic en el mapa o arrastrar el marcador y aplicar automáticamente latitud y longitud al registro de instalación." },
  { type: "Compatibilidad", text: "Se elimina la dependencia del permiso GPS del navegador para este flujo; no se modifican Nuevo abonado, ficha del cliente, facturación ni aprovisionamiento." },
  { type: "Seguridad", text: "Se respaldaron NewInstallationModal.jsx y version.js de 1.2.18 en docs/backups/1.2.18/." },
];
