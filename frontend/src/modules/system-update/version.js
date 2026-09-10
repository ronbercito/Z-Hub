/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.43";
export const CHANGELOG = [
  { type: "Alta de clientes", text: "Aplica al registro de un abonado nuevo el mismo flujo técnico progresivo usado en Nuevo servicio." },
  { type: "Orden", text: "El servicio se configura Router → Tecnología → Plan de internet → Tipo de conexión → Red/Acceso → Zona → datos técnicos." },
  { type: "Conexión", text: "IP estática queda como tipo de conexión predeterminado para nuevos abonados." },
  { type: "Bloqueo progresivo", text: "Cada campo técnico se habilita solo cuando se completa el requisito anterior y Registrar usuario permanece bloqueado hasta completar el servicio." },
  { type: "Planes", text: "Mantiene el filtro estricto de planes activos según Fibra óptica o Inalámbrico." },
  { type: "Nomenclatura", text: "La etapa técnica del alta muestra Router en lugar de MikroTik sin cambiar la integración RouterOS." },
  { type: "Temas", text: "El bloque técnico mantiene dos columnas compactas y estilos específicos para tema oscuro y Z-Hub Claro." },
  { type: "Backup", text: "Antes del cambio se creó backup/pre-new-client-service-flow-1.2.42-20260910 desde el estado completo de 1.2.42." },
];
