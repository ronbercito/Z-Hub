/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.51";
export const CHANGELOG = [
  { type: "Recuperación", text: "Etapa 4/4: los equipos marcados Recuperado pueden enviarse a Almacén desde el detalle del caso, incluso después de cerrar la recuperación." },
  { type: "Almacén", text: "El retorno permite clasificar cada equipo como Disponible para reutilizar, En revisión, Averiado o Baja y conserva ubicación y observación." },
  { type: "Seguridad", text: "Z-Hub solo reutiliza un registro existente cuando el Serial/MAC coincide exactamente; si no existe coincidencia puede crear un registro nuevo controlado con ese identificador." },
  { type: "Stock", text: "Disponible registra una unidad utilizable; En revisión, Averiado y Baja quedan con stock disponible 0 para no ofrecer equipos no aptos como disponibles." },
  { type: "Duplicados", text: "Un equipo ya retornado o un registro que ya tenga stock disponible se bloquea para impedir doble ingreso de existencias." },
  { type: "Inventario", text: "Almacén muestra ahora el estado Disponible, En revisión, Averiado o Baja junto al stock, serie/MAC y ubicación." },
  { type: "Trazabilidad", text: "El caso conserva código de inventario, destino, fecha, observación e historial del retorno a Almacén." },
  { type: "Backup", text: "Antes de iniciar la Etapa 4 se creó backup/pre-equipment-stage4-1.2.50-20260910 desde la 1.2.50 validada en producción." },
];
