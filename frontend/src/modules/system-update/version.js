/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.43, formato final de comentarios MikroTik.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.43";
export const CHANGELOG = [
  { type: "Corrección", text: "Los comentarios de las colas simples quedan como NOMBRE | PLAN, sin incluir el DNI en el comentario." },
  { type: "Mejora", text: "Los servicios adicionales quedan como NOMBRE | PLAN | serv 2, serv 3, etc.; el DNI se conserva en el nombre de la cola." },
];
