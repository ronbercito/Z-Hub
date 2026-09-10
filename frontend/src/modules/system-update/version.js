/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.18.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.18";
export const CHANGELOG = [
  { type: "Actualización", text: "La comprobación final del backend ahora reintenta hasta 10 veces en lugar de abortar por un único fallo transitorio." },
  { type: "Diagnóstico", text: "Si el backend no responde después de los reintentos, el instalador muestra el estado de Supervisor y las últimas líneas del log de error para identificar la causa real." },
  { type: "Compatibilidad", text: "No se modifican Instalaciones, Abonados, base de datos, facturación ni aprovisionamiento; el cambio está limitado al cierre del instalador." },
];
