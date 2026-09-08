/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.77, verificación cruzada de servicios y facturación antes de eliminar.
 * Función: define la versión y changelog que el frontend muestra y que el backend consulta.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.77";
export const CHANGELOG = [
  { type: "Corrección", text: "La confirmación de eliminación cruza los servicios con la misma fuente usada por la ficha del cliente." },
  { type: "Corrección", text: "La confirmación de eliminación cruza las facturas con la fuente real de Facturación y filtra por el cliente seleccionado." },
  { type: "Corrección", text: "La alerta ya no debe mostrar 0 servicios o 0 facturas cuando la ficha del cliente contiene información registrada." },
  { type: "Seguridad", text: "La eliminación continúa bloqueada si no se puede verificar correctamente la información previa al borrado." },
  { type: "Corrección", text: "La eliminación definitiva mantiene el modal propio de MikroHub y exige escribir SI para continuar." },
  { type: "Corrección", text: "La potencia óptica de fibra continúa normalizándose a dBm negativo al guardar." },
];
