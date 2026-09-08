/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.90, feedback visual persistente al comprobar actualizaciones.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.90";
export const CHANGELOG = [
  { type: "Interfaz", text: "El botón Comprobar mantiene un estado visual claramente activo mientras busca actualizaciones." },
  { type: "Interfaz", text: "Durante la comprobación se muestra giro, pulso, resplandor, elevación y puntos animados para confirmar que el clic fue recibido." },
  { type: "Interfaz", text: "La búsqueda mantiene el feedback visible al menos unos instantes aunque el servidor responda muy rápido." },
  { type: "Interfaz", text: "La ventana indica explícitamente que está consultando el servidor y bloquea comprobaciones repetidas mientras espera la respuesta." },
  { type: "Interfaz", text: "La versión del panel continúa administrada desde una única fuente de verdad: frontend/src/modules/system-update/version.js." },
];
