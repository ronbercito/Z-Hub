/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.79";
export const CHANGELOG = [
  { type: "Licencias", text: "Cierre endurecido de Etapa 7/7: claves e Installation ID se muestran enmascarados por defecto en el License Center." },
  { type: "Seguridad", text: "Las acciones Copiar conservan el valor real para administradores autenticados sin exponerlo visualmente en tablas o capturas." },
  { type: "Pruebas", text: "Se agregan contratos de regresión para enmascarado, filtros y acciones comerciales; backend y frontend deben pasar CI antes del merge." },
  { type: "Documentación", text: "Se consolida la continuidad únicamente en docs/CONTINUIDAD_Z-HUB.md y se retira el archivo histórico duplicado 1.2.71." },
  { type: "Backup", text: "Se creó backup/pre-stage7-hardening-1.2.79-20260911 antes del cierre final de Etapa 7/7." },
];
