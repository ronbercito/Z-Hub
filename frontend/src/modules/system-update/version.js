/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.61";
export const CHANGELOG = [
  { type: "Trial", text: "Se activa el Trial real de 30 días con acceso completo durante la prueba y conteo exacto de días restantes." },
  { type: "Vencimiento", text: "Al finalizar el Trial, Z-Hub conserva todos los datos y pasa a modo consulta: lectura y acceso continúan disponibles, mientras las operaciones de escritura quedan bloqueadas." },
  { type: "Activación", text: "El administrador puede activar una licencia pagada desde Ajustes → Licencia Z-Hub sin reinstalar ni perder información; login, logout y actualización del sistema siguen disponibles aunque el Trial haya vencido." },
  { type: "Avisos", text: "La cartilla de licencia muestra inicio, fin, días restantes y avisos reforzados cuando faltan 7, 3 y 1 día, además del estado Trial finalizado." },
  { type: "Compatibilidad", text: "Se corrige el falso estado LICENCIA NO VÁLIDA en instalaciones ya activadas cuando la clave desaparece del archivo fallback durante una actualización; una licencia marcada explícitamente inactiva sigue invalidándose." },
  { type: "Seguridad", text: "La activación local solo acepta licencias pagadas activas y requiere rol administrador; esta fuente local será reemplazada por el servidor de licencias en la Etapa 6." },
  { type: "Backup", text: "Se creó backup/pre-license-stage5-1.2.60-20260910 antes de implementar la Etapa 5/7." },
];
