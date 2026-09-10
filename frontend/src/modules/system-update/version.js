/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.33";
export const CHANGELOG = [
  { type: "Pausas de servicio", text: "Se habilitan preferencias funcionales para duración, avisos y reactivación de pausas temporales." },
  { type: "Duración", text: "El administrador puede limitar la pausa máxima a 1, 2 o 3 meses; backend y formulario respetan el límite." },
  { type: "Avisos", text: "Se puede elegir aviso previo de 3, 5 o 7 días y activar/desactivar el botón Avisar WhatsApp." },
  { type: "Reactivación", text: "Se puede permitir o bloquear la reactivación anticipada y decidir si al vencer se reactiva automáticamente o queda pendiente de confirmación manual." },
  { type: "Facturación", text: "Se puede permitir o impedir el cambio manual del día de facturación al reactivar; los días guardados continúan devolviéndose." },
  { type: "Seguridad", text: "Las restricciones también se validan en backend para que no puedan omitirse desde la interfaz." },
  { type: "Backup", text: "Se guardaron referencias recuperables de los archivos 1.2.32 antes del cambio." },
];
