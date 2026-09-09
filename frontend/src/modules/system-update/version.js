/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.15: tema claro sobrio sin brillo.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.15";
export const CHANGELOG = [
  { type: "Apariencia", text: "El template Z-Hub Claro adopta el mismo tono visual de la referencia aprobada: blanco limpio, azul tinta y color sólido." },
  { type: "Brillo", text: "Se eliminan por completo glow, sombras coloreadas, filtros luminosos y gradientes del template claro." },
  { type: "Paleta", text: "Los textos, líneas, bordes y estados usan tonos sólidos y sobrios con saturación controlada." },
  { type: "Componentes", text: "Header, sidebar, tarjetas, formularios, tablas, botones y superficies quedan alineados a una presentación plana y profesional." },
  { type: "Compatibilidad", text: "El cambio queda limitado a zhub-light; el tema oscuro clásico y la lógica funcional permanecen sin cambios deliberados." },
  { type: "Validación", text: "Pendiente ejecutar build y validar visualmente el template claro en el navegador/servidor." },
];