/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.75";
export const CHANGELOG = [
  { type: "Licencias", text: "La recuperación de licencia permite activar tanto licencias PAID como TRIAL validadas por el License Server remoto." },
  { type: "Trial", text: "Una licencia TRIAL válida puede desbloquear una instalación y conserva sus límites y vencimiento enviados por el servidor central." },
  { type: "Validación", text: "La activación sigue requiriendo una licencia activa y una instalación autorizada; una clave rechazada no reemplaza la licencia almacenada." },
  { type: "Seguridad", text: "La conexión remota continúa usando autorización RS256, clave pública local y caché firmada para el período de gracia." },
  { type: "Backup", text: "Se creó backup/pre-remote-license-1.2.75-20260911 antes de habilitar la activación TRIAL desde recuperación." },
];
