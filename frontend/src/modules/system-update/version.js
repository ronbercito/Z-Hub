/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.31";
export const CHANGELOG = [
  { type: "Red", text: "La métrica Tráfico de las tarjetas MikroTik se reemplaza por DHCP y muestra las concesiones actualmente en estado bound." },
  { type: "RouterOS", text: "El conteo DHCP se obtiene dentro del snapshot existente del router, sin polling adicional ni migraciones de base de datos." },
  { type: "Compatibilidad", text: "Se conservan CPU, memoria, ping, PPPoE, colas, estados, selección, mapa, edición y eliminación de routers." },
];
