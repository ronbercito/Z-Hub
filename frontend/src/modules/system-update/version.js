/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.35";
export const CHANGELOG = [
  { type: "Clientes", text: "Se corrige el listado vacío provocado por una colisión entre rutas estáticas de políticas y /clients/{client_id}." },
  { type: "API", text: "Las rutas especializadas de Clientes se registran antes del CRUD dinámico para que pause-policy y retirement-policy no se interpreten como IDs." },
  { type: "Datos", text: "La corrección no elimina ni modifica clientes, MikroTik, facturas ni recursos técnicos existentes." },
  { type: "Compatibilidad", text: "Se mantienen las configuraciones de Registro y altas, Pausas, Suspensiones, retiros y reactivaciones." },
  { type: "Backup", text: "Se creó respaldo de 1.2.34 antes de corregir el orden de rutas." },
];
