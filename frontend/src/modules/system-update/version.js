/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.6: modal visual para eliminar servicios adicionales.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.6";
export const CHANGELOG = [
  { type: "Servicio", text: "La confirmación de eliminación de servicios adicionales deja de usar el diálogo nativo del navegador y ahora utiliza una ventana visual integrada al panel." },
  { type: "Diseño", text: "La advertencia sigue el estilo de Advertencia prioritaria: fondo oscuro, borde rojo, icono de alerta, resumen del servicio, observaciones y acciones claramente separadas." },
  { type: "Seguridad", text: "La confirmación requiere escribir SI antes de habilitar la eliminación; Cancelar, NO o cerrar la ventana detienen la operación." },
  { type: "Facturación", text: "Si el backend detecta facturas pendientes, la segunda advertencia también se presenta con el mismo diseño y muestra cantidad y total pendiente." },
  { type: "Compatibilidad", text: "La eliminación del servicio y su auditoría existente se conservan; el cambio sustituye únicamente la interfaz de confirmación." },
  { type: "Validación", text: "Pendiente de ejecutar build y prueba funcional de eliminación con y sin facturas pendientes." },
];
