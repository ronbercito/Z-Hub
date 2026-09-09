/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.81: registro de licencias privado y editable fuera del webroot.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.81";
export const CHANGELOG = [
  { type: "Licencia", text: "El registro temporal usa una lista sencilla de licencias activas y desactivables." },
  { type: "Seguridad", text: "El registro de licencias se copia al almacenamiento privado del servidor y no se publica con el panel." },
  { type: "Configuración", text: "Se mantiene el asistente inicial para activar la licencia y crear el administrador." },
  { type: "Seguridad", text: "Las instalaciones nuevas ya no crean ni muestran credenciales administrativas predeterminadas." },
  { type: "Routers", text: "El resumen ahora muestra clientes de colas simples, DHCP, PPPoE y suspendidos." },
  { type: "Datos reales", text: "Las tres primeras cifras se leen del MikroTik y los suspendidos del panel." },
];
