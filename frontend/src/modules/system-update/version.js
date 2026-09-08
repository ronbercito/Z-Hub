/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.92, corrección de build del módulo de facturación aislado.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.92";
export const CHANGELOG = [
  { type: "Corrección", text: "Se corrige el módulo aislado de Facturación del cliente para usar exactamente la implementación JSX estable que ya había compilado correctamente antes de la extracción." },
  { type: "Estabilidad", text: "Se conserva el wrapper ClientBilling.jsx y el ErrorBoundary exclusivo de Facturación, sin cambios de API ni base de datos." },
  { type: "Mantenimiento", text: "La funcionalidad existente de facturas, pagos, transacciones, saldos y configuración se mantiene sin cambios de negocio." },
  { type: "Validación", text: "La versión 1.0.91 fue restaurada automáticamente por el actualizador después de que el build React detectara un error de sintaxis; 1.0.92 corrige esa causa antes de volver a instalar." },
  { type: "Respaldo", text: "Se mantiene la rama backup/pre-facturacion-aislada-2026-09-08 durante la validación." },
];