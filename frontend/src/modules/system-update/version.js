/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.16 con nueva tabla de facturación y pagos inline.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.16";
export const CHANGELOG = [
  { type: "Facturación", text: "Nueva tabla profesional en módulo Facturación (global) y ficha del cliente con pagos inline." },
  { type: "Facturación", text: "Registro de pagos en tiempo real (Yape, Plin, Efectivo, BCP, BBVA) sin recargar página." },
  { type: "Facturación", text: "Filtros por estado (Pagado, Pendiente, Vencido) y búsqueda rápida por recibo/cliente/DNI." },
  { type: "Facturación", text: "Impresión de recibos y vista previa del comprobante de pago desde la tabla." },
  { type: "Clientes", text: "Pestaña Facturación en ficha del cliente muestra su historial de facturas y balance debido." },
  { type: "Backend", text: "Nuevo endpoint GET /api/clients/{id}/invoices para listar facturas filtradas por cliente." },
  { type: "Mejora", text: "KPI visibles: Total Facturado, Total Recaudado, Cuentas por Cobrar." },
  { type: "Mejora", text: "Indicadores visuales (badges) por estado de factura con iconos y colores." }
];
