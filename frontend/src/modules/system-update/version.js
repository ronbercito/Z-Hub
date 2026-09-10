/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.25";
export const CHANGELOG = [
  { type: "Clientes", text: "Se agrega Retirar cliente con confirmación, resumen de datos y motivo obligatorio de 10 a 250 caracteres." },
  { type: "Liberación", text: "El retiro limpia primero la configuración MikroTik y luego libera IP, plan, router, NAP/puerto, ONU y asociaciones técnicas; si MikroTik falla, la baja se cancela." },
  { type: "Historial", text: "El cliente no se elimina: pasa a la pestaña Retirados conservando identidad, contacto, dirección, fecha y motivo del retiro." },
  { type: "Reactivación", text: "Retirados incorpora Reactivar / volver a registrar, reutilizando el asistente oficial para asignar un servicio nuevo." },
  { type: "DNI/RUC", text: "Nueva instalación avisa cuando el documento pertenece a un cliente retirado y dirige al flujo de reactivación." },
  { type: "Seguridad", text: "Se creó respaldo recuperable de los archivos 1.2.24 antes de la modificación." },
];
