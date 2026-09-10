/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.30";
export const CHANGELOG = [
  { type: "Configuración clientes", text: "Se reorganizan las cuatro áreas para separar Registro y altas, Pausas, Suspensiones/retiros/reactivaciones y Recuperación de equipos." },
  { type: "Recuperación", text: "Avisos del cliente se reemplaza por Recuperación de equipos para evitar duplicar las notificaciones que ya existen en Facturación del abonado." },
  { type: "Diseño", text: "Las tarjetas de Configuración clientes se hacen más compactas, conservando espacio suficiente para futuras opciones." },
  { type: "Tema claro", text: "Se agregan estilos locales para que tarjetas, bordes, textos, selector y política de suspensión prolongada respeten el tema Z-Hub Claro." },
  { type: "Compatibilidad", text: "No se modifica backend, facturación, MikroTik ni la lógica actual de suspensión prolongada." },
  { type: "Backup", text: "Se guardaron referencias recuperables de los archivos 1.2.29 afectados antes del cambio." },
];
