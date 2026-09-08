/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.71, refinamiento visual de la alerta prioritaria de eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.71";
export const CHANGELOG = [
  { type: "Seguridad", text: "La eliminación definitiva de un cliente verifica sus servicios y facturación antes de ejecutar la operación." },
  { type: "Seguridad", text: "Si el cliente tiene más de un servicio y facturas pendientes, se muestra una alerta detallada y exige escribir SI para continuar." },
  { type: "Mejora", text: "La alerta prioritaria de eliminación ahora utiliza un diseño rojo elegante y discreto, integrado con el estilo oscuro del panel." },
  { type: "Mejora", text: "La advertencia conserva contraste, jerarquía visual y botones claros sin saturar la interfaz con rojo intenso." },
  { type: "Corrección", text: "La potencia óptica de los servicios de fibra se normaliza automáticamente a dBm negativo al guardar; por ejemplo, 14 se guarda como -14 dBm." },
  { type: "Mejora", text: "Se mantienen los valores que ya vienen expresados en negativo y se aplican los umbrales visuales de potencia óptica." },
];
