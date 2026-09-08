/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.96, libro mayor de Saldos del cliente.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí.
 */
export const PANEL_VERSION = "1.0.96";
export const CHANGELOG = [
  { type: "Saldos", text: "La pestaña Saldos del cliente ahora tiene un libro mayor con ID, factura origen, factura destino, monto, fecha, descripción y estado." },
  { type: "Saldo a favor", text: "Un monto positivo queda disponible como crédito del cliente y se aplica automáticamente a las siguientes facturas generadas." },
  { type: "Deuda", text: "Un monto negativo queda como deuda pendiente y se suma automáticamente a la siguiente factura mensual o manual." },
  { type: "Facturación", text: "Las aplicaciones automáticas quedan trazadas como movimientos de destino y una factura puede quedar pagada total o parcialmente con saldo a favor." },
  { type: "Backend", text: "Se creó el modelo client_balances y una API aislada para registrar/listar movimientos; la base se actualiza mediante la inicialización/migración ligera existente." },
  { type: "Corrección", text: "El saldo pendiente del cliente ahora descuenta correctamente los pagos parciales en lugar de contar el monto bruto de la factura." },
  { type: "Compatibilidad", text: "La facturación existente, Transacciones, Configuración, edición, eliminación, anulación y envío de facturas permanecen en el mismo módulo y endpoints existentes." },
  { type: "Validación", text: "1.0.96 debe validarse mediante el Actualizador del panel y probarse con crédito, deuda y generación de factura antes de considerarse finalizada." },
];
