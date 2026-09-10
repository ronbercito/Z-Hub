/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.60";
export const CHANGELOG = [
  { type: "Licencias", text: "Se incorpora en Ajustes la tarjeta operativa Licencia Z-Hub con una ventana dedicada para consultar estado, plan y capacidad." },
  { type: "Capacidad", text: "Las licencias pagadas muestran abonados usados, máximo autorizado, disponibles y una barra visual de consumo; Ilimitado se presenta sin vencimiento ni límite." },
  { type: "Trial", text: "El Trial muestra los días restantes de los 30 días de prueba y mantiene indicado que todas las funciones están disponibles sin límite por cantidad de abonados." },
  { type: "Seguridad", text: "La API de licencia entrega la clave enmascarada y los metadatos internos de licencia dejan de exponerse o editarse mediante el endpoint genérico de Ajustes." },
  { type: "Compatibilidad", text: "La Etapa 4 es informativa: no modifica clientes, planes, MikroTik, OLT, facturación ni las reglas de límite implementadas en la Etapa 3." },
  { type: "Backup", text: "Se creó backup/pre-license-stage4-1.2.59-20260910 antes de implementar la interfaz de licencia." },
];
