/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.0";
export const CHANGELOG = [
  { type: "Licencias", text: "El Setup Wizard activa o recupera automáticamente el TRIAL desde Web-Licence usando el HW-ID seguro del servidor." },
  { type: "UX", text: "Se elimina del flujo normal de instalación el campo para escribir una clave de licencia; el cliente se identifica con su correo registrado." },
  { type: "Licencias", text: "Una reinstalación sobre el mismo hardware recupera el mismo TRIAL y no reinicia el período de prueba." },
  { type: "Seguridad", text: "La clave asignada por Web-Licence permanece en el backend y ya no se reenvía desde el navegador al finalizar el Wizard." },
  { type: "Documentación", text: "Se inicia CONTINUIDAD_Z-HUB-v1.3.md como bitácora exclusiva de la serie 1.3.x." },
];
