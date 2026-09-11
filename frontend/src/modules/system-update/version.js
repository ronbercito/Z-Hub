/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.62";
export const CHANGELOG = [
  { type: "Trial", text: "Cuando el Trial llega a 0 días, al iniciar sesión Z-Hub lleva automáticamente al usuario a Ajustes → Licencia Z-Hub." },
  { type: "Compra", text: "La pantalla de licencia vencida incorpora acciones para pagar una licencia y contactar al área comercial por WhatsApp." },
  { type: "Activación", text: "El administrador mantiene disponible el campo para ingresar una licencia pagada y recuperar la operación sin reinstalar ni perder datos." },
  { type: "Configuración", text: "Los destinos comerciales se configuran en el servidor mediante ZHUB_LICENSE_PAYMENT_URL y ZHUB_LICENSE_WHATSAPP, evitando hardcodear datos comerciales en el frontend." },
  { type: "Compatibilidad", text: "El modo consulta del Trial vencido se mantiene: los datos siguen accesibles y protegidos mientras no exista una licencia pagada activa." },
  { type: "Backup", text: "Se creó backup/pre-license-expired-redirect-1.2.61-20260910 antes de implementar este ajuste." },
];
