/**
 * Archivo: frontend/src/modules/clientes/editor/ClientBilling.jsx
 * Actualización: 2026-09-08 — aislamiento del módulo y ordenamiento de Facturación.
 * Función: punto de entrada estable para Facturación; encapsula errores de renderizado y el ordenamiento de la tabla.
 * Recibe de: ClientDetail.jsx.
 * Entrega a: módulo aislado editor/billing/ClientBilling.jsx.
 */
import React from "react";
import ClientBillingErrorBoundary from "./billing/ClientBillingErrorBoundary";
import ClientBillingSorting from "./billing/ClientBillingSorting";
import ClientBillingModule from "./billing/ClientBilling";

export default function ClientBilling(props) {
  return (
    <ClientBillingErrorBoundary>
      <ClientBillingSorting>
        <ClientBillingModule {...props} />
      </ClientBillingSorting>
    </ClientBillingErrorBoundary>
  );
}
