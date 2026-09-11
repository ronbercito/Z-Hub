/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.98";
export const CHANGELOG = [
  { type: "WhatsApp", text: "Se agrega en cada plantilla de WhatsApp un botón independiente de Iconos / Emojis para insertar y modificar emojis directamente donde está el cursor." },
  { type: "WhatsApp", text: "El selector de iconos incluye opciones para saludo, pagos, fechas, alertas, comprobantes, mantenimiento y llamadas a la acción." },
  { type: "Fix", text: "Los emojis insertados forman parte del texto de la plantilla y se conservan al guardar, restaurar o reutilizar la plantilla." },
  { type: "Fix", text: "Se mantiene la compatibilidad con variables {{variable}}, {variable}, %vip% y formato WhatsApp existente." },
  { type: "QA", text: "Se conserva una copia de seguridad de las plantillas y de version.js antes de incorporar el editor de iconos." },
];
