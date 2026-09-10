/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.49";
export const CHANGELOG = [
  { type: "Recuperación", text: "Se republica la Etapa 3/4 con la validación corregida: Gestionar mantiene responsable, contacto, visita, observaciones y resolución individual de equipos." },
  { type: "Calidad", text: "La regresión de casos cerrados fue actualizada para validar la interfaz actual: los casos Recuperado/No recuperado quedan en modo Ver detalle y no se reabren desde la UI." },
  { type: "Dependencias", text: "Se fijan memfs y @jsonjoy.com/fs-snapshot en una versión disponible para evitar el 404 que impidió instalar dependencias durante el CI de 1.2.48." },
  { type: "Flujo", text: "Cada equipo puede quedar Recuperado o No recuperado y el caso se cierra automáticamente cuando todos sus equipos han sido resueltos." },
  { type: "Seguridad", text: "Almacén continúa sin modificarse automáticamente; la integración de inventario sigue reservada para la Etapa 4/4." },
  { type: "Compatibilidad", text: "Los casos creados en 1.2.47 siguen siendo compatibles y no se eliminan clientes, facturas, servicios ni recuperaciones existentes." },
  { type: "Backup", text: "Antes de corregir el release fallido 1.2.48 se creó backup/pre-ci-fix-1.2.48-20260910." },
];
