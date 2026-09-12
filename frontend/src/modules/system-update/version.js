/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.3";
export const CHANGELOG = [
  { type: "Instalación", text: "Las instalaciones limpias preparan automáticamente la conexión segura con Web-Licence antes del Wizard." },
  { type: "Licencias", text: "Se instala la clave pública RS256 y la CA TLS pública necesarias para Auto-TRIAL, sin incluir claves privadas." },
  { type: "Seguridad", text: "La CA de Web-Licence se registra en el almacén de confianza del sistema; no se usa curl -k ni se desactiva TLS." },
  { type: "Corrección", text: "Se evita el error 'License Server no configurado' en servidores Z-Hub recién instalados." },
];
