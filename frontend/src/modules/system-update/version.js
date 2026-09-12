/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.29";
export const CHANGELOG = [
  { type: "Sistema", text: "Ajustes > Sistema incorpora una zona horaria configurable por país, con America/Lima como valor predeterminado." },
  { type: "Fecha y hora", text: "El historial de AutomatizadoVIP interpreta los timestamps del servidor en UTC y los muestra según la zona horaria configurada en Z-Hub." },
  { type: "Compatibilidad", text: "El servidor Debian y MariaDB pueden permanecer en UTC; la nueva preferencia se guarda en la configuración JSON existente sin migraciones destructivas." },
];
