/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.65, diagnóstico mejorado del proceso de actualización.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.65";
export const CHANGELOG = [
  { type: "Mejora", text: "La pestaña Facturación dentro de la ficha del cliente ahora ofrece las mismas acciones de factura que Facturación principal." },
  { type: "Mejora", text: "Cada factura del cliente permite editar, ver documento, eliminar, anular y enviar por Correo o WhatsApp, además de registrar pagos cuando corresponde." },
  { type: "Seguridad", text: "Las facturas pagadas o con pagos registrados mantienen la protección contra edición, eliminación y anulación también desde la ficha del cliente." },
  { type: "Mejora", text: "El actualizador ahora identifica el paso, comando y código que provocan un fallo antes de realizar el rollback." },
  { type: "Mejora", text: "El instalador registra con mayor detalle los errores de backend, frontend, dependencias y servicios para facilitar futuras recuperaciones." },
];
