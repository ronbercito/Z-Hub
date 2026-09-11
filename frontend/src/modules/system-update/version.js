/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.96";
export const CHANGELOG = [
  { type: "Fix", text: "Mensajería manual resuelve correctamente variables WhatsApp con {{variable}} y {variable}, incluyendo todas sus apariciones en cada plantilla." },
  { type: "Fix", text: "El renderizado manual ya no deja valores vacíos entre asteriscos ni llaves alrededor del teléfono, monto, nombre, fecha o comprobante." },
  { type: "QA", text: "Se agregan pruebas para sintaxis doble, sintaxis heredada y variables repetidas antes del envío a AutomatizadoVIP." },
];
