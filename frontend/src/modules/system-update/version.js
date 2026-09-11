/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.68";
export const CHANGELOG = [
  { type: "Claves automáticas", text: "El License Center genera claves únicas con formato ZHUB-AAAA-XXXXXXXX desde el servidor y permite regenerarlas antes de guardar." },
  { type: "Clientes", text: "Al seleccionar Cliente / ISP, Titular y Correo se completan automáticamente desde la ficha del cliente y siguen siendo editables." },
  { type: "Planes", text: "Los planes comerciales quedan normalizados a PLAN_100, PLAN_300, PLAN_500, PLAN_1000 e ILIMITADO; la capacidad se completa y valida automáticamente en servidor y web." },
  { type: "TRIAL", text: "Las licencias TRIAL reciben vencimiento automático de 30 días, se bloquean al vencer y el JWT nunca extiende la gracia más allá del vencimiento." },
  { type: "Estados", text: "Las licencias incorporan estado REVOCADA además de ACTIVA y SUSPENDIDA para control comercial desde el License Center." },
  { type: "Compatibilidad", text: "La base SQLite existente se conserva; expires_at se agrega mediante migración no destructiva al iniciar el License Server." },
  { type: "Backup", text: "Se creó backup/pre-license-center-automation-1.2.68-20260910 antes de aplicar estas mejoras." },
];
