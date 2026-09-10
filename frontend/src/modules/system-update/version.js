/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.41";
export const CHANGELOG = [
  { type: "Servicios", text: "Rediseña Nuevo servicio como un flujo guiado y secuencial inspirado en la interfaz aprobada." },
  { type: "Orden", text: "La secuencia queda Router → Tecnología → Plan de internet → Tipo de conexión → Datos de acceso → Zona y datos técnicos." },
  { type: "Conexión", text: "IP estática pasa a ser el tipo de conexión predeterminado para un servicio nuevo." },
  { type: "Bloqueo progresivo", text: "Cada selector o campo se habilita únicamente cuando se completa el paso anterior, reduciendo combinaciones inválidas y confusión." },
  { type: "Planes", text: "Se conserva el filtro estricto de planes por tecnología introducido en 1.2.40." },
  { type: "Interfaz", text: "El modal incorpora pasos visuales, tarjetas de configuración y estilos propios para tema oscuro y Z-Hub Claro." },
  { type: "Nomenclatura", text: "En el registro del servicio se reemplaza la etiqueta MikroTik por Router." },
  { type: "Backup", text: "Antes del cambio se creó una rama de respaldo integral de Z-Hub 1.2.40." },
];
