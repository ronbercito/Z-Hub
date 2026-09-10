/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.48";
export const CHANGELOG = [
  { type: "Recuperación", text: "Etapa 3/4: el botón Gestionar abre el detalle operativo del caso con responsable, contacto, visita, observaciones y equipos pendientes." },
  { type: "Equipos", text: "Cada equipo del caso puede resolverse individualmente como Recuperado o No recuperado, conservando su observación y trazabilidad." },
  { type: "Flujo", text: "El seguimiento mantiene Pendiente → Contactado → Visita programada y el caso se cierra automáticamente cuando todos sus equipos quedan resueltos." },
  { type: "Historial", text: "Se registra historial del caso y de los cambios de estado de cada equipo dentro de la propia recuperación." },
  { type: "Seguridad", text: "La Etapa 3 no mueve existencias de Almacén; el retorno a inventario continúa reservado exclusivamente para la Etapa 4/4." },
  { type: "Compatibilidad", text: "No se eliminan clientes, facturas, servicios ni casos existentes; las recuperaciones creadas en 1.2.47 continúan siendo gestionables." },
  { type: "Backup", text: "Antes de iniciar la Etapa 3 se creó backup/pre-equipment-stage3-1.2.47-20260910 desde el estado completo de 1.2.47." },
];
