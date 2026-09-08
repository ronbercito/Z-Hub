/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.3: auditoría detallada de eliminación de servicios.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.3";
export const CHANGELOG = [
  { type: "Auditoría", text: "El Log del cliente registra la eliminación de un servicio con información específica, no como una acción genérica." },
  { type: "Servicios", text: "Al eliminar un servicio se registra el número de servicio, plan, precio, conexión, tecnología, MikroTik, IP, usuario PPPoE, zona y estado anterior." },
  { type: "Deuda", text: "Si el servicio tenía facturas pendientes no pagadas, el Log indica cuántas fueron eliminadas, el monto total y el detalle de cada factura." },
  { type: "Protección", text: "Las facturas pagadas o parcialmente pagadas no se eliminan como parte de este flujo; solo se registran y eliminan las pendientes permitidas por la confirmación existente." },
  { type: "Cuentas", text: "La eliminación queda asociada a la cuenta autenticada y su rol, permitiendo saber qué administrador o técnico realizó la operación." },
  { type: "Validación", text: "Pendiente de ejecutar build y validar en el panel la eliminación de un servicio con y sin facturas pendientes." },
];
