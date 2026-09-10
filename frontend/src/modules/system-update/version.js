/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.29";
export const CHANGELOG = [
  { type: "Clientes", text: "Se agrega alerta visual para clientes que permanecen suspendidos durante un período prolongado." },
  { type: "Política", text: "En Ajustes > Configuración clientes se puede activar la alerta y elegir un umbral de 1 a 6 meses." },
  { type: "Recuperación", text: "La alerta muestra cliente, contacto, dirección, router/ONU, fecha de suspensión y tiempo suspendido para facilitar recuperación de equipos." },
  { type: "Estados", text: "La política aplica únicamente a Suspendidos; los clientes en Pausa temporal no generan esta alerta." },
  { type: "Seguridad", text: "La alerta es informativa: no retira, elimina ni libera recursos automáticamente." },
  { type: "Backup", text: "Se guardaron referencias recuperables de los archivos 1.2.28 antes del cambio." },
];
