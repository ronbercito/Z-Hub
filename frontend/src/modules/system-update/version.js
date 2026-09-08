/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.85, alerta roja modular de eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.85";
export const CHANGELOG = [
  { type: "Mejora", text: "La eliminación usa una ventana propia de advertencia roja, clara y separada del módulo Clientes." },
  { type: "Seguridad", text: "La ventana conserva el resumen real de servicios, facturas y saldo, y exige escribir SI." },
];
