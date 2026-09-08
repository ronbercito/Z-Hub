/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.98, navegación de Facturación resaltada.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: para cambiar la versión del panel se modifica únicamente PANEL_VERSION aquí.
 */
export const PANEL_VERSION = "1.0.98";
export const CHANGELOG = [
  { type: "Facturación", text: "La navegación interna del cliente ahora usa pestañas grandes, visibles y diferenciadas para Facturas, Transacciones, Saldos y Configuración." },
  { type: "Interfaz", text: "La pestaña activa queda resaltada con icono, fondo luminoso, borde y una línea cian para ubicar rápidamente la sección abierta." },
  { type: "Diseño", text: "Se adopta el estilo visual solicitado: panel oscuro MikroHub, tarjetas redondeadas, acentos cian y estados de facturación con colores diferenciados." },
  { type: "Compatibilidad", text: "El cambio es visual y mantiene los endpoints, lógica de facturas, pagos, saldos y configuración existentes." },
  { type: "Validación", text: "Pendiente de ejecutar build React y validar visualmente las cuatro pestañas en el panel después del despliegue." },
];
