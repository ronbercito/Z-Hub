/**
 * Archivo: frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx
 * Actualización: 2026-09-08 — nueva interfaz de libro mayor de Saldos.
 * Función: muestra saldo a favor/deuda, historial y permite registrar movimientos firmados.
 * Recibe de: ClientBilling.jsx.
 * Entrega a: API /clients/{client_id}/balances; no modifica directamente facturas.
 */
import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Search, Wallet, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const INPUT_CLASS = "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500";

function money(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`;
}

export default function ClientBillingBalances({ clientId, API, headers, onBalanceUpdate }) {
  const [data, setData] = useState({ total: 0, credit: 0, debt: 0, rows: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ amount: "", description: "" });

  const load = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/clients/${clientId}/balances`, {
        headers,
        params: { search: search.trim() || undefined },
      });
      setData(response.data || { total: 0, credit: 0, debt: 0, rows: [] });
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudieron cargar los saldos del cliente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [clientId, search]);

  const balanceLabel = useMemo(() => {
    if (data.total > 0.005) return { title: "Saldo a favor", text: money(data.total), tone: "emerald" };
    if (data.total < -0.005) return { title: "Deuda del cliente", text: money(Math.abs(data.total)), tone: "rose" };
    return { title: "Saldo", text: money(0), tone: "slate" };
  }, [data.total]);

  const save = async event => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount === 0) return toast.error("El monto debe ser distinto de cero");
    if (!form.description.trim()) return toast.error("Ingresa una descripción");
    setSaving(true);
    try {
      const response = await axios.post(`${API}/clients/${clientId}/balances`, {
        amount,
        description: form.description.trim(),
      }, { headers });
      toast.success(response.data?.message || "Saldo registrado correctamente");
      setModal(false);
      setForm({ amount: "", description: "" });
      await load();
      onBalanceUpdate?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || "No se pudo registrar el saldo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold flex items-center gap-2 text-slate-100">
            <Wallet className="w-4 h-4 text-cyan-400" /> Saldos del cliente
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">Los movimientos positivos son saldo a favor; los negativos son deuda que se trasladará a la siguiente factura.</p>
        </div>
        <button type="button" onClick={() => setModal(true)} className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Agregar saldo
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className={`rounded-xl border p-4 ${balanceLabel.tone === "emerald" ? "bg-emerald-900/20 border-emerald-500/40" : balanceLabel.tone === "rose" ? "bg-rose-900/20 border-rose-500/40" : "bg-slate-900 border-slate-800"}`}>
          <p className="text-[10px] uppercase font-bold text-slate-500">Saldo neto</p>
          <p className={`text-xl font-black mt-1 ${balanceLabel.tone === "emerald" ? "text-emerald-400" : balanceLabel.tone === "rose" ? "text-rose-400" : "text-slate-200"}`}>{balanceLabel.text}</p>
          <p className="text-[10px] text-slate-500 mt-1">{balanceLabel.title}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/10 p-4">
          <p className="text-[10px] uppercase font-bold text-emerald-400">Disponible a favor</p>
          <p className="text-lg font-black text-emerald-400 mt-1">{money(data.credit)}</p>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-900/10 p-4">
          <p className="text-[10px] uppercase font-bold text-rose-400">Deuda acumulada</p>
          <p className="text-lg font-black text-rose-400 mt-1">{money(data.debt)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar en movimientos..." className={`${INPUT_CLASS} pl-9`} />
        </div>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Factura origen</th>
                <th className="p-3">Factura destino</th>
                <th className="p-3 text-right">Monto</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Cargando saldos...</td></tr>
              ) : data.rows.length ? data.rows.map(row => {
                const positive = Number(row.amount || 0) >= 0;
                return (
                  <tr key={row.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-mono text-slate-500">{row.id.slice(0, 8)}</td>
                    <td className="p-3 font-mono">{row.source_invoice_number || "—"}</td>
                    <td className="p-3 font-mono">{row.target_invoice_number || "—"}</td>
                    <td className={`p-3 text-right font-black ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                      <span className="inline-flex items-center gap-1">{positive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}{positive ? "+" : "−"}{money(Math.abs(row.amount))}</span>
                    </td>
                    <td className="p-3 text-slate-400">{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</td>
                    <td className="p-3 max-w-[280px]">{row.description || "—"}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full bg-slate-800 text-[10px] font-bold">{row.status}</span></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="p-10 text-center text-slate-500">No hay movimientos de saldo registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={save} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div><h4 className="font-bold text-slate-100">Saldo cliente</h4><p className="text-[10px] text-slate-500 mt-1">Registra un saldo a favor o una deuda pendiente.</p></div>
              <button type="button" onClick={() => setModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[11px] text-slate-400">Monto positivo = saldo a favor del cliente (ej. <b>500</b>). Monto negativo = deuda del cliente (ej. <b>-100</b>). El saldo a favor se aplicará automáticamente a las siguientes facturas; la deuda se sumará a la siguiente factura generada.</p>
              <label className="block text-xs text-slate-300"><span className="font-semibold">Monto</span><input autoFocus required type="number" step="0.01" value={form.amount} onChange={event => setForm(value => ({ ...value, amount: event.target.value }))} placeholder="500 o -100" className={INPUT_CLASS} /></label>
              <label className="block text-xs text-slate-300"><span className="font-semibold">Descripción</span><textarea required rows="3" value={form.description} onChange={event => setForm(value => ({ ...value, description: event.target.value }))} placeholder="Abono del cliente, deuda pendiente, ajuste..." className={INPUT_CLASS} /></label>
              <p className="text-[10px] text-slate-500">El movimiento queda registrado en el historial y no se borra al aplicarse a una factura.</p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs">Cancelar</button>
              <button disabled={saving} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">{saving ? "Registrando..." : "Registrar saldo"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
