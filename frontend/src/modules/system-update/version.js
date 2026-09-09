/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.89: estadísticas reales de MikroTik en tarjetas de Gestión de Red.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.89";
export const CHANGELOG = [
  { type: "Routers", text: "Las tarjetas de routers MikroTik actualizan CPU, memoria, ping, identidad, RouterOS, modelo y uptime desde el equipo real al cargar Gestión de Red." },
  { type: "Datos reales", text: "La tarjeta ya no depende únicamente de valores históricos o predeterminados almacenados en el panel para mostrar el estado del MikroTik." },
  { type: "Interfaz", text: "Las estadísticas de las tarjetas se sincronizan usando el mismo mecanismo de prueba de conexión existente, sin modificar las pestañas en vivo de Interfaces, PPPoE, Colas, DHCP o Hotspot." },
  { type: "Interfaz", text: "La ventana de Actualizaciones muestra una barra de desplazamiento vertical visible para recorrer changelogs largos sin reducir el zoom." },
  { type: "Interfaz", text: "La barra de desplazamiento de la ventana de Actualizaciones tiene un estilo visible y usable en navegadores Chromium/Chrome y Firefox." },
  { type: "Interfaz", text: "La ventana de Actualizaciones mantiene su tamaño máximo según la pantalla y permite recorrer todo el contenido verticalmente." },
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
