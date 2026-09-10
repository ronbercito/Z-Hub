/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.26";
export const CHANGELOG = [
  { type: "Planes", text: "En el alta de clientes, Fibra óptica muestra únicamente planes de fibra e Inalámbrico únicamente planes de radio/inalámbricos." },
  { type: "Cambio de tecnología", text: "Al cambiar entre Fibra e Inalámbrico se limpia el plan seleccionado para evitar conservar un plan incompatible." },
  { type: "Validación", text: "El registro bloquea el guardado si el plan elegido no corresponde a la tecnología seleccionada." },
  { type: "Compatibilidad", text: "No se modifican planes existentes, precios, MikroTik, NAP, redes IPv4, facturación ni aprovisionamiento." },
  { type: "Seguridad", text: "Se guardó un respaldo recuperable de los blobs exactos de 1.2.25 antes del cambio." },
];
