/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.9: configuración de facturación por cliente y reglas reales de vencimiento/corte.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.9";
export const CHANGELOG = [
  { type: "Facturación", text: "La ficha del cliente ahora carga Configuración desde las reglas reales guardadas durante el registro, no desde la configuración global del ISP." },
  { type: "Vencimiento", text: "El día de pago y la anticipación para crear factura calculan emisión y vencimiento de forma coherente para el abonado." },
  { type: "Corte", text: "La regla de meses vencidos usada por el corte en MikroTik ahora se toma del abonado." },
  { type: "Mensajería", text: "El aviso de nueva factura, canal de recordatorios y días de recordatorio se guardan directamente en la configuración del abonado." },
  { type: "Seguridad", text: "La configuración se guarda mediante un endpoint específico y no reprovisiona el servicio técnico ni modifica la configuración global." },
  { type: "Validación", text: "Pendiente de ejecutar build y prueba funcional real en navegador/servidor con un abonado registrado con valores distintos a los globales." },
];
