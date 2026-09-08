/**
 * Archivo: frontend/src/modules/system-update/version.js
 * Actualización: 2026-09-08 — versión 1.0.18 con módulo de Documentos (Contratos, PDFs, Notas).
 * Función: define la versión y changelog que el frontend muestra y que el backend compara.
 * Recibe de: no recibe datos; UpdateCenter.jsx y system_update/router.py leen este archivo.
 * Entrega a: el centro de actualizaciones PANEL_VERSION y CHANGELOG.
 */
export const PANEL_VERSION = "1.0.18";
export const CHANGELOG = [
  { type: "Documentos", text: "Nuevo módulo Documentos en ficha del cliente con gestión profesional de contratos, PDFs y notas." },
  { type: "Documentos", text: "Gestión de Contratos: crear, ver estado de firma, plantillas (CONTRATO/ADDENDUM/ACTA), duración configurable." },
  { type: "Documentos", text: "Subida de PDFs: carga de documentos hasta 10MB con título, descripción y descarga directa." },
  { type: "Documentos", text: "Sistema de Notas: agregar y listar notas por cliente (máx 1000 caracteres) con autor y fecha." },
  { type: "Documentos", text: "Almacenamiento seguro: organizado por cliente (storage/clients/{id}/documents/) con URLs públicas descargables." },
  { type: "Documentos", text: "Validaciones completas: permisos por rol, tipos de archivo, tamaño máximo, contenido seguro." },
  { type: "Backend", text: "3 nuevos modelos SQLAlchemy: ClientContract, ClientDocument, ClientNote en MariaDB." },
  { type: "Backend", text: "5 nuevos endpoints: GET /documents, POST /documents/contracts, /documents/pdfs, /documents/notes, GET /documents/{id}." },
  { type: "Comunicaciones", text: "Nuevo módulo Email y SMS con historial completo de envíos por cliente." },
  { type: "Comunicaciones", text: "Modal para enviar nuevos correos con plantillas (Recordatorio, Factura, Bienvenida)." },
  { type: "Comunicaciones", text: "Modal para enviar SMS/WhatsApp con contador de caracteres (0-900)." },
  { type: "Comunicaciones", text: "Tablas de historial Email y SMS con estado (Enviado/Pendiente) y fecha." },
  { type: "Facturación", text: "Nueva tabla profesional en módulo Facturación (global) y ficha del cliente con pagos inline." },
  { type: "Facturación", text: "Registro de pagos en tiempo real (Yape, Plin, Efectivo, BCP, BBVA) sin recargar página." },
  { type: "Facturación", text: "Filtros por estado (Pagado, Pendiente, Vencido) y búsqueda rápida por recibo/cliente/DNI." },
  { type: "Facturación", text: "Impresión de recibos y vista previa del comprobante de pago desde la tabla." },
  { type: "Clientes", text: "Pestaña Facturación en ficha del cliente muestra historial de facturas y balance debido." },
  { type: "Backend", text: "Nuevos endpoints: /api/clients/{id}/communications, /send-email, /send-sms." },
  { type: "Mejora", text: "KPI visibles: Total Facturado, Total Recaudado, Cuentas por Cobrar." },
  { type: "Mejora", text: "Indicadores visuales (badges) por estado con iconos y colores diferenciados." }
];
