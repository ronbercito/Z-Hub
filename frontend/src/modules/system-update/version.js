/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.23.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.23";
export const CHANGELOG = [
  { type: "Instalaciones", text: "Se incorporaron las pestañas Instalaciones y Registrados con contadores independientes." },
  { type: "Flujo", text: "Instalaciones muestra únicamente solicitudes pendientes; al completar el alta del cliente, deja de aparecer allí y queda disponible en Registrados." },
  { type: "Registrados", text: "La segunda pestaña concentra los clientes que ya completaron el alta, con búsqueda, filtros y estado REGISTRADO." },
  { type: "Interfaz", text: "Se aplicó el diseño visual aprobado: pestañas destacadas, encabezado limpio, controles agrupados y estados más claros." },
  { type: "Compatibilidad", text: "Se conserva la API actual, la tabla installations, el puente Dar de alta cliente y el módulo oficial de Nuevo abonado sin modificar sus opciones." },
  { type: "Seguridad", text: "Se respaldaron Installations.jsx y version.js de 1.2.22 en docs/backups/1.2.22/." },
];
