/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.84";
export const CHANGELOG = [
  { type: "Mejora", text: "Se agrega una prueba controlada con facturas reales para validar las automatizaciones de AutomatizadoVIP antes de activar el worker." },
  { type: "Prueba", text: "El panel permite comprobar Recordatorio de pago, Aviso de corte y Confirmación de pago, calculando la condición real y mostrando el mensaje antes del envío." },
  { type: "Seguridad", text: "El envío de prueba requiere pasarela activa, automatización correspondiente habilitada y confirmación explícita antes de enviar el WhatsApp real." },
];
