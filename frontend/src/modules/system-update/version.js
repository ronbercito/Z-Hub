/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.53";
export const CHANGELOG = [
  { type: "Ajustes", text: "Al seleccionar Ajustes se abre un tablero visual de módulos inspirado en el diseño aprobado, sin eliminar las pantallas de configuración existentes." },
  { type: "Interacción", text: "Cada tarjeta incorpora animación al pasar el mouse, realce visual, icono y tooltip con una descripción breve de su función." },
  { type: "Estados", text: "Las opciones muestran Operativo cuando la pantalla funcional ya existe y En desarrollo cuando el acceso todavía conduce a una sección preparada." },
  { type: "Navegación", text: "Las tarjetas abren las mismas secciones existentes; Configuración clientes conserva su módulo independiente y el resto reutiliza Settings." },
  { type: "Temas", text: "El nuevo tablero adapta tarjetas, textos, estados, tooltips y resúmenes a los temas claro y oscuro de Z-Hub." },
  { type: "Compatibilidad", text: "No se elimina ningún menú, configuración, dato, cliente, inventario ni función existente; el cambio agrega una nueva portada para Ajustes." },
  { type: "Backup", text: "Antes del cambio se creó backup/pre-settings-dashboard-1.2.52-20260910 desde la 1.2.52 publicada." },
];
