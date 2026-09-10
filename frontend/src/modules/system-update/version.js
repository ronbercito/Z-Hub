/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.34";
export const CHANGELOG = [
  { type: "Suspensiones", text: "La sección Suspensiones, retiros y reactivaciones reúne la alerta prolongada y nuevas políticas de retiro." },
  { type: "Retiro", text: "Se puede exigir o no un motivo obligatorio al retirar un cliente; si es obligatorio mantiene mínimo 10 caracteres." },
  { type: "Historial técnico", text: "Se puede conservar una ficha del plan, router, IP, ONU/NAP o CPE antes de liberar los recursos del cliente retirado." },
  { type: "Reactivación", text: "Se puede permitir o bloquear el flujo Reactivar / volver a registrar para clientes retirados." },
  { type: "Retirados", text: "La tabla muestra la ficha técnica anterior cuando la política de conservación estaba activa al momento del retiro." },
  { type: "Seguridad", text: "El backend valida el motivo y la política de reactivación; el retiro sigue siendo manual y nunca se ejecuta solo por una alerta." },
  { type: "Backup", text: "Se guardaron referencias recuperables de los archivos 1.2.33 antes del cambio." },
];
