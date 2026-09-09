/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.14: rediseño del template claro blanco sólido.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.14";
export const CHANGELOG = [
  { type: "Apariencia", text: "El template Z-Hub Claro usa una base blanca limpia y superficies blancas sólidas, siguiendo la referencia visual aprobada." },
  { type: "Paleta", text: "Los textos principales pasan a tonos azul tinta sólidos y los estados usan colores definidos, visibles y profesionales." },
  { type: "Efectos", text: "Se eliminan gradientes y efectos glow del template claro para evitar el aspecto demasiado luminoso o neón." },
  { type: "Componentes", text: "Header, sidebar, campos, tarjetas, tablas, bordes y estados reciben una presentación clara con separación discreta." },
  { type: "Compatibilidad", text: "El cambio queda limitado a zhub-light; el template oscuro clásico y la lógica funcional permanecen sin cambios deliberados." },
  { type: "Validación", text: "Pendiente ejecutar build y validar visualmente el template claro en el navegador/servidor." },
];
