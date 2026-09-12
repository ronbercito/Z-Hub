/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.32";
export const CHANGELOG = [
  { type: "Tráfico", text: "Etapa 1/5: se crea la base de datos para conservar la relación histórica cliente, servicio, IP y router." },
  { type: "Tráfico", text: "Se prepara la estructura de agregados de descarga, subida y total sin almacenar indefinidamente flujos brutos." },
  { type: "Seguridad", text: "El collector queda deliberadamente pasivo en esta etapa: no se configura ni modifica Traffic Flow en los MikroTik." },
];
