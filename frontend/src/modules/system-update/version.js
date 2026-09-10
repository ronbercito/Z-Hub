/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.46";
export const CHANGELOG = [
  { type: "Equipos 1/4", text: "Inicia la primera etapa del control opcional de equipos asignados a clientes, sin quitar ni reemplazar funciones existentes." },
  { type: "Ajustes", text: "Agrega en Ajustes / Clientes / Equipos el interruptor Usar módulo de recuperación de equipos; por defecto queda desactivado para conservar el comportamiento actual." },
  { type: "Clientes", text: "Al activar la opción aparece la pestaña Equipos en la ficha del abonado para registrar ONU, router Wi-Fi, CPE, antena, fuente u otros equipos." },
  { type: "Datos", text: "Cada equipo conserva tipo, marca/modelo, serial/MAC, propiedad empresa/cliente, fecha de entrega, estado y observaciones." },
  { type: "Recuperación", text: "El submenú Recuperación se oculta cuando el módulo está desactivado y reaparece al activarlo." },
  { type: "Seguridad", text: "Esta etapa no mueve inventario, no retira clientes y no crea recuperaciones automáticas; esas acciones quedan reservadas para las etapas siguientes." },
  { type: "Backup", text: "Antes de comenzar se creó backup/pre-equipment-stage1-1.2.45-20260910 desde el HEAD completo de 1.2.45." },
];
