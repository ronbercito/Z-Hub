/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.36";
export const CHANGELOG = [
  { type: "Clientes", text: "Se habilita el módulo operativo Recuperación de equipos para clientes suspendidos y retirados." },
  { type: "Seguimiento", text: "Los casos pueden pasar por Pendiente, Contactado, Visita programada, Recuperado o No recuperado, con responsable, fecha y observaciones." },
  { type: "Equipos", text: "Se conserva una ficha del equipo por recuperar, usando ONU para fibra o CPE/datos técnicos para inalámbrico cuando estén disponibles." },
  { type: "Alertas", text: "Los clientes con suspensión prolongada pueden abrir directamente Recuperación desde la alerta de Clientes." },
  { type: "Seguridad", text: "Marcar un equipo como recuperado no altera automáticamente el stock de Almacén mientras no exista una asociación inequívoca con inventario." },
  { type: "Backup", text: "Se creó respaldo del estado 1.2.35 antes de implementar el nuevo módulo." },
];
