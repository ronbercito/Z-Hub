/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.13: refinamiento visual de baja luminancia.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.13";
export const CHANGELOG = [
  { type: "Apariencia", text: "El template claro reduce nuevamente la luminancia general para disminuir fatiga visual y evitar exceso de blanco." },
  { type: "Diseño", text: "Z-Hub Blanco pasa a mostrarse como Z-Hub Claro Suave, manteniendo el mismo identificador interno para no perder preferencias guardadas." },
  { type: "Paleta", text: "Fondos, tarjetas, campos, bordes, hovers, header y sidebar usan ahora grises azulados más sobrios y sin blanco puro." },
  { type: "Efectos", text: "Se reducen todavía más las sombras y gradientes decorativos del área principal." },
  { type: "Compatibilidad", text: "No se modifica la lógica funcional, la base de datos ni el tema oscuro clásico." },
  { type: "Repositorio", text: "Esta entrega se desarrolla y publica exclusivamente desde ronbercito/Z-Hub; MikroHub permanece solo como fallback legado del actualizador." },
  { type: "Continuidad", text: "Se actualiza la bitácora maestra y se registra la política definitiva de trabajar en ronbercito/Z-Hub de aquí en adelante." },
];
