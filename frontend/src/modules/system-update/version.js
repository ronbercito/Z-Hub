/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.66";
export const CHANGELOG = [
  { type: "Etapa 6", text: "Z-Hub incorpora cliente de License Server remoto por HTTPS con validación de licencia, plan, capacidad e instalación autorizada." },
  { type: "Continuidad", text: "Las validaciones remotas correctas generan una autorización RS256 firmada que se conserva localmente para mantener operación durante una caída temporal del VPS." },
  { type: "Seguridad", text: "Un rechazo explícito del License Server no reutiliza una autorización anterior; la clave privada permanece exclusivamente en el VPS y Z-Hub solo necesita la clave pública." },
  { type: "VPS", text: "Se agregó el servicio license_server con base SQLite, historial de validaciones, autorización por installation_id, plantillas systemd/Nginx y generación de claves." },
  { type: "Transición", text: "Mientras el License Server no esté configurado o durante la migración inicial, se conserva temporalmente el registro local; no se elimina hasta validar el servicio remoto." },
  { type: "Backup", text: "Se creó backup/pre-license-stage6-1.2.65-20260910 antes de iniciar la Etapa 6/7." },
];
