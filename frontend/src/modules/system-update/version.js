/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.2.24.
 * Función: única fuente de verdad de PANEL_VERSION y del changelog de la versión actual.
 * Nota: CHANGELOG contiene únicamente los cambios de esta versión; no acumula versiones anteriores.
 */
export const PANEL_VERSION = "1.2.24";
export const CHANGELOG = [
  { type: "Tema claro", text: "Las pestañas Instalaciones y Registrados ahora usan colores propios compatibles con Z-Hub Claro Suave." },
  { type: "Pestaña activa", text: "La pestaña seleccionada usa un degradado azul/cian limpio, texto e iconos blancos y un badge claro con mayor contraste." },
  { type: "Pestaña inactiva", text: "La pestaña no seleccionada usa fondo azul-gris claro, texto azul oscuro y badge blanco, evitando el gris oscuro que desentonaba con el template." },
  { type: "Compatibilidad", text: "No se modifican lógica de pestañas, filtros, API, base de datos, flujo de alta, Nuevo abonado ni ficha del cliente." },
  { type: "Seguridad", text: "Se respaldó version.js y se registró el blob exacto de Installations.jsx de 1.2.23 en docs/backups/1.2.23/." },
];
