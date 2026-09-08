/**
 * Archivo: frontend/src/modules/clientes/editor/ClientBilling.jsx
 * Actualización: 2026-09-08 — aislamiento del módulo de facturación del cliente.
 * Función: punto de entrada estable para Facturación; encapsula errores de renderizado del módulo.
 * Recibe de: ClientDetail.jsx.
 * Entrega a: módulo aislado editor/billing/ClientBilling.jsx.
 */
import React from "react";
import ClientBillingErrorBoundary from "./billing/ClientBillingErrorBoundary";
import ClientBillingModule from "./billing/ClientBilling";

export default function ClientBilling(props) {
  return (
    <ClientBillingErrorBoundary>
      <ClientBillingModule {...props} />
    </ClientBillingErrorBoundary>
  );
}
