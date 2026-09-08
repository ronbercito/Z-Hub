/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.8: campos reales en confirmación de eliminación de servicio.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.8";
export const CHANGELOG = [
  { type: "Servicio", text: "La confirmación visual de eliminación conserva los campos reales del aviso: servicio, plan, precio, IP, MikroTik y tecnología." },
  { type: "Facturación", text: "La segunda confirmación muestra la cantidad y el total real de facturas pendientes asociados al servicio." },
  { type: "Diseño", text: "Se mantiene el diseño de Advertencia prioritaria, pero la información del servicio también permanece visible en la segunda confirmación." },
  { type: "Seguridad", text: "La confirmación continúa exigiendo escribir SI y conserva la protección de facturas pagadas o parcialmente pagadas." },
  { type: "Validación", text: "Pendiente de ejecutar build y prueba funcional real en navegador con un servicio que tenga facturas pendientes." },
];
