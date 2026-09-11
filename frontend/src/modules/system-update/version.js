/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.73";
export const CHANGELOG = [
  { type: "Licencias", text: "Si la licencia falta, es inválida, está suspendida/revocada o el Trial venció, Z-Hub abre automáticamente la ventana de Licencia y la mantiene bloqueada hasta activar una clave válida." },
  { type: "Seguridad", text: "El backend bloquea escrituras cuando la instalación no tiene una licencia válida, pero conserva login, activación de licencia, setup y actualización para permitir recuperación sin borrar datos." },
  { type: "Recuperación", text: "La ventana de licencia ya no puede cerrarse con X, Escape ni clic fuera mientras la instalación requiera una nueva licencia." },
  { type: "Datos", text: "Una clave incorrecta o desactivada no reemplaza la licencia actual ni elimina información; el panel permanece en recuperación hasta validar correctamente otra licencia." },
  { type: "Backup", text: "Se creó backup/pre-license-lock-1.2.73-20260911 antes de aplicar el bloqueo de recuperación." },
];
