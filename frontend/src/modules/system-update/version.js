/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.63, acciones completas de factura.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.63";
export const CHANGELOG = [
  { type: "Mejora", text: "Cada factura ahora dispone de acciones independientes: editar, ver documento, eliminar, anular y enviar." },
  { type: "Seguridad", text: "Las facturas pagadas o con pagos registrados quedan protegidas contra edición, eliminación y anulación." },
  { type: "Mejora", text: "Enviar factura abre una ventana pequeña con opciones de Correo o WhatsApp y prepara el mensaje con los datos del servicio." },
];
