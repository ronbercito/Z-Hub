/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.70";
export const CHANGELOG = [
  { type: "TRIAL", text: "Las licencias de prueba quedan limitadas obligatoriamente a 20 abonados y 30 días, tanto en la web como en el servidor." },
  { type: "Plan TRIAL", text: "Al seleccionar TRIAL el License Center cambia automáticamente el plan a TRIAL, bloquea el selector comercial y muestra capacidad máxima de 20 abonados." },
  { type: "Seguridad", text: "El backend ignora cualquier capacidad enviada por el navegador para una licencia TRIAL y fuerza max_clients=20, evitando alterar el límite desde la API." },
  { type: "Claves", text: "El generador del servidor queda alineado con el formato oficial de 192 bits: ZHUB-AAAA seguido de 48 caracteres hexadecimales aleatorios." },
  { type: "Compatibilidad", text: "Las licencias PAID conservan PLAN_100, PLAN_300, PLAN_500, PLAN_1000 e ILIMITADO; las licencias existentes no se eliminan ni reinicializan." },
  { type: "Backup", text: "Se creó backup/pre-trial-limit-1.2.70-20260910 antes de aplicar esta corrección." },
];
