/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.91, aislamiento del módulo de facturación del cliente.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.91";
export const CHANGELOG = [
  { type: "Arquitectura", text: "Facturación del cliente queda encapsulada en un módulo independiente dentro de clientes/editor/billing/." },
  { type: "Estabilidad", text: "Se incorpora un ErrorBoundary exclusivo para Facturación: un error de renderizado del módulo muestra un aviso controlado sin derribar la ficha ni sus demás pestañas." },
  { type: "Estabilidad", text: "El punto de entrada ClientBilling.jsx se conserva como wrapper estable para no alterar la integración existente de ClientDetail." },
  { type: "Mantenimiento", text: "Se mantiene el flujo existente de facturas, pagos, transacciones, saldos y configuración sin cambios de API ni base de datos." },
  { type: "Respaldo", text: "Se creó la rama backup/pre-facturacion-aislada-2026-09-08 antes de aplicar la refactorización." },
  { type: "Nota", text: "El aislamiento protege errores en ejecución; un error de sintaxis/compilación todavía debe corregirse porque afecta al build completo de React." },
];
