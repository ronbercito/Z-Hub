/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.23: Dashboard claro alineado con la referencia visual aprobada.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.23";
export const CHANGELOG = [
  { type: "Dashboard", text: "El tema Z-Hub Claro muestra ahora tarjetas, gráfico, resumen y tablas sobre superficies blancas limpias." },
  { type: "Gráficos", text: "El área de recaudación y el medidor conservan colores azul y verde, con ejes y tooltip legibles sobre fondo claro." },
  { type: "Interfaz", text: "Se ajustaron bordes, filas, textos y sombras del Dashboard para igualar el estilo claro, sobrio y profesional de la referencia." },
  { type: "Compatibilidad", text: "El ajuste se limita a zhub-light; no cambia datos, rutas, permisos, facturación ni el tema oscuro." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente Dashboard y tablas en el panel desplegado." },
];
