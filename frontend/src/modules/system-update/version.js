/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.3.8";
export const CHANGELOG = [
  { type: "Licencia", text: "La capacidad ahora se calcula por servicios registrados, no solo por abonados activos." },
  { type: "Estados", text: "Los servicios activos, suspendidos/cortados y pausados continúan consumiendo cupo de licencia." },
  { type: "Servicios", text: "Cada servicio adicional de un abonado consume un cupo independiente; solo la baja definitiva libera capacidad." },
];
