/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.32";
export const CHANGELOG = [
  { type: "Registro y altas", text: "Se habilitan preferencias funcionales para nuevos abonados dentro de Ajustes > Configuración clientes." },
  { type: "Facturación", text: "Se puede definir el día de facturación sugerido del 1 al 30 para nuevas altas." },
  { type: "Tecnología", text: "Se puede escoger Fibra óptica o Inalámbrico como tecnología predeterminada del registro." },
  { type: "Instalación", text: "La fecha de instalación puede configurarse como obligatoria u opcional; si es opcional el asistente permite dejarla vacía." },
  { type: "Primera factura", text: "Se puede definir si Crear primera factura aparece activado o desactivado por defecto en nuevas altas." },
  { type: "Compatibilidad", text: "Las preferencias se aplican como valores iniciales sin cambiar las reglas existentes de MikroTik, NAP, planes ni facturación individual." },
  { type: "Backup", text: "Se guardaron referencias recuperables de los archivos 1.2.31 antes del cambio." },
];
