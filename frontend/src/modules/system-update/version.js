/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-09 — versión 1.1.93: restauración de la capa completa de tema claro sin afectar las métricas coloreadas.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.1.93";
export const CHANGELOG = [
  { type: "Tema claro", text: "Se restaura la hoja completa de estilos de Claro Suave que había sido recortada durante la corrección anterior." },
  { type: "Gestión de Red", text: "Las tarjetas y paneles vuelven a utilizar la apariencia completa del tema Claro Suave, sin heredar superficies oscuras del tema clásico." },
  { type: "Interfaz", text: "Las tarjetas Clientes colas simples, Clientes DHCP, Clientes PPPoE y Clientes suspendidos mantienen sus cuatro colores diferenciados en ambos temas." },
  { type: "Compatibilidad", text: "La corrección es exclusivamente visual y no modifica datos, consultas, credenciales ni funcionalidad de MikroTik/OLT." },
  { type: "Interfaz", text: "Corrección definitiva de las tarjetas Clientes colas simples, Clientes DHCP, Clientes PPPoE y Clientes suspendidos en el tema Claro Suave." },
  { type: "Interfaz", text: "Los cuatro recuadros conservan sus colores diferenciados y texto e iconos blancos también en Claro Suave." },
  { type: "Compatibilidad", text: "La excepción visual se coloca al final de la hoja principal del tema para vencer las reglas globales que neutralizan fondos slate y degradados." },
  { type: "Build", text: "Se reestructura App.js con JSX multilínea para eliminar el error de compilación de producción reportado en ThemedToaster." },
  { type: "Routers", text: "Las tarjetas de routers MikroTik actualizan CPU, memoria, ping, identidad, RouterOS, modelo y uptime desde el equipo real al cargar Gestión de Red." },
  { type: "Interfaz", text: "Las estadísticas de las tarjetas se sincronizan usando el mismo mecanismo de prueba de conexión existente, sin modificar las pestañas en vivo." },
  { type: "Interfaz", text: "La ventana de Actualizaciones muestra una barra de desplazamiento vertical visible para recorrer changelogs largos sin reducir el zoom." },
  { type: "Google Maps", text: "Se recupera Google Maps y APIs como opción visible dentro del submenú Ajustes." },
  { type: "Login", text: "El formulario de acceso permite al navegador recordar y autocompletar las credenciales mediante los atributos estándar de autofill." },
];
