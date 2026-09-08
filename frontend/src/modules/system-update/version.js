/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.75, corrección definitiva del nombre mostrado en eliminación.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.75";
export const CHANGELOG = [
  { type: "Corrección", text: "La confirmación de eliminación captura el nombre que ya utiliza el listado de clientes, evitando mostrar el ID interno cuando el endpoint del cliente no devuelve el nombre." },
  { type: "Corrección", text: "La eliminación definitiva continúa usando exclusivamente el modal propio de MikroHub, sin diálogos nativos del navegador." },
  { type: "Mejora", text: "La ventana muestra el cliente por su nombre, los servicios registrados, las facturas pendientes y el saldo total pendiente." },
  { type: "Seguridad", text: "La eliminación permanece bloqueada hasta escribir SI y se cancela si no puede verificarse la información previa." },
  { type: "Corrección", text: "La potencia óptica de fibra continúa normalizándose a dBm negativo al guardar; por ejemplo, 14 se almacena como -14 dBm." },
];
