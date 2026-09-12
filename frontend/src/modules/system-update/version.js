/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.99";
export const CHANGELOG = [
  { type: "Licencias", text: "Se incorpora un HW-ID determinista basado en varias señales locales del servidor y se envía únicamente como hash SHA-256." },
  { type: "Licencias", text: "Se agrega el cliente backend para solicitar o recuperar automáticamente el TRIAL desde Web-Licence sin depender de una clave escrita por el usuario." },
  { type: "Seguridad", text: "Los identificadores crudos del host no se envían al License Server; Web-Licence recibe únicamente la huella final hasheada." },
  { type: "Compatibilidad", text: "El flujo actual de licencia manual permanece intacto hasta conectar el nuevo cliente al Wizard en la Etapa 4/7." },
  { type: "QA", text: "Se conserva backup previo de Z-Hub 1.2.98 antes de incorporar el flujo HW-ID." },
];
