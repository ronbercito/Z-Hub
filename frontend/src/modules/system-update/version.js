/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.33: color funcional para métricas y tablas de Gestión de red.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.33";
export const CHANGELOG = [
  { type: "Gestión de red", text: "CPU, memoria, uptime, latencia, PPPoE y colas reciben tonos suaves diferenciados." },
  { type: "Tráfico", text: "RX/TX y estados UP/DOWN usan azul, verde y rojo más vivos para lectura rápida." },
  { type: "Compatibilidad", text: "El ajuste es visual y exclusivo de zhub-light; no modifica RouterOS, OLT, API, datos, permisos ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente en el panel desplegado." },
];
