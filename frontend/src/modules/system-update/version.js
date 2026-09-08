/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.99, edición segura de Saldos.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí.
 */
export const PANEL_VERSION = "1.0.99";
export const CHANGELOG = [
  { type: "Facturación", text: "Saldos ahora incorpora un botón Editar en cada movimiento para corregir rápidamente un registro equivocado." },
  { type: "Saldos", text: "Los movimientos todavía disponibles permiten corregir monto y descripción sin crear duplicados." },
  { type: "Seguridad", text: "Un saldo que ya fue aplicado a una factura mantiene su importe bloqueado para proteger la trazabilidad; solo se puede corregir la descripción." },
  { type: "Compatibilidad", text: "La edición usa un endpoint específico de Saldos y no modifica la lógica de aplicación automática a facturas." },
  { type: "Validación", text: "Pendiente de ejecutar build React y validar en el panel la edición de un saldo disponible y el bloqueo de un saldo ya aplicado." },
];
