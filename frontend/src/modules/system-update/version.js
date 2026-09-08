/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.97, corrección de aplicación de deuda.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí.
 */
export const PANEL_VERSION = "1.0.97";
export const CHANGELOG = [
  { type: "Saldos", text: "El libro mayor registra saldo a favor con montos positivos y deuda con montos negativos, manteniendo factura origen/destino y trazabilidad." },
  { type: "Saldo a favor", text: "Un abono positivo se aplica automáticamente a las siguientes facturas; si cubre el total, la factura queda pagada y el excedente permanece disponible." },
  { type: "Deuda", text: "Una deuda negativa se traslada completa a la siguiente factura mensual o manual, incluso cuando la deuda es mayor que el importe base de esa factura." },
  { type: "Corrección", text: "Se corrigió el motor para no limitar la deuda al monto de la factura ni inflar el pendiente durante la aplicación." },
  { type: "Facturación", text: "La factura resultante conserva el monto final y los movimientos de aplicación quedan registrados en Saldos." },
  { type: "Compatibilidad", text: "Facturas, Transacciones, Configuración, pagos y el resto de pestañas del cliente mantienen sus endpoints y comportamiento existentes." },
  { type: "Validación", text: "Validar en el panel los escenarios 500 → factura 50 → pagada + saldo 450 y -100 → factura 50 → factura 150 + deuda restante 0." },
];
