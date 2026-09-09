/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.17: ajuste final del template claro según referencia.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.17";
export const CHANGELOG = [
  { type: "Apariencia", text: "El template Z-Hub Claro se ajusta nuevamente a la referencia visual aprobada." },
  { type: "Paleta", text: "Se corrigen fondo, superficies, azul tinta, grises y colores de estado para reducir la luminosidad y mantener saturación sobria." },
  { type: "Detalles", text: "Se afinan bordes, divisores, formularios, navegación, tarjetas, iconos y sombras para una apariencia administrativa limpia." },
  { type: "Efectos", text: "El template claro no utiliza gradientes decorativos, glow, neón ni sombras coloreadas." },
  { type: "Compatibilidad", text: "El cambio queda limitado a zhub-light; el tema oscuro y la lógica funcional no se modifican deliberadamente." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente el panel desplegado después de instalar la actualización." },
];