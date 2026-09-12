/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.34";
export const CHANGELOG = [
  { type: "Tráfico", text: "Hotfix de Etapa 2/5: el backend usa una sola instancia de Uvicorn para que exista un único collector UDP Traffic Flow." },
  { type: "Estabilidad", text: "Se evita que dos workers intenten abrir el mismo puerto 2055 o repartan estadísticas de recepción entre procesos distintos." },
  { type: "Validación", text: "El collector continúa desactivado por defecto; la prueba real con un MikroTik se habilita únicamente de forma explícita." },
];
