/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.54";
export const CHANGELOG = [
  { type: "Corrección", text: "Se corrige la navegación de Ajustes: el menú lateral ya no fuerza General y ahora abre realmente la portada visual de módulos." },
  { type: "Ajustes", text: "Al seleccionar Ajustes se muestra el tablero aprobado con tarjetas, iconos, estados y animaciones hover." },
  { type: "Menú lateral", text: "Se elimina únicamente el despliegue largo de subopciones de Ajustes; las secciones siguen accesibles desde las tarjetas del tablero." },
  { type: "Navegación", text: "Al entrar a una tarjeta, Ajustes permanece resaltado en el menú lateral y se abre la pantalla funcional existente correspondiente." },
  { type: "Compatibilidad", text: "No se elimina ninguna configuración ni módulo; solo cambia la forma de acceso a Ajustes y se conserva toda la lógica existente." },
  { type: "Backup", text: "Antes de corregir se creó backup/pre-settings-home-fix-1.2.53-20260910 desde la 1.2.53 publicada." },
];
