/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.72";
export const CHANGELOG = [
  { type: "Licencias", text: "Ajustes → Licencia Z-Hub muestra ahora el estado del License Server, la fuente de validación y el ID de instalación." },
  { type: "TRIAL", text: "La pantalla del Trial queda alineada con el límite real de 20 abonados y muestra uso, capacidad y abonados disponibles." },
  { type: "Continuidad", text: "Cuando exista autorización en caché se informa la fuente de validación y el período de gracia sin ocultar el estado de la licencia." },
  { type: "Compatibilidad", text: "La actualización no activa ni reemplaza automáticamente la licencia actual; la configuración remota continúa siendo independiente del panel." },
  { type: "Backup", text: "Se creó backup/pre-license-panel-1.2.72-20260911 antes de publicar los cambios." },
];
