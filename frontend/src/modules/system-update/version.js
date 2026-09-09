/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.92: corrección definitiva de colores en métricas de clientes para Claro Suave.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.92";
export const CHANGELOG = [
  { type: "Interfaz", text: "Corrección definitiva de las tarjetas Clientes colas simples, Clientes DHCP, Clientes PPPoE y Clientes suspendidos en el tema Claro Suave." },
  { type: "Interfaz", text: "Los cuatro recuadros conservan sus colores diferenciados y texto e iconos blancos también en Claro Suave." },
  { type: "Compatibilidad", text: "La excepción visual se coloca al final de la hoja principal del tema para vencer las reglas globales que neutralizan fondos slate y degradados." },
  { type: "Build", text: "Se reestructura App.js con JSX multilínea para eliminar el error de compilación de producción reportado en ThemedToaster." },
  { type: "Interfaz", text: "Las tarjetas Clientes colas simples, Clientes DHCP, Clientes PPPoE y Clientes suspendidos recuperan sus colores diferenciados en Gestión de Red." },
  { type: "Interfaz", text: "La corrección mantiene texto e iconos en blanco sobre las cuatro tarjetas para conservar el contraste." },
  { type: "Compatibilidad", text: "Los colores se mantienen tanto en el tema oscuro como en Claro Suave sin modificar datos ni funcionalidad." },
  { type: "Routers", text: "Las tarjetas de routers MikroTik actualizan CPU, memoria, ping, identidad, RouterOS, modelo y uptime desde el equipo real al cargar Gestión de Red." },
  { type: "Datos reales", text: "La tarjeta ya no depende únicamente de valores históricos o predeterminados almacenados en el panel para mostrar el estado del MikroTik." },
  { type: "Interfaz", text: "Las estadísticas de las tarjetas se sincronizan usando el mismo mecanismo de prueba de conexión existente, sin modificar las pestañas en vivo de Interfaces, PPPoE, Colas, DHCP o Hotspot." },
  { type: "Interfaz", text: "La ventana de Actualizaciones muestra una barra de desplazamiento vertical visible para recorrer changelogs largos sin reducir el zoom." },
  { type: "Interfaz", text: "La barra de desplazamiento de la ventana de Actualizaciones tiene un estilo visible y usable en navegadores Chromium/Chrome y Firefox." },
  { type: "Interfaz", text: "El menú lateral muestra una barra de desplazamiento vertical cuando sus opciones superan la altura visible de la pantalla." },
  { type: "Google Maps", text: "Se recupera Google Maps y APIs como opción visible dentro del submenú Ajustes." },
  { type: "Login", text: "El formulario de acceso permite al navegador recordar y autocompletar las credenciales mediante los atributos estándar de autofill." },
  { type: "Routers", text: "El resumen muestra clientes de colas simples, DHCP, PPPoE y suspendidos." },
  { type: "Datos reales", text: "Las tres primeras cifras se leen del MikroTik y los suspendidos del panel." },
];
