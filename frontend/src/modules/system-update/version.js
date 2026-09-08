/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.28, selector de ubicación integrado.
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.28";
export const CHANGELOG = [
  { type: "Mejora", text: "La ubicación del cliente abre un selector de Google Maps dentro de MikroHub para mover el marcador, seleccionar el punto y guardar latitud y longitud." },
  { type: "Corrección", text: "La ficha del cliente marca Nombre, DNI/RUC y Celular / WhatsApp como datos obligatorios antes de guardar." },
  { type: "Mejora", text: "Guardar Resumen cierra la ficha inmediatamente después de una actualización exitosa." },
  { type: "Mejora", text: "La ficha se puede cerrar haciendo clic fuera del panel, sin afectar los clics dentro del formulario." },
  { type: "Corrección", text: "Se mantiene el guardado dedicado de Resumen sin reprovisionar el servicio de MikroTik." },
  { type: "Corrección", text: "El inventario y el selector de Servicio calculan las IPs libres con el mismo criterio de red, gateway y broadcast." },
  { type: "Mejora", text: "Servicio muestra solo IPs disponibles de la red elegida y conserva la IP actual del cliente." },
  { type: "Mejora", text: "La caja NAP muestra únicamente puertos libres al editar un abonado." },
  { type: "Registro", text: "Se puede guardar manualmente la potencia óptica inicial de la ONU en dBm." }
];
