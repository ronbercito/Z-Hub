/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.95, arquitectura modular de Facturación del cliente.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.95";
export const CHANGELOG = [
  { type: "Arquitectura", text: "Facturación del cliente queda dividida en controlador, tabla, filtros, acciones y utilidades dentro de clientes/editor/billing/." },
  { type: "Estabilidad", text: "Se mantiene ErrorBoundary exclusivo de Facturación para contener errores de renderizado sin sacar de servicio el resto de la ficha del cliente." },
  { type: "Ordenamiento", text: "Recibo, Servicio, Período, Monto, Vencimiento y Estado se ordenan desde ClientBillingTable sin manipulación directa del DOM." },
  { type: "Mantenimiento", text: "Se conserva la lógica existente de facturas, pagos, transacciones, saldos, configuración, edición, eliminación, anulación y envío; no hay cambios de API ni base de datos." },
  { type: "Respaldo", text: "Se mantiene la rama backup/pre-facturacion-aislada-2026-09-08 hasta completar la validación del build y del flujo en producción." },
  { type: "Validación", text: "1.0.95 debe validarse mediante el Actualizador del panel antes de considerarse finalizada." },
];
