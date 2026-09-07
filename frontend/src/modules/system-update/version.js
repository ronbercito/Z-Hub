/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-07 — versión 1.0.14, pestaña Servicio completamente editable.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.14";
export const CHANGELOG = [
  { type: "Nuevo", text: "Pestaña Servicio completamente editable: modifica plan, router, tipo conexión, red IPv4, fibra (NAP, puerto, ONU) e inalámbrico (equipo, antena, IP administración)." },
  { type: "Mejora", text: "Validaciones en tiempo real para plan, router, tecnología, NAP y equipos según tipo de conexión." },
  { type: "Corrección", text: "Sincronización automática de datos después de guardar cambios en el servicio." }
];
