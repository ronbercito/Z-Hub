/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.64";
export const CHANGELOG = [
  { type: "Licencia", text: "Se corrige el falso estado LICENCIA NO VÁLIDA en instalaciones pagadas que ya conservan un snapshot válido de licencia y reciben un estado histórico/legado no reconocido desde el registro local." },
  { type: "Compatibilidad", text: "Los estados activos históricos ACTIVA, ACTIVO, ACTIVE, VALIDA y VÁLIDA se normalizan como licencia activa durante la transición al License Server." },
  { type: "Seguridad", text: "INACTIVA, SUSPENDIDA y estados equivalentes continúan teniendo prioridad y bloquean la licencia aunque exista un snapshot anterior." },
  { type: "Persistencia", text: "Un estado legado desconocido ya no invalida una licencia pagada previamente activada; sin snapshot persistido, ese mismo registro no permite una activación nueva." },
  { type: "Backup", text: "Se creó backup/pre-license-status-hotfix-1.2.64-20260910 antes de modificar el motor de licencias." },
];
