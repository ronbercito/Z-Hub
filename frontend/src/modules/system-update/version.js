/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.5: Log claro para creación de servicios adicionales.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.5";
export const CHANGELOG = [
  { type: "Log", text: "La creación de un servicio adicional ahora se registra con un texto claro y ordenado para que el operador entienda exactamente qué se creó." },
  { type: "Servicio", text: "El Log usa los datos reales guardados del servicio: plan, precio mensual, tipo de conexión, tecnología, IP, usuario PPPoE, MikroTik y zona." },
  { type: "Corrección", text: "Se evita mostrar Precio S/. 0.00 o IDs técnicos como nombre de MikroTik o zona cuando el servicio recién creado ya tiene sus datos descriptivos persistidos." },
  { type: "Auditoría", text: "Se mantiene la cuenta autenticada y el rol del operador al final del registro para identificar quién realizó la creación." },
  { type: "Validación", text: "Pendiente de ejecutar build y comprobar visualmente la creación de un servicio adicional en el Log del cliente." },
];
