/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.40";
export const CHANGELOG = [
  { type: "Clientes", text: "Restaura el filtro de planes por tecnología al crear o editar servicios de Internet desde la ficha del cliente." },
  { type: "Fibra", text: "Al seleccionar Fibra óptica solo se muestran planes de fibra activos." },
  { type: "Inalámbrico", text: "Al seleccionar Inalámbrico solo se muestran planes inalámbricos/radio activos." },
  { type: "Validación", text: "Al cambiar de tecnología se limpia el plan anterior y se impide guardar un plan incompatible con la tecnología seleccionada." },
  { type: "Compatibilidad", text: "El alta guiada de clientes conserva su filtro existente; la corrección se aplica al modal de servicios adicionales y edición de servicio." },
  { type: "Backup", text: "Antes del cambio se creó una rama de respaldo integral de Z-Hub 1.2.39." },
];
