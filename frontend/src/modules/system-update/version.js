/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.4: confirmación explícita antes de eliminar servicios adicionales.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.4";
export const CHANGELOG = [
  { type: "Servicios", text: "Al eliminar un servicio adicional se muestra una advertencia clara y se solicita confirmación explícita antes de ejecutar la eliminación." },
  { type: "Protección", text: "La advertencia identifica el servicio y muestra datos relevantes como plan, precio, IP, usuario PPPoE, MikroTik y tecnología cuando están disponibles." },
  { type: "Deuda", text: "Si existen facturas pendientes, se presenta una segunda confirmación específica indicando cantidad y monto antes de eliminarlas." },
  { type: "Auditoría", text: "La operación confirmada continúa registrándose en el Log detallado del cliente como eliminación de servicio, sin generar un evento genérico de edición." },
  { type: "Validación", text: "Pendiente de ejecutar build y validar la confirmación en el panel con un servicio adicional con y sin facturas pendientes." },
];
