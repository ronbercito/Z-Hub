/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.7: corrección de facturas pendientes en modal de eliminación de servicio.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.7";
export const CHANGELOG = [
  { type: "Servicio", text: "El modal de eliminación de servicio ahora identifica correctamente la segunda confirmación como una eliminación del servicio, no como una eliminación de facturas." },
  { type: "Facturación", text: "La segunda advertencia reconoce el formato real de respuesta del backend y muestra la cantidad y el total de facturas pendientes asociadas al servicio." },
  { type: "Diseño", text: "Se conserva el diseño de Advertencia prioritaria y el botón de confirmación sigue bloqueado hasta escribir SI." },
  { type: "Compatibilidad", text: "Se acepta tanto el mensaje actual 'por S/.' como el formato anterior 'por un total de S/.' sin modificar la lógica de eliminación ni la auditoría." },
  { type: "Validación", text: "Pendiente de ejecutar build y prueba funcional de eliminación con y sin facturas pendientes." },
];
