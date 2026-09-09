/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.87: barra de desplazamiento visible en la ventana de actualizaciones.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.87";
export const CHANGELOG = [
  { type: "Interfaz", text: "La ventana de Actualizaciones muestra una barra de desplazamiento vertical para recorrer changelogs largos sin reducir el zoom." },
  { type: "Interfaz", text: "La ventana de Actualizaciones permite desplazarse verticalmente cuando el changelog es más largo que el espacio disponible en pantalla." },
  { type: "Interfaz", text: "El encabezado y los botones de la ventana de Actualizaciones se mantienen accesibles mientras se recorre el contenido." },
  { type: "Interfaz", text: "El menú lateral muestra una barra de desplazamiento vertical cuando sus opciones superan la altura visible de la pantalla." },
  { type: "Navegación", text: "El submenú Ajustes puede recorrerse de arriba hacia abajo sin reducir el zoom del navegador." },
  { type: "Navegación", text: "El encabezado, la cuenta del usuario y Cerrar sesión permanecen fijos mientras se desplaza el menú." },
  { type: "Google Maps", text: "Se recupera Google Maps y APIs como opción visible dentro del submenú Ajustes para configurar la clave de Maps JavaScript API." },
  { type: "Configuración", text: "El acceso Google Maps conserva la configuración existente y permite guardar la clave desde Ajustes sin cambiar el funcionamiento del mapa." },
  { type: "Login", text: "El formulario de acceso permite al navegador recordar y autocompletar las credenciales mediante los atributos estándar de autofill." },
  { type: "Seguridad", text: "La contraseña no se guarda en localStorage por Z-Hub; el administrador de credenciales del navegador gestiona el recuerdo de contraseña." },
  { type: "Licencia", text: "El registro de licencias ahora usa un archivo de texto sencillo con licencia, nombre, correo y estado." },
  { type: "Licencia", text: "Se puede agregar o desactivar una licencia editando un bloque de texto sin modificar código." },
  { type: "Seguridad", text: "El registro de licencias se mantiene en almacenamiento privado del servidor y no se publica con el panel." },
  { type: "Configuración", text: "El asistente inicial identifica al titular de la licencia validada antes de crear el administrador." },
  { type: "Seguridad", text: "Las instalaciones nuevas ya no crean ni muestran credenciales administrativas predeterminadas." },
  { type: "Routers", text: "El resumen ahora muestra clientes de colas simples, DHCP, PPPoE y suspendidos." },
  { type: "Datos reales", text: "Las tres primeras cifras se leen del MikroTik y los suspendidos del panel." },
];
