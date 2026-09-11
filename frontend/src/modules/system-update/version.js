/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.69";
export const CHANGELOG = [
  { type: "Claves 192-bit", text: "El License Center genera nuevas claves con 24 bytes aleatorios criptográficamente seguros: 48 caracteres hexadecimales después del prefijo ZHUB-AAAA-." },
  { type: "Formato", text: "El formato oficial queda ZHUB-AAAA-<48 HEX>, sin símbolos especiales para mantener compatibilidad con API, JSON, terminales y base de datos." },
  { type: "Unicidad", text: "La clave se genera con Web Crypto CSPRNG y la clave primaria de SQLite impide guardar una licencia duplicada." },
  { type: "Compatibilidad", text: "Las licencias existentes conservan su clave; el nuevo formato se aplica solamente a claves nuevas o regeneradas antes de guardar." },
  { type: "Backup", text: "Se creó backup/pre-license-key-192bit-1.2.69-20260910 antes del cambio." },
];
