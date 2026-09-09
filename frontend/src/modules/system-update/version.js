/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.16: ajuste fino del template claro según referencia visual.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.16";
export const CHANGELOG = [
  { type: "Apariencia", text: "El template Z-Hub Claro se alinea al tono de la referencia: fondo gris muy claro, superficies blancas y azul tinta definido." },
  { type: "Contraste", text: "Se corrige el texto deslavado y se conserva el blanco dentro de los KPI de color para mantener contraste real." },
  { type: "Paleta", text: "Se ajustan azul, verde, violeta y azul oscuro a tonos sólidos con saturación moderada y sin aspecto neón." },
  { type: "Detalles", text: "Sidebar, header, tarjetas, tablas, formularios, líneas e iconos usan una separación visual limpia y uniforme." },
  { type: "Efectos", text: "Se eliminan gradientes, glow y sombras coloreadas; las superficies usan únicamente una sombra neutra mínima." },
  { type: "Compatibilidad", text: "El cambio queda limitado a zhub-light; el tema oscuro y la lógica funcional no se modifican deliberadamente." },
  { type: "Validación", text: "Pendiente ejecutar build y validar visualmente el template claro en navegador/servidor." },
];