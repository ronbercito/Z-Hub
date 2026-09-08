/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.73, eliminación definitiva sin confirmación nativa del navegador.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.73";
export const CHANGELOG = [
  { type: "Corrección", text: "La eliminación definitiva de clientes ya no muestra el diálogo nativo del navegador con la dirección IP del servidor." },
  { type: "Seguridad", text: "Toda eliminación de cliente pasa por el modal propio de MikroHub antes de ejecutar el DELETE." },
  { type: "Seguridad", text: "Si existen más de un servicio y facturas pendientes, se mantiene la advertencia prioritaria con confirmación escrita SI." },
  { type: "Mejora", text: "La confirmación normal también muestra cliente, servicios registrados, facturas pendientes y saldo antes de permitir la eliminación." },
  { type: "Corrección", text: "La comprobación previa conserva el bloqueo de seguridad cuando no puede verificar servicios o facturación." },
  { type: "Corrección", text: "La potencia óptica de los servicios de fibra se normaliza automáticamente a dBm negativo; por ejemplo, 14 se guarda como -14 dBm." },
];
