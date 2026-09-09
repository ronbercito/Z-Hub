/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.80: asistente de configuración inicial con licencia y creación segura del administrador.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.80";
export const CHANGELOG = [
  { type: "Seguridad", text: "Las instalaciones nuevas ya no crean ni muestran credenciales administrativas predeterminadas." },
  { type: "Configuración", text: "Se incorpora un asistente inicial para activar la licencia, crear el administrador y finalizar la instalación." },
  { type: "Licencia", text: "La serie se valida temporalmente desde el registro del directorio licencia." },
  { type: "Routers", text: "El resumen ahora muestra clientes de colas simples, DHCP, PPPoE y suspendidos." },
  { type: "Datos reales", text: "Las tres primeras cifras se leen del MikroTik y los suspendidos del panel." },
];
