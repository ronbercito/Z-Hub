/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.52, configuración de facturación y cobranza.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.52";
export const CHANGELOG = [
  { type: "Mejora", text: "Facturación incorpora pestañas Facturas y Configuración para administrar la cobranza desde un solo lugar." },
  { type: "Mejora", text: "Se puede generar manualmente una factura seleccionando cliente, plan, monto, período, emisión y vencimiento." },
  { type: "Mejora", text: "La configuración permite modificar día de pago, anticipación de factura, días de gracia y meses necesarios para corte." },
  { type: "Mejora", text: "Se agregan canales de aviso y recordatorios por SMS, WhatsApp o correo, con tres fechas de recordatorio." },
  { type: "Corrección", text: "El corte masivo respeta ahora la cantidad de meses vencidos configurada antes de suspender al abonado." },
];
