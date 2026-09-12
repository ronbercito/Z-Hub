/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.16";
export const CHANGELOG = [
  { type: "Red", text: "Corrige el registro de routers MikroTik cuando latitud y longitud se dejan vacías." },
  { type: "Validación", text: "El backend normaliza coordenadas vacías a 0.0 y evita la respuesta 422 que provocaba la pantalla en blanco." },
  { type: "Compatibilidad", text: "Se mantiene intacta la base funcional restaurada de Z-Hub 1.3.15 / 1.3.9." },
];
