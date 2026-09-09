/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.32: Gestión de red adaptada a la presentación clara.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.32";
export const CHANGELOG = [
  { type: "Gestión de red", text: "Las tarjetas de equipos, métricas, pestañas y tablas MikroTik/OLT se presentan ahora sobre superficies claras." },
  { type: "Interfaz", text: "Se aplican bordes azul-gris, textos azul tinta y tipografía reforzada como en el Dashboard." },
  { type: "Compatibilidad", text: "No se modifican conexiones RouterOS/OLT, datos, API, rutas, permisos, autenticación ni el tema oscuro." },
  { type: "Validación", text: "Revisión estática completada; falta comprobar visualmente y validar lecturas en el panel desplegado." },
];
