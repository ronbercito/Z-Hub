/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingFilters.jsx
 * Actualización: 2026-09-08 — separación de filtros de la tabla de Facturación.
 * Función: búsqueda y filtros de estado de facturas.
 * Recibe de: ClientBilling.jsx.
 * Entrega a: estado de filtro/búsqueda usado para consultar las facturas.
 */
import React from "react";
import { Search } from "lucide-react";

export default function ClientBillingFilters({ search, setSearch, filter, setFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-between">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar recibo, período o servicio..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs"
        />
      </div>
      <div className="flex gap-1">
        {[["all", "Todos"], ["paid", "Pagados"], ["unpaid", "Pendientes"], ["overdue", "Vencidos"]].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${filter === key ? "bg-cyan-500 text-white" : "bg-slate-800 border border-slate-700 text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
