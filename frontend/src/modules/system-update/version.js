/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.44";
export const CHANGELOG = [
  { type: "Clientes", text: "Restaura en Estado / Deuda el resaltado rojo cuando el abonado tiene monto pendiente." },
  { type: "Facturas", text: "Vuelve a mostrar junto al total una burbuja con la cantidad de facturas pendientes del cliente." },
  { type: "Servicios múltiples", text: "El indicador usa el saldo total agregado del cliente, por lo que contempla las facturas pendientes de todos sus servicios." },
  { type: "Sin deuda", text: "Cuando no existen pendientes se mantiene S/. 0.00 en tono neutro y no se muestra contador rojo." },
  { type: "Calidad", text: "Se agrega una regresión para evitar que vuelvan a desaparecer el contador y el resaltado de deuda." },
  { type: "Backup", text: "Antes del cambio se creó backup/pre-client-debt-display-1.2.43-20260910 desde el estado completo previo de 1.2.43." },
];
