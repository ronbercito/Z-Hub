/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.94: changelog exclusivo de la versión disponible.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.1.100";
export const CHANGELOG = [
  { type: "Colas simples", text: "Los límites ahora se muestran en Mbps o Gbps." },
  { type: "Compatibilidad", text: "No cambian las colas ni la configuración del MikroTik." },
];
