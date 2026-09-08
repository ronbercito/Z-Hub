/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.2: auditoría detallada de operaciones.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.2";
export const CHANGELOG = [
  { type: "Auditoría", text: "El Log del cliente registra operaciones concretas en lugar del mensaje genérico 'Facturación actualizada'." },
  { type: "Saldos", text: "Al agregar un saldo se registra el tipo (saldo a favor o deuda), monto, descripción, saldo neto resultante y factura de origen cuando corresponde." },
  { type: "Saldos", text: "Al editar un saldo se registra el ID del movimiento, monto anterior y nuevo, descripción anterior y nueva y saldo neto resultante." },
  { type: "Facturas", text: "La creación de una factura registra número, tipo, plan, monto, período, vencimiento y las aplicaciones automáticas de saldo o deuda." },
  { type: "Facturas", text: "La edición registra exactamente los campos que cambiaron y sus valores anterior y nuevo." },
  { type: "Facturas", text: "La eliminación y anulación registran número, monto, período y estado anterior cuando corresponde." },
  { type: "Pagos", text: "Cada pago registra monto de la operación, método, referencia, acumulado pagado, total de factura y estado resultante." },
  { type: "Cuentas", text: "Cada registro de auditoría identifica la cuenta autenticada y su rol; no se acepta una cuenta escrita manualmente por el operador." },
  { type: "Validación", text: "Pendiente de ejecutar build React/backend y validar en el panel las operaciones de Saldos, Facturas y Pagos con administrador y técnico." },
];
