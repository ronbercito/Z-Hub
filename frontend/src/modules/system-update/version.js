/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.47";
export const CHANGELOG = [
  { type: "Equipos", text: "Etapa 2/4: al retirar un cliente, Z-Hub detecta los equipos de propiedad de la empresa que siguen asignados al abonado." },
  { type: "Retiro", text: "Se agrega una vista previa de equipos pendientes mediante la API de retiro para que la interfaz pueda advertir qué equipos deben recuperarse." },
  { type: "Recuperación", text: "Al confirmar el retiro se crea automáticamente un caso de Recuperación con los equipos asignados y se evita generar casos duplicados abiertos." },
  { type: "Trazabilidad", text: "Los equipos enviados a recuperación cambian a estado recovery_pending y el retiro registra en el Log cuántos equipos quedaron pendientes." },
  { type: "Compatibilidad", text: "Si el módulo de equipos está desactivado o el cliente no tiene equipos de la empresa asignados, el retiro conserva exactamente el comportamiento anterior." },
  { type: "Seguridad", text: "La etapa no mueve stock de Almacén ni marca equipos como recuperados; esas acciones quedan reservadas para etapas posteriores." },
  { type: "Backup", text: "Antes de la etapa 2 se creó backup/pre-equipment-stage2-1.2.46-20260910 desde el estado completo de 1.2.46." },
];
