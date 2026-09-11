/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.65";
export const CHANGELOG = [
  { type: "Licencia", text: "Se corrige la causa por la que una licencia histórica válida podía seguir mostrando LICENCIA NO VÁLIDA después de actualizar: el fallback anterior se eliminaba del disco durante el instalador." },
  { type: "Runtime", text: "El catálogo de compatibilidad ahora viaja dentro del backend como license_fallback.txt y permanece disponible después de instalar o actualizar Z-Hub." },
  { type: "Prioridad", text: "El registro privado /etc/zhub/licencia/licencias.txt conserva prioridad cuando define la misma clave; estados INACTIVA o SUSPENDIDA siguen bloqueando correctamente." },
  { type: "Compatibilidad", text: "La clave histórica ZHUB-2026-DEMO-002 vuelve a poder resolverse desde el fallback cuando no existe en el registro privado del servidor." },
  { type: "Backup", text: "Se creó backup/pre-license-runtime-fallback-1.2.65-20260910 antes de aplicar la corrección funcional." },
];
