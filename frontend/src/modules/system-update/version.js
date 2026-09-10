/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.57";
export const CHANGELOG = [
  { type: "Gestión personal", text: "Se corrigen los colores de los botones de permisos Ver, Crear, Editar, Eliminar, Suspender, Operar, Cobrar, Reportes y Enviar dentro de la ventana de Gestión personal." },
  { type: "Tema claro", text: "Los permisos inactivos dejan de usar fondo oscuro: ahora muestran superficie clara, borde azul suave y texto legible; los permisos activos usan acento cyan claramente diferenciado." },
  { type: "Tema oscuro", text: "Los permisos mantienen una paleta azul noche coherente, con mejor contraste entre estado normal, activo y hover." },
  { type: "Compatibilidad", text: "La corrección es exclusivamente visual y no cambia roles, permisos guardados, API, backend ni lógica de autorización." },
  { type: "Backup", text: "Se creó backup/pre-staff-theme-1.2.56-20260910 desde el estado publicado de 1.2.56 antes de aplicar la corrección." },
];
