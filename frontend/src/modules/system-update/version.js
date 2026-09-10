/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.45";
export const CHANGELOG = [
  { type: "Clientes", text: "Reorganiza la tabla principal en columnas separadas: Abonado, Contacto, Plan / Tarifa, IP / Conexión, Deuda, Estado y Acciones." },
  { type: "Ubicación", text: "Mueve el botón de ubicación desde la columna Abonado hacia Acciones y lo representa con un icono GPS/mapa." },
  { type: "Deuda", text: "Conserva el total agregado del abonado y la burbuja con el número de facturas pendientes, ahora en una columna propia." },
  { type: "Estado", text: "Muestra Activo, Pausado o Cortado en una columna independiente con insignias de color." },
  { type: "Diseño", text: "Replica el estilo compacto aprobado: cabecera azul marino, fila limpia, divisores suaves y botones de acción con colores diferenciados." },
  { type: "Temas", text: "Incluye tonos específicos para Z-Hub Claro y una variante equivalente para tema oscuro sin cambiar la lógica de clientes." },
  { type: "Backup", text: "Antes del cambio se creó backup/pre-clients-table-redesign-1.2.44-20260910 desde el estado completo de 1.2.44." },
];
