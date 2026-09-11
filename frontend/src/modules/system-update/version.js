/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.95";
export const CHANGELOG = [
  { type: "Fix", text: "Las automatizaciones WhatsApp resuelven variables con sintaxis WispHub {{variable}} y con la sintaxis heredada {variable}, evitando llaves visibles alrededor de los valores enviados." },
  { type: "Mensajería", text: "El renderizador común queda como único punto de resolución para la prueba manual y el worker de AutomatizadoVIP, manteniendo el mismo mensaje final antes del envío." },
];