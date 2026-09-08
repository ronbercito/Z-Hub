/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingErrorBoundary.jsx
 * Actualización: 2026-09-08 — primera versión de aislamiento de fallos de Facturación del cliente.
 * Función: evita que un error de renderizado del módulo de facturación derribe toda la ficha del cliente.
 * Recibe de: ClientBilling.jsx y errores de sus componentes hijos.
 * Entrega a: una pantalla controlada dentro de la pestaña Facturación, dejando operativas las demás pestañas.
 */
import React from "react";

export default class ClientBillingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error aislado en Facturación del cliente:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <h3 className="text-base font-bold text-rose-300">Facturación no disponible</h3>
        <p className="mt-2 text-sm text-slate-400">
          Ocurrió un error dentro del módulo de facturación de este cliente. Las demás opciones de la ficha siguen disponibles.
        </p>
        <button
          type="button"
          onClick={() => this.setState({ hasError: false, error: null })}
          className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }
}
