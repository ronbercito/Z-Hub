/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.5";
export const CHANGELOG = [
  { type: "Wizard", text: "El registro de empresa se integra como primer paso de la instalación; Web-Licence queda oculto para el cliente final." },
  { type: "Registro", text: "Si el cliente ya tiene cuenta puede omitir el registro y continuar directamente con su correo." },
  { type: "País", text: "El país se selecciona primero, Perú es el valor por defecto y se incluyen los países latinoamericanos soportados." },
  { type: "WhatsApp", text: "El prefijo internacional se agrega automáticamente al teléfono según el país seleccionado." },
];
