/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.17 con módulo Email y SMS completo.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.17";
export const CHANGELOG = [
  { type: "Comunicaciones", text: "Nuevo módulo Email y SMS con historial completo de envíos por cliente." },
  { type: "Comunicaciones", text: "Modal para enviar nuevos correos con plantillas (Recordatorio, Factura, Bienvenida)." },
  { type: "Comunicaciones", text: "Modal para enviar SMS/WhatsApp con contador de caracteres (0-900)." },
  { type: "Comunicaciones", text: "Tablas de historial Email y SMS con estado (Enviado/Pendiente) y fecha." },
  { type: "Facturación", text: "Nueva tabla profesional en módulo Facturación (global) y ficha del cliente con pagos inline." },
  { type: "Facturación", text: "Registro de pagos en tiempo real (Yape, Plin, Efectivo, BCP, BBVA) sin recargar página." },
  { type: "Facturación", text: "Filtros por estado (Pagado, Pendiente, Vencido) y búsqueda rápida por recibo/cliente/DNI." },
  { type: "Facturación", text: "Impresión de recibos y vista previa del comprobante de pago desde la tabla." },
  { type: "Clientes", text: "Pestaña Facturación en ficha del cliente muestra historial de facturas y balance debido." },
  { type: "Backend", text: "Nuevos endpoints: /api/clients/{id}/communications, /send-email, /send-sms." },
  { type: "Mejora", text: "KPI visibles: Total Facturado, Total Recaudado, Cuentas por Cobrar." },
  { type: "Mejora", text: "Indicadores visuales (badges) por estado con iconos y colores diferenciados." }
];
