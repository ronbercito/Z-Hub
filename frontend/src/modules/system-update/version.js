/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.30, cierre de ficha al guardar Servicio.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.30";
export const CHANGELOG = [
  { type: "Mejora", text: "Guardar cambios en Servicio cierra inmediatamente la ficha del cliente, igual que las demás pestañas." },
  { type: "Corrección", text: "El centro de actualizaciones detecta cualquier cambio publicado en main por diferencia de commit, aunque version.js no haya sido modificado." },
  { type: "Mejora", text: "La versión publicada sigue mostrando el número y changelog correspondientes al código remoto." },
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
