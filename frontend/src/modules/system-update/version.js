/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.76";
export const CHANGELOG = [
  { type: "Licencias", text: "El vencimiento de un TRIAL remoto ahora usa la fecha expires_at firmada por el License Server como fuente autoritativa." },
  { type: "Compatibilidad", text: "Los Trials locales antiguos continúan usando el cálculo histórico de 30 días cuando no existe una expiración remota guardada." },
  { type: "Persistencia", text: "Z-Hub conserva license_expires_at junto con los metadatos de licencia para mantener el mismo vencimiento tras reinicios y validaciones por caché." },
  { type: "Etapa 6", text: "Se validó el flujo completo HTTPS + CA confiable + JWT RS256 + instalación autorizada + TRIAL remoto de 20 abonados + caché/gracia + recuperación del panel." },
  { type: "Backup", text: "Se creó backup/pre-remote-trial-dates-1.2.76-20260911 antes de sincronizar las fechas del Trial remoto." },
];
