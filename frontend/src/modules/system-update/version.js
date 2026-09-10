/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.38";
export const CHANGELOG = [
  { type: "Republicación", text: "Se republica íntegramente el saneamiento validado de 1.2.37 como Z-Hub 1.2.38 para forzar una nueva actualización desde el Centro de Actualizaciones." },
  { type: "Seguridad", text: "El instalador protege backend/.env, separa permisos de archivos/directorios y agrega una clave de cifrado independiente para datos sensibles." },
  { type: "MikroTik", text: "Cortes, reactivaciones y eliminaciones ya no cambian el estado local si RouterOS no confirma la operación." },
  { type: "Pagos", text: "Un pago se conserva aunque falle la reactivación en MikroTik; el cliente permanece suspendido y se informa la incidencia." },
  { type: "Historial", text: "Retirar un cliente conserva facturas, tickets, tareas, documentos, comunicaciones, actividades y servicios; las deudas pendientes se anulan en vez de borrarse." },
  { type: "Sesión", text: "La autenticación persistente usa cookie httpOnly y el JWT deja de guardarse en localStorage; SESSION_COOKIE_SECURE queda configurable para HTTPS." },
  { type: "Operación", text: "Fechas de negocio usan America/Lima por defecto, los workers registran errores y los casos de recuperación cerrados no pueden reabrirse silenciosamente." },
  { type: "Calidad", text: "Se mantienen las regresiones estáticas y el workflow de GitHub Actions para compilación Python y build React." },
  { type: "Backup", text: "Antes de republicar se creó una rama de respaldo integral del estado 1.2.37." },
];
