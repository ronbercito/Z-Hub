/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.83";
export const CHANGELOG = [
  { type: "Corrección", text: "El botón principal de envío manual en Mensajería ahora utiliza AutomatizadoVIP directamente en lugar de abrir WhatsApp Web/Móvil." },
  { type: "Mejora", text: "WhatsApp Web/Móvil queda disponible como alternativa explícita y separada para evitar confusión entre ambos métodos." },
  { type: "Corrección", text: "Las automatizaciones reconocen fechas ISO de pago y también facturas con estado VENCIDO para los avisos de corte." },
  { type: "Pruebas", text: "Se prepara el flujo de validación: recordatorio de pago, aviso de vencimiento/corte, confirmación de pago, historial y activación controlada del worker." },
];
