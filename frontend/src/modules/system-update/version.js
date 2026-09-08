/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.53, facturación ligada a servicios del cliente.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.53";
export const CHANGELOG = [
  { type: "Mejora", text: "La Facturación dentro de la ficha del cliente ahora incluye Facturas, Transacciones, Saldos y Configuración." },
  { type: "Mejora", text: "Se puede generar una factura libre o una factura de servicios seleccionando el servicio 1, 2, 3, etc. del cliente." },
  { type: "Mejora", text: "Cada factura y pago queda ligado al cliente y, cuando corresponde, al servicio específico." },
  { type: "Mejora", text: "Los pagos registrados se muestran en Transacciones y el saldo se desglosa por servicio." },
  { type: "Corrección", text: "El pago adelantado generado al crear un servicio adicional ahora queda vinculado al servicio correspondiente." },
  { type: "Mejora", text: "La configuración incluye tipo de facturación, día de pago, anticipación, impuesto, gracia, corte, mora, reconexión y recordatorios." },
];
