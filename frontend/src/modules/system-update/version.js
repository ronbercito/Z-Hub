/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.77";
export const CHANGELOG = [
  { type: "Licencias", text: "Las actualizaciones conservan la configuración del License Server remoto existente en Supervisor y evitan regresar a Modo local." },
  { type: "Despliegue", text: "El instalador reconstruye zhub_backend.conf preservando ZHUB_LICENSE_SERVER_URL y ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE cuando ya estaban configurados." },
  { type: "Seguridad", text: "No se incrustan IP, URL, claves privadas ni tokens en el repositorio; solo se reutilizan los valores existentes de la instalación." },
  { type: "Compatibilidad", text: "Instalaciones sin License Server remoto continúan generando la configuración estándar de Supervisor sin variables adicionales." },
  { type: "Backup", text: "Se creó backup/pre-license-env-persistence-1.2.77-20260911 antes de corregir la persistencia." },
];
