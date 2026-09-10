/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.37";
export const CHANGELOG = [
  { type: "Seguridad", text: "El instalador protege backend/.env, separa permisos de archivos/directorios y agrega una clave de cifrado independiente para datos sensibles." },
  { type: "MikroTik", text: "Cortes, reactivaciones y eliminaciones ya no cambian el estado local si RouterOS no confirma la operación." },
  { type: "Pagos", text: "Un pago se conserva aunque falle la reactivación en MikroTik; el cliente permanece suspendido y se informa la incidencia." },
  { type: "Historial", text: "Retirar un cliente conserva facturas, tickets, tareas, documentos, comunicaciones, actividades y servicios; las deudas pendientes se anulan en vez de borrarse." },
  { type: "Sesión", text: "La autenticación persistente pasa a cookie httpOnly y el JWT deja de guardarse en localStorage; SESSION_COOKIE_SECURE queda configurable para HTTPS." },
  { type: "Operación", text: "Fechas de negocio usan America/Lima por defecto, los workers registran errores y los casos de recuperación cerrados no pueden reabrirse silenciosamente." },
  { type: "Calidad", text: "Se agregan regresiones estáticas y un workflow de GitHub Actions para compilación Python y build React." },
  { type: "Backup", text: "Antes del saneamiento se creó una rama de respaldo integral del estado 1.2.36 y un documento de rollback." },
];
