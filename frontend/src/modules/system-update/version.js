/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.100, límite seguro para editar Saldos.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí.
 */
export const PANEL_VERSION = "1.0.100";
export const CHANGELOG = [
  { type: "Facturación", text: "Saldos permite editar un movimiento nuevo directamente desde la tabla mediante el botón Editar." },
  { type: "Saldos", text: "Un saldo nuevo o todavía no aplicado puede reducirse hasta S/. 0.00 sin modificar los saldos anteriores del cliente." },
  { type: "Validación", text: "El monto editado no puede superar el importe original: si se registraron S/. 100.00, intentar editar a S/. 101.00 muestra una advertencia indicando el máximo permitido." },
  { type: "Protección", text: "No se permite cambiar un saldo a favor por deuda ni una deuda por saldo a favor, y los movimientos ya aplicados mantienen su importe bloqueado para proteger la trazabilidad." },
  { type: "Compatibilidad", text: "La corrección mantiene la aplicación automática de saldos a facturas y no modifica tablas ni datos existentes." },
  { type: "Validación", text: "Pendiente de ejecutar build React y validar en el panel los casos 30 + 100 = 130, edición de 100 a 0 y rechazo de 101." },
];
