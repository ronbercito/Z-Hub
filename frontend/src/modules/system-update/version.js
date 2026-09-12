/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.9";
export const CHANGELOG = [
  { type: "Ajustes", text: "Configuración clientes incorpora Gestión individual por servicio, desactivada por defecto para conservar el comportamiento actual." },
  { type: "Servicios", text: "Al activarla, el servicio principal y los servicios adicionales pueden pausarse, suspenderse/cortarse o reactivarse de forma independiente." },
  { type: "Rendimiento", text: "Las acciones se ejecutan únicamente cuando el operador las solicita; no se agregan sondeos ni procesos permanentes por servicio y la regla de capacidad de licencia se mantiene." },
];
