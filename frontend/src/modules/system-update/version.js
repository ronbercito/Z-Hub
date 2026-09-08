/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.93, corrección de ruta del contexto en facturación aislada.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.93";
export const CHANGELOG = [
  { type: "Corrección", text: "Se corrige la ruta del AuthContext utilizada por el módulo aislado de Facturación para que el build React resuelva correctamente el contexto transversal." },
  { type: "Estabilidad", text: "Se conserva el wrapper ClientBilling.jsx y el ErrorBoundary exclusivo de Facturación, sin cambios de API ni base de datos." },
  { type: "Mantenimiento", text: "La funcionalidad existente de facturas, pagos, transacciones, saldos y configuración se mantiene sin cambios de negocio." },
  { type: "Validación", text: "La versión 1.0.92 fue revertida por el actualizador al detectar Module not found para AuthContext durante el build; 1.0.93 corrige esa causa." },
  { type: "Respaldo", text: "Se mantiene la rama backup/pre-facturacion-aislada-2026-09-08 durante la validación." },
];