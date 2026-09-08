/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.74, detalle correcto de cliente, servicios y deuda en eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.74";
export const CHANGELOG = [
  { type: "Corrección", text: "La confirmación de eliminación muestra el nombre real del cliente y no su ID interno." },
  { type: "Mejora", text: "La ventana de eliminación lista los servicios registrados del cliente, incluyendo el servicio principal y los servicios adicionales con su plan." },
  { type: "Mejora", text: "La sección de facturación indica la cantidad de facturas pendientes y el monto total pendiente de pago." },
  { type: "Seguridad", text: "La eliminación definitiva continúa bloqueada hasta que el operador escriba SI en la confirmación." },
  { type: "Corrección", text: "La eliminación definitiva de clientes no utiliza dialogs nativos del navegador ni muestra la dirección IP del servidor." },
  { type: "Corrección", text: "La potencia óptica de los servicios de fibra se normaliza automáticamente a dBm negativo; por ejemplo, 14 se guarda como -14 dBm." },
];
