/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.11: ajuste visual del template Z-Hub Blanco.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.11";
export const CHANGELOG = [
  { type: "Apariencia", text: "Se ajusta el template Z-Hub Blanco para reducir la iluminación general y dejar un acabado más sobrio y cómodo visualmente." },
  { type: "Diseño", text: "Se suavizan fondos, bordes, sombras, hovers y gradientes del tema claro manteniendo la combinación blanco, azul, cian y turquesa." },
  { type: "Compatibilidad", text: "No se modifica la lógica funcional del panel ni el template oscuro clásico; solo se refina el acabado visual del tema claro." },
  { type: "Persistencia", text: "El selector de templates sigue disponible en Ajustes > General y la preferencia del usuario se conserva sin cambios." },
  { type: "Continuidad", text: "Se registra esta corrección visual en el documento maestro de continuidad y se crea un respaldo previo en GitHub." },
];
