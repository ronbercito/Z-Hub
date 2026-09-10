/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.39";
export const CHANGELOG = [
  { type: "Actualizador", text: "Corrige el error 'craco: Permission denied' detectado al actualizar desde 1.2.37/1.2.38." },
  { type: "Compatibilidad", text: "Antes del build se restauran los permisos de ejecución de frontend/node_modules/.bin para reparar instalaciones ya afectadas." },
  { type: "Permisos", text: "El instalador deja de aplicar chmod 0644 dentro de frontend/node_modules, backend/venv y .git, preservando los modos propios de ejecutables y dependencias." },
  { type: "Seguridad", text: "backend/.env continúa protegido con permisos 0600 y propietario root." },
  { type: "Rollback", text: "El actualizador mantiene el rollback automático si el build o la instalación fallan." },
  { type: "Backup", text: "Antes de la corrección se preservó íntegramente Z-Hub 1.2.38 en una rama de respaldo." },
];
