/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.74";
export const CHANGELOG = [
  { type: "Licencias", text: "Se retiraron las licencias DEMO empaquetadas como mecanismo de autorización. Una clave DEMO antigua ya no puede mantener el panel como Licencia activa." },
  { type: "Validación", text: "Un snapshot de licencia guardado en la base de datos ya no se considera autorización por sí solo. Sin registro local válido, validación remota o caché firmada, el estado pasa a inválido." },
  { type: "Recuperación", text: "Cuando la licencia almacenada deja de ser válida, Z-Hub entra en modo de recuperación y mantiene bloqueada la ventana de Licencia hasta activar una clave válida." },
  { type: "Seguridad", text: "Los datos existentes no se eliminan; solamente se bloquean operaciones protegidas mientras la instalación no tenga una autorización válida." },
  { type: "Backup", text: "Se creó backup/pre-remove-demo-license-1.2.74-20260911 antes de retirar la autorización DEMO empaquetada." },
];
