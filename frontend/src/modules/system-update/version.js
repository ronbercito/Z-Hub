/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.20: tipografía del menú lateral y resaltado activo.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.20";
export const CHANGELOG = [
  { type: "Apariencia", text: "El menú lateral del template Z-Hub Claro usa una tipografía más firme y compacta, alineada con la referencia visual." },
  { type: "Navegación", text: "La sección seleccionada y los submenús activos utilizan peso 800 para destacar claramente la opción actual." },
  { type: "Contraste", text: "El texto activo utiliza azul tinta sólido para resaltar sin recurrir a brillo, glow o efectos luminosos." },
  { type: "Compatibilidad", text: "El ajuste queda limitado al menú lateral del template zhub-light; no modifica rutas, permisos ni datos." },
  { type: "Validación", text: "Pendiente ejecutar build y comprobar visualmente el menú en el panel desplegado." },
];
