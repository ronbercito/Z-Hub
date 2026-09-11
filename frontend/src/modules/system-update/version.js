/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.63";
export const CHANGELOG = [
  { type: "Licencia", text: "Se corrige el falso estado LICENCIA NO VÁLIDA cuando existe un archivo privado de licencias pero la clave histórica válida solo está presente en el fallback de compatibilidad." },
  { type: "Prioridad", text: "El registro privado y el fallback se combinan temporalmente; si una misma clave existe en ambos, el registro privado siempre tiene prioridad." },
  { type: "Seguridad", text: "Una licencia marcada INACTIVA o SUSPENDIDA en el registro privado no puede quedar activa por una copia antigua del fallback." },
  { type: "Compatibilidad", text: "Las instalaciones antiguas que aún conservan claves válidas del registro incluido pueden seguir mostrando LICENCIA ACTIVA mientras se completa la migración al License Server." },
  { type: "Backup", text: "Se creó backup/pre-license-status-hotfix-1.2.62-20260910 antes de aplicar la corrección." },
];
