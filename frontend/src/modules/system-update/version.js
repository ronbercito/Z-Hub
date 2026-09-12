/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.33";
export const CHANGELOG = [
  { type: "Tráfico", text: "Etapa 2/5: Z-Hub incorpora collector UDP para Traffic Flow con NetFlow v5, v9 e IPFIX, incluyendo IPv4 e IPv6." },
  { type: "MikroTik", text: "Se agregan endpoints para consultar, configurar o desactivar Traffic Flow en un router seleccionado, sin cambios masivos automáticos." },
  { type: "Validación", text: "El collector informa paquetes, flujos, IPv4/IPv6, duplicados, errores y exportadores antes de iniciar el cálculo de consumo de la Etapa 3." },
];
