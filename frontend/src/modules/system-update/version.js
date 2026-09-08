/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.78, confirmación directa con las fuentes reales del cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.78";
export const CHANGELOG = [
  { type: "Corrección", text: "La ventana de eliminación consulta directamente /clients/{id}/services, la misma API usada por la pestaña Servicios." },
  { type: "Corrección", text: "La ventana de eliminación consulta directamente /clients/{id}/invoices, la misma API usada por la ficha de Facturación." },
  { type: "Corrección", text: "La ventana deja de depender del endpoint intermedio deletion-summary para contar servicios y facturas." },
  { type: "Corrección", text: "La alerta muestra el cliente real, todos sus servicios, facturas pendientes y saldo pendiente antes de eliminar." },
  { type: "Seguridad", text: "Si alguna consulta necesaria falla, la eliminación se cancela por seguridad y no se envía el DELETE." },
  { type: "Corrección", text: "La eliminación definitiva mantiene el modal propio de MikroHub y exige escribir SI para continuar." },
];
