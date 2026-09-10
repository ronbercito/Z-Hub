/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.22.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.22";
export const CHANGELOG = [
  { type: "Instalaciones", text: "El botón Nueva instalación se movió a la misma franja de búsqueda y filtros para aprovechar mejor el espacio superior." },
  { type: "Interfaz", text: "Nueva instalación conserva su color azul/cian y ahora tiene mayor presencia visual sin aumentar demasiado su tamaño." },
  { type: "Legibilidad", text: "Los títulos, encabezados y datos de instalaciones registradas y pendientes usan mayor tamaño y peso para facilitar la lectura." },
  { type: "Compatibilidad", text: "No se modifican API, base de datos, alta de abonados, ficha de cliente, facturación ni aprovisionamiento." },
  { type: "Seguridad", text: "Se respaldaron Installations.jsx y version.js de 1.2.21 en docs/backups/1.2.21/." },
];
