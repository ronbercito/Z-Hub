/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.1: Log operativo del cliente.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.1";
export const CHANGELOG = [
  { type: "Clientes", text: "La pestaña Log de la ficha del cliente ahora muestra el historial real de actividades realizadas sobre el cliente." },
  { type: "Auditoría", text: "Cada acción registrada muestra quién la realizó, fecha y hora y el detalle de la operación." },
  { type: "Cuentas", text: "Las acciones nuevas del editor registran automáticamente la cuenta autenticada y su rol; el operador no puede indicar manualmente otra cuenta." },
  { type: "Facturación", text: "Las acciones realizadas desde Facturación y Saldos se reflejan en el Log del cliente con la cuenta que las ejecutó." },
  { type: "Servicio", text: "Las ediciones del servicio realizadas desde la ficha quedan registradas en el historial." },
  { type: "Comunicaciones", text: "Email, SMS y documentos continúan registrando sus operaciones y operador en el historial del cliente." },
  { type: "Compatibilidad", text: "No se elimina información existente ni se modifica la estructura de datos del cliente; se reutiliza el historial persistente de actividades." },
  { type: "Validación", text: "Pendiente de ejecutar build React y validar en el panel la edición como administrador/técnico y la visualización de fecha, cuenta, rol y detalle." },
];
