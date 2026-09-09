/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.1.10: identidad Z-Hub y selector de templates visuales.
 * Función: única fuente de verdad de PANEL_VERSION y CHANGELOG para frontend y sistema de actualización.
 * Regla: el ciclo 1.1.x continúa después de 1.0.99.
 */
export const PANEL_VERSION = "1.1.10";
export const CHANGELOG = [
  { type: "Identidad", text: "La identidad visible del producto cambia de MikroHub a Z-Hub sin renombrar rutas, repositorio ni claves internas necesarias para compatibilidad." },
  { type: "Apariencia", text: "Ajustes > General incorpora un selector entre el template oscuro actual y el nuevo template Z-Hub Blanco con azul, cian y turquesa." },
  { type: "Persistencia", text: "El template elegido se guarda en la configuración del sistema y se aplica también al inicio de sesión y a las sesiones siguientes." },
  { type: "Diseño", text: "Se incorpora un logotipo vectorial Z-Hub por defecto cuando no existe un logo personalizado del ISP." },
  { type: "Seguridad", text: "La actualización visual no modifica clientes, facturación, MikroTik, OLT, permisos ni rutas de backend." },
  { type: "Respaldo", text: "Se creó una rama de respaldo previa a la actualización para poder volver al estado 1.1.9 si fuera necesario." },
];
