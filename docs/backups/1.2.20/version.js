/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.20.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.20";
export const CHANGELOG = [
  { type: "Clientes", text: "El encabezado del módulo ahora muestra Control de Clientes." },
  { type: "Clientes", text: "Se retiró el botón Nuevo Abonado de la vista principal; el alta oficial continúa disponible desde Instalaciones mediante Dar de alta cliente." },
  { type: "Clientes", text: "Se retiró el botón de edición con icono de lápiz de la tabla de clientes." },
  { type: "Tema claro", text: "La vista Clientes recibe encabezado, filtros, tabla y acciones con colores más vivos y mejor contraste, sin modificar el tema oscuro." },
  { type: "Compatibilidad", text: "No se modifican ClientRegistrationWizard, ficha del cliente, backend, base de datos, facturación ni aprovisionamiento." },
  { type: "Seguridad", text: "Se respaldaron Clients.jsx y version.js de 1.2.19 en docs/backups/1.2.19/." },
];
