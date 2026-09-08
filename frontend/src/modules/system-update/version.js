/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.94, ordenamiento de Facturación del cliente.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.94";
export const CHANGELOG = [
  { type: "Funcionalidad", text: "Los encabezados Recibo, Servicio, Período, Monto, Vencimiento y Estado de Facturación ahora permiten ordenar la tabla." },
  { type: "Interacción", text: "Cada encabezado alterna entre orden ascendente y descendente y muestra un indicador visual del sentido activo." },
  { type: "Estabilidad", text: "El ordenamiento se implementa como capa independiente dentro del módulo aislado de Facturación; no modifica API, base de datos ni lógica de facturas." },
  { type: "Compatibilidad", text: "La columna Acciones no es ordenable y las filas auxiliares de pago permanecen asociadas a su factura al ordenar." },
  { type: "Respaldo", text: "Se mantiene la rama backup/pre-facturacion-aislada-2026-09-08 durante la validación." },
];
