/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.56";
export const CHANGELOG = [
  { type: "Temas", text: "Se corrigen los colores internos de todas las ventanas emergentes de Ajustes para que tema claro y oscuro usen superficies, bordes y textos coherentes." },
  { type: "Controles", text: "Inputs, selects, textareas, campos, tablas y placeholders dentro de los modales ahora respetan la paleta activa y muestran un foco visible uniforme." },
  { type: "Tema claro", text: "Se eliminan fondos negros heredados de utilidades oscuras en formularios y tarjetas; se usan blancos, grises azulados y acentos Z-Hub con contraste correcto." },
  { type: "Tema oscuro", text: "Se unifica la paleta azul noche de los modales, incluyendo superficies secundarias, bordes, scrollbar y sombras." },
  { type: "Compatibilidad", text: "La corrección es visual y queda limitada a las ventanas de Ajustes; no cambia datos, backend ni la lógica de guardado/cierre del modal." },
  { type: "Backup", text: "Antes del cambio se creó backup/pre-settings-modal-theme-1.2.55-20260910 desde la versión 1.2.55 publicada." },
];
