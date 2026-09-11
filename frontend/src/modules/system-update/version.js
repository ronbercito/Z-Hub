/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.67";
export const CHANGELOG = [
  { type: "License Center", text: "Se agrega una interfaz web administrativa al License Server para gestionar clientes/ISP, licencias, instalaciones autorizadas y validaciones." },
  { type: "Clientes", text: "El servidor central incorpora registro de empresas/ISP con contacto, correo, teléfono, RUC/DNI y estado comercial." },
  { type: "Licencias", text: "Desde la web se pueden crear, editar, activar, suspender y eliminar licencias, asignarlas a un cliente y definir tipo, plan y max_clients." },
  { type: "Instalaciones", text: "Se pueden autorizar, editar, suspender, reactivar y eliminar installation_id vinculados a una licencia." },
  { type: "Dashboard", text: "Se agrega resumen de clientes, licencias activas, instalaciones activas y validaciones de las últimas 24 horas, más historial reciente." },
  { type: "Seguridad", text: "La interfaz administrativa reutiliza el token administrativo existente y mantiene la API de validación RS256 separada de la operación del ISP." },
  { type: "Backup", text: "Se creó backup/pre-license-center-web-1.2.67-20260910 antes de iniciar esta ampliación." },
];
