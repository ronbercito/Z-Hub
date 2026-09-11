/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.81";
export const CHANGELOG = [
  { type: "Nueva función", text: "Se integra el gateway V2 de AutomatizadoVIP para enviar WhatsApp desde el servidor de Z-Hub sin exponer la API Key al navegador." },
  { type: "Nueva función", text: "Mensajería incorpora envío automático, historial de envíos y configuración independiente de AutomatizadoVIP." },
  { type: "Automatización", text: "Se preparan recordatorios antes del vencimiento, avisos de deuda vencida y confirmaciones de pago, todos desactivados hasta que el administrador los active." },
  { type: "Seguridad", text: "La API Key de AutomatizadoVIP nunca se devuelve al frontend y los endpoints requieren autenticación y permiso de Mensajería." },
];
