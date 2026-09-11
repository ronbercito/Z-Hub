/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.71";
export const CHANGELOG = [
  { type: "TRIAL local", text: "El backend local de Z-Hub aplica ahora el mismo límite de 20 abonados que el License Server para licencias TRIAL." },
  { type: "Capacidad", text: "get_client_limit() devuelve 20 para TRIAL y can_create_client() deja de omitir el límite de capacidad." },
  { type: "Persistencia", text: "Al aplicar metadatos de una licencia TRIAL se persiste license_max_clients=20 para mantener coherencia entre servidor remoto, caché y panel local." },
  { type: "Compatibilidad", text: "Las licencias PAID mantienen su comportamiento y las licencias existentes no se eliminan ni reinicializan." },
  { type: "Backup", text: "Se creó backup/pre-local-trial-limit-1.2.71-20260910 antes de aplicar la corrección." },
];
