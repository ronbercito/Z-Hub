/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.35";
export const CHANGELOG = [
  { type: "Tráfico", text: "Etapa 3/5: Z-Hub asocia Traffic Flow con cliente, servicio, router e IP y calcula consumo por hora." },
  { type: "Consumo", text: "Los bytes con IP de cliente como origen cuentan como subida y como destino cuentan como bajada; se persisten agregados, no flujos crudos." },
  { type: "Rendimiento", text: "El worker usa caché de identidades, cola acotada y escrituras agrupadas en MariaDB para reducir carga." },
];
