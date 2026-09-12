/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.1";
export const CHANGELOG = [
  { type: "Licencias", text: "El apartado Licencia se simplifica para mostrar solo estado, plan, vencimiento, días restantes, capacidad e Installation ID." },
  { type: "UX", text: "Se retira del flujo visible la activación manual por clave y el detalle técnico del License Server." },
  { type: "Comercial", text: "Se agrega una única acción para solicitar o renovar la licencia por WhatsApp con contexto automático de la instalación." },
  { type: "Seguridad", text: "La clave de licencia deja de mostrarse en el apartado de cliente; la administración permanece centralizada en Web-Licence." },
];
