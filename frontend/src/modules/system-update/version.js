/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.88, fuente única de versión del panel.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.88";
export const CHANGELOG = [
  { type: "Interfaz", text: "La fecha de instalación del Nuevo Abonado queda preseleccionada automáticamente con la fecha actual al abrir el registro." },
  { type: "Interfaz", text: "La fecha preseleccionada continúa siendo editable mediante el calendario para registrar una fecha diferente cuando sea necesario." },
  { type: "Seguridad", text: "Se creó un punto de recuperación previo a 1.0.88 mediante una rama backup antes de modificar el flujo de registro." },
  { type: "Arquitectura", text: "La versión del panel continúa administrada desde una única fuente de verdad: frontend/src/modules/system-update/version.js." },
];
