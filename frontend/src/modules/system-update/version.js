/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.52";
export const CHANGELOG = [
  { type: "Almacén", text: "Se corrigen colores, contraste y fondos del inventario para tema claro y oscuro, incluyendo tabla, encabezados, filas, modal y controles." },
  { type: "Estados", text: "Disponible, En revisión, Averiado y Baja ahora tienen colores diferenciados y legibles en ambos temas." },
  { type: "Recuperación", text: "Los recuadros, controles y estados creados en las Etapas 3 y 4 reciben estilos explícitos para tema claro y oscuro." },
  { type: "Tema claro", text: "Almacén usa encabezado azul, filas blancas/azul muy suave, textos azul oscuro y etiquetas con contraste reforzado." },
  { type: "Tema oscuro", text: "Se mantienen fondos azul noche con textos claros y estados verde, ámbar, rojo y gris claramente diferenciados." },
  { type: "Compatibilidad", text: "No se modifica stock, inventario, clientes ni casos de recuperación; el cambio es únicamente visual." },
  { type: "Backup", text: "Antes del ajuste se creó backup/pre-stage4-ui-colors-1.2.51-20260910 desde la 1.2.51 validada." },
];
