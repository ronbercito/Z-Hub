/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.59";
export const CHANGELOG = [
  { type: "Licencias", text: "Se activa el control real de capacidad de abonados usando el License Manager local preparado en la Etapa 2/7." },
  { type: "Límite", text: "Al alcanzar el máximo contratado, POST /api/clients devuelve CLIENT_LIMIT_REACHED y no crea un abonado adicional." },
  { type: "Reactivación", text: "Reactivar un cliente retirado también verifica capacidad porque vuelve a consumir un cupo; editar clientes ya contabilizados continúa permitido." },
  { type: "Operación", text: "Llegar al límite no bloquea el panel, facturación, MikroTik, OLT ni la administración de abonados existentes; únicamente impide aumentar el número de abonados contabilizados." },
  { type: "Aviso", text: "El backend devuelve un mensaje claro con uso actual y límite contratado; la pantalla de Clientes ya muestra ese detalle al fallar el alta." },
  { type: "Trial", text: "La política de vencimiento del Trial sigue reservada para la Etapa 5; esta entrega aplica exclusivamente límites de capacidad de licencias activas." },
  { type: "Backup", text: "Se creó backup/pre-license-stage3-1.2.58-20260910 antes de activar el control de capacidad." },
];
