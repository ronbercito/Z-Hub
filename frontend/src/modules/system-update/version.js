/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.91, columnas de facturación del cliente ordenables.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Recibe de: no recibe datos.
 * Entrega a: componentes frontend que importen PANEL_VERSION/CHANGELOG y backend/app/modules/system_update/router.py, que consulta este mismo archivo desde Git.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí; no se deben duplicar números de versión en otros módulos.
 */
export const PANEL_VERSION = "1.0.91";
export const CHANGELOG = [
  { type: "Facturación", text: "Las columnas Recibo, Servicio, Período, Monto, Vencimiento y Estado de la facturación del cliente ahora son completamente cliqueables." },
  { type: "Facturación", text: "Cada columna permite alternar entre orden ascendente y descendente con indicadores visuales de flecha." },
  { type: "Facturación", text: "Monto y Vencimiento utilizan ordenamiento numérico/cronológico; Estado usa un orden operativo definido para facilitar la revisión de cobranzas." },
  { type: "Interfaz", text: "El encabezado activo queda resaltado visualmente y muestra la dirección actual del ordenamiento." },
  { type: "Interfaz", text: "El ordenamiento se realiza sobre las facturas ya cargadas y respeta los filtros y la búsqueda existentes." },
];
