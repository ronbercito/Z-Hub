/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.58";
export const CHANGELOG = [
  { type: "Licencias", text: "Se agrega el License Manager local como única capa interna para leer, normalizar y consultar la licencia de la instalación." },
  { type: "Capacidad", text: "El motor incorpora PLAN_100, PLAN_200, PLAN_800, PLAN_1000 e Ilimitado, además del conteo local de abonados y la decisión can_create_client()." },
  { type: "Trial", text: "Se prepara el Trial de 30 días con acceso completo y sin límite de abonados; todavía no se aplica el bloqueo post-Trial hasta la Etapa 5." },
  { type: "Compatibilidad", text: "Las licencias antiguas que solo contienen LICENCIA/NOMBRE/CORREO/ESTADO se interpretan como pagadas e ilimitadas para no reducir capacidad al actualizar." },
  { type: "Setup", text: "El Install Wizard deja de mantener su propio parser de licencias y usa el License Manager, guardando tipo, plan, límite y fecha de activación cuando corresponde." },
  { type: "Seguridad", text: "Esta Etapa 2 todavía no bloquea el alta de clientes: el control efectivo CLIENT_LIMIT_REACHED se implementará en la Etapa 3." },
  { type: "Backup", text: "Se creó backup/pre-license-stage2-1.2.57-20260910 antes de iniciar los cambios funcionales." },
];
