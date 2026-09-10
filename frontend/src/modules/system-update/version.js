/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.50";
export const CHANGELOG = [
  { type: "Recuperación", text: "Corrige la Etapa 3/4 para que los equipos heredados de casos creados al retirar clientes muestren las acciones Recuperado y No recuperado." },
  { type: "Compatibilidad", text: "Los estados técnicos instalados/assigned/recovery_pending de casos ya existentes se interpretan visualmente como Pendiente hasta que el equipo sea resuelto." },
  { type: "Equipos", text: "Cada equipo pendiente vuelve a mostrar campo de observación y los botones Recuperado / No recuperado dentro de Gestionar." },
  { type: "Flujo", text: "Al resolver el último equipo, el backend mantiene el cierre automático del caso como Recuperado o No recuperado." },
  { type: "Seguridad", text: "Almacén sigue sin modificarse automáticamente; esta corrección solo completa la Etapa 3/4." },
  { type: "Calidad", text: "Se agrega una regresión específica que exige que estados heredados pendientes conserven visibles las acciones de resolución." },
  { type: "Backup", text: "Antes de la corrección se creó backup/pre-recovery-actions-fix-1.2.49-20260910 desde el HEAD completo de 1.2.49." },
];
