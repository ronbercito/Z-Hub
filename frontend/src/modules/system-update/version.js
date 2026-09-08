/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.51, recibo adelantado por servicio adicional y carga optimizada de potencia ONU.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.51";
export const CHANGELOG = [
  { type: "Mejora", text: "Al crear un servicio adicional se genera automáticamente un recibo pendiente por el importe de ese servicio." },
  { type: "Mejora", text: "El recibo adicional queda identificado como Pago adelantado - Servicio 2, Servicio 3, etc., y actualiza la deuda del cliente." },
  { type: "Rendimiento", text: "La consulta de potencia óptica de servicios de fibra se realiza en paralelo entre las OLT para reducir la espera al abrir Servicios." },
  { type: "Corrección", text: "Las colas de servicios mantienen el formato NOMBRE | PLAN | serv N y el DNI continúa identificando la cola." },
];
