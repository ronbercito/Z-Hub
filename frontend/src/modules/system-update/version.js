/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.18: ajuste del panel derecho del dashboard.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.18";
export const CHANGELOG = [
  { type: "Apariencia", text: "Se corrige primero el panel derecho Resumen del sistema del template Z-Hub Claro según la referencia visual." },
  { type: "Panel derecho", text: "El contenedor pasa a superficie blanca sólida con borde y sombra neutra, sin afectar deliberadamente el gráfico de la izquierda." },
  { type: "Detalles", text: "Las filas del resumen usan fondo gris muy claro, líneas discretas y texto azul tinta para igualar el tono de la referencia." },
  { type: "Efectos", text: "El panel no utiliza glow, neón, gradientes decorativos ni sombras coloreadas." },
  { type: "Compatibilidad", text: "El ajuste queda limitado al template zhub-light; la lógica funcional y el tema oscuro no se modifican deliberadamente." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente el panel desplegado." },
];