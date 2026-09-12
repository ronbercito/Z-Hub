/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.30";
export const CHANGELOG = [
  { type: "Red", text: "La métrica Tráfico de las tarjetas MikroTik se reemplaza por DHCP para mostrar cuántas concesiones están actualmente en estado bound." },
  { type: "RouterOS", text: "El snapshot reutiliza la conexión existente al MikroTik y consulta las leases DHCP sin agregar polling continuo ni migraciones de base de datos." },
  { type: "Compatibilidad", text: "Se conservan CPU, memoria, ping, PPPoE, colas, estados, selección, mapa, edición y eliminación de routers." },
];
