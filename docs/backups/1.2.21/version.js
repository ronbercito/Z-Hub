/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.21.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.21";
export const CHANGELOG = [
  { type: "Actualizaciones", text: "El porcentaje visible de instalación ahora avanza de 1% en 1% en lugar de saltar directamente entre hitos como 20% y 70%." },
  { type: "Progreso", text: "Mientras una etapa tarda, el indicador continúa avanzando gradualmente hasta 99% para mostrar que el proceso sigue trabajando." },
  { type: "Finalización segura", text: "El 100% solo se muestra cuando el backend confirma que la actualización terminó correctamente y la versión instalada coincide con la versión objetivo." },
  { type: "Interfaz", text: "La barra acompaña el porcentaje continuo y muestra un mensaje de procesamiento mientras se actualizan los componentes del panel." },
  { type: "Compatibilidad", text: "No se modifican backend, base de datos, Clientes, Instalaciones, facturación ni aprovisionamiento." },
  { type: "Seguridad", text: "Se respaldaron UpdateCenter.jsx y version.js de 1.2.20 en docs/backups/1.2.20/." },
];
