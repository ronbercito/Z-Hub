/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.71: avatar de cuenta activa con color amigable.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 * Regla: Z-Hub es el repositorio principal desde 1.1.12; MikroHub queda como respaldo legado.
 */
export const PANEL_VERSION = "1.1.71";
export const CHANGELOG = [
  { type: "Interfaz", text: "El avatar de la cuenta activa en el menú lateral usa un degradado azul, turquesa y violeta con borde y sombra suaves." },
  { type: "Tema claro", text: "El nombre y rol de la cuenta tienen contraste reforzado en Claro Suave." },
  { type: "Compatibilidad", text: "La inicial, usuario, rol, permisos, navegación y sesión no cambian." },
  { type: "Validación", text: "Revisión estática completada sobre perfil lateral, lectura de usuario/rol y estilos de ambos temas." },
];
