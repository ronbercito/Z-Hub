/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.23, corrige el número de versión publicado para que coincida con esta entrega.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.23";
export const CHANGELOG = [
  { type: "Corrección", text: "La versión instalada y la disponible ahora se muestran correctamente." },
  { type: "Estabilidad", text: "El actualizador valida que exista una versión nueva antes de ofrecer la instalación." },
  { type: "Sincronización", text: "La ficha y el listado general conservan los cambios del cliente al guardar." }
];
