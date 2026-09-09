/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.12: transición de repositorio y actualizador dual.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.12";
export const CHANGELOG = [
  { type: "Repositorio", text: "Z-Hub pasa a ser el repositorio principal de desarrollo y actualizaciones del panel." },
  { type: "Actualizador", text: "El panel consulta ahora ronbercito/Z-Hub y ronbercito/mirkohub y selecciona automáticamente la versión más reciente disponible." },
  { type: "Prioridad", text: "Si ambos repositorios publican la misma versión, Z-Hub tiene prioridad; MikroHub queda disponible como fuente de respaldo." },
  { type: "Migración", text: "La instalación cambia el origin del servidor al repositorio desde el que se instala la actualización, permitiendo migrar de MikroHub a Z-Hub sin reinstalar el panel." },
  { type: "Seguridad", text: "Se conserva rollback al commit anterior y se creó una rama de respaldo previa a la transición 1.1.12." },
  { type: "Continuidad", text: "Se actualiza la bitácora maestra indicando que todo trabajo futuro debe realizarse en ronbercito/Z-Hub." },
];
