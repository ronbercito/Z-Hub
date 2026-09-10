/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.55";
export const CHANGELOG = [
  { type: "Ajustes", text: "Cada tarjeta del tablero abre ahora una ventana emergente compacta sobre la pantalla de Ajustes, sin navegar a una página completa." },
  { type: "Interacción", text: "Hacer clic fuera de la ventana o pulsar Escape la cierra sin guardar cambios." },
  { type: "Guardado", text: "Después de una operación de guardado confirmada por la API, la ventana se cierra automáticamente; las pruebas de utilidad como SMTP no fuerzan el cierre." },
  { type: "Diseño", text: "La ventana limita su ancho y alto, usa scroll interno solo cuando es necesario y se adapta a tema claro, oscuro y pantallas pequeñas." },
  { type: "Compatibilidad", text: "Se mantienen intactas las pantallas y formularios existentes de General, Configuración clientes, Gestión personal, Servidor de correo, Google y accesos en desarrollo." },
  { type: "Backup", text: "Se creó backup/pre-settings-modal-1.2.54-20260910 apuntando al estado 1.2.54 previo a la modificación." },
];
