/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.27";
export const CHANGELOG = [
  { type: "Clientes", text: "Se agrega Servicio en pausa con duración de 1 a 3 meses y motivo obligatorio." },
  { type: "Días conservados", text: "Al pausar se guardan los días pendientes hasta la próxima fecha de facturación y se devuelven al reactivar." },
  { type: "Reactivación", text: "La pausa vencida se reactiva automáticamente; también puede reactivarse antes desde Clientes > En pausa." },
  { type: "Facturación", text: "Mientras el cliente está en pausa no se generan nuevas facturas mensuales ni se marcan vencimientos automáticos." },
  { type: "Fecha de facturación", text: "En una reactivación manual se puede modificar opcionalmente el día de facturación; si se deja vacío, Z-Hub lo calcula conservando los días pendientes." },
  { type: "Avisos", text: "Cinco días antes del final aparece una alerta interna y un botón para preparar el aviso por WhatsApp." },
  { type: "Seguridad", text: "IP, plan, router, NAP y ONU se conservan durante la pausa; se respaldaron los archivos 1.2.26 antes de modificar." },
];
