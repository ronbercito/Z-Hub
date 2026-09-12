/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.4";
export const CHANGELOG = [
  { type: "Licencias", text: "Los planes pagados ya no vencen por tiempo; se controlan por cantidad de abonados activos." },
  { type: "Capacidad", text: "PLAN_100, 300, 500 y 1000 cuentan solo abonados activos; ILIMITADO no tiene tope." },
  { type: "Operación", text: "Al alcanzar el límite solo se bloquean nuevas altas o reactivaciones; el resto del panel sigue funcionando." },
  { type: "Trial", text: "El Trial mantiene 30 días y capacidad máxima de 20 abonados activos." },
];
