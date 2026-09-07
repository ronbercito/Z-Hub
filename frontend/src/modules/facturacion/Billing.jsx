/**
 * Archivo: frontend/src/modules/facturacion/Billing.jsx
 * Actualización: 2026-09-07 — reemplazo de tabla con componente mejorado, pagos inline y filtros.
 * Función: módulo de facturación global con listado de todas las facturas, filtros por estado,
 *          registro de pagos inline, impresión de recibos y facturación/corte masivo.
 * Recibe de: backend /api/invoices (listado), /api/payments (registro), /api/routers/sync-cuts.
 * Entrega a: administrador una interfaz limpia para cobranza y auditoría de pagos.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { TEST_IDS } from "../../constants/testIds";
import { 
  DollarSign, FileText, CheckCircle2, Clock, AlertTriangle, 
  Printer, QrCode, ShieldAlert, Sparkles, Plus, Search, 
  CreditCard, Smartphone, Building2, User, Phone, MapPin, Loader, Eye
} from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const { API, token, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  // Payment form inline
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [payData, setPayData] = useState({ method: "Yape", amount: 0, reference: "" });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Receipt preview
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/invoices`, {
        params: { status: statusFilter !== "all" ? statusFilter : undefined, search },
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const handlePayment = async (invoiceId) => {
    if (!payData.amount || payData.amount <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    
    setPaymentProcessing(true);
    try {
      const res = await axios.post(
        `${API}/payments`,
        {
          invoice_id: invoiceId,
          amount: parseFloat(payData.amount),
          payment_method: payData.method,
          operation_reference: payData.reference || `OP-${Math.floor(100000 + Math.random() * 900000)}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("¡Pago registrado!");
      setPayingInvoiceId(null);
      fetchInvoices();
      setViewingReceipt(res.data.invoice);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al registrar pago");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleMassGenerate = async () => {
    if (!window.confirm("¿Deseas generar masivamente los recibos de este mes para todos los clientes activos?")) return;
    try {
      const res = await axios.post(`${API}/invoices/mass-generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchInvoices();
    } catch (e) {
      toast.error("Error en la facturación masiva");
    }
  };

  const handleSyncCuts = async () => {
    if (!window.confirm("¿Deseas ejecutar la regla de corte en MikroTik para clientes con facturas vencidas?")) return;
    try {
      const res = await axios.post(`${API}/routers/sync-cuts`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      fetchInvoices();
    } catch (e) {
      toast.error("Error al sincronizar cortes");
    }
  };

  // Metrics
  const totalInvoiced = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((acc, curr) => acc + (curr.paid_amount || curr.amount || 0), 0);
  const totalUnpaid = invoices.filter(i => i.status !== "paid").reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const getStatusBadge = (status) => {
    const configs = {
      paid: { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-400", icon: CheckCircle2, label: "PAGADO" },
      unpaid: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400", icon: Clock, label: "PENDIENTE" },
      overdue: { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400", icon: AlertTriangle, label: "VENCIDO" },
      canceled: { bg: "bg-slate-500/20", border: "border-slate-500/40", text: "text-slate-400", icon: Eye, label: "ANULADO" }
    };
    
    const cfg = configs[status] || configs.unpaid;
    const Icon = cfg.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.border} border ${cfg.text}`}>
        <Icon className="w-3.5 h-3.5" /> {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Facturación, Cobranza y Recibos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emisión de recibos, registro de pagos (Yape, Plin, Efectivo, BCP) y corte por mora
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            data-testid={TEST_IDS.BTN_MASS_INVOICES}
            onClick={handleMassGenerate}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" /> Generar Facturación Masiva
          </button>

          <button
            data-testid={TEST_IDS.BTN_SYNC_CUTS}
            onClick={handleSyncCuts}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Aplicar Corte a Morosos
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Facturado</p>
          <h3 className="text-2xl font-black text-slate-100 mt-1">S/. {totalInvoiced.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">{invoices.length} recibos emitidos</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Recaudado (Cobrado)</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">S/. {totalPaid.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">{invoices.filter(i => i.status === "paid").length} pagados</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Cuentas por Cobrar (Pendiente)</p>
          <h3 className="text-2xl font-black text-rose-400 mt-1">S/. {totalUnpaid.toFixed(2)}</h3>
          <p className="text-[11px] text-rose-300/80 mt-1">{invoices.filter(i => i.status !== "paid").length} recibos pendientes/vencidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="relative flex-1 sm:flex-none">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar recibo, cliente o DNI/RUC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {["all", "paid", "unpaid", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === s
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {s === "all" ? "Todos" : s === "paid" ? "Pagados" : s === "unpaid" ? "Pendientes" : "Vencidos"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 rounded-lg border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Recibo</th>
                <th className="px-3 py-2.5 font-semibold">Cliente / DNI-RUC</th>
                <th className="px-3 py-2.5 font-semibold">Período</th>
                <th className="px-3 py-2.5 font-semibold text-right">Monto (S/.)</th>
                <th className="px-3 py-2.5 font-semibold">Vencimiento</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    <Loader className="w-4 h-4 animate-spin inline" /> Cargando...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    No hay facturas.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <React.Fragment key={inv.id}>
                    <tr className="hover:bg-slate-800/30 transition">
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-100">{inv.invoice_number}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-200">{inv.client_name}</div>
                        <div className="text-[10px] text-slate-400">{inv.client_dni_ruc}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-300">{inv.month_period}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-100">S/. {Number(inv.amount).toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-slate-300 text-[10px]">{inv.due_date}</td>
                      <td className="px-3 py-2.5">{getStatusBadge(inv.status)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {inv.status !== "paid" ? (
                            <button
                              onClick={() => {
                                setPayingInvoiceId(inv.id);
                                setPayData({ method: "Yape", amount: inv.amount, reference: "" });
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3" /> Pagar
                            </button>
                          ) : (
                            <button
                              onClick={() => setViewingReceipt(inv)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold rounded transition flex items-center gap-1 border border-slate-700"
                            >
                              <Printer className="w-3 h-3" /> Ver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Payment Form */}
                    {payingInvoiceId === inv.id && (
                      <tr className="bg-slate-950/80 border-t-2 border-cyan-500/50">
                        <td colSpan="7" className="px-4 py-3">
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-300">Registrar pago para {inv.invoice_number}</p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                              {["Yape", "Plin", "Efectivo", "BCP", "BBVA"].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setPayData({ ...payData, method: m })}
                                  className={`px-2 py-1.5 rounded text-[10px] font-bold transition border ${
                                    payData.method === m
                                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="0.10"
                                placeholder="Monto"
                                value={payData.amount}
                                onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
                                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400 font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                              />
                              <input
                                type="text"
                                placeholder="Referencia (ej: OP-123456)"
                                value={payData.reference}
                                onChange={(e) => setPayData({ ...payData, reference: e.target.value })}
                                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                              />
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setPayingInvoiceId(null)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-700"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handlePayment(inv.id)}
                                disabled={paymentProcessing}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1"
                              >
                                {paymentProcessing ? <Loader className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                                Confirmar Pago
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" /> Recibo
              </h3>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-slate-200 font-bold">✕</button>
            </div>

            {/* Simple Receipt Preview */}
            <div className="bg-white text-slate-900 p-4 rounded font-mono text-xs text-center space-y-1 mb-3 select-all">
              <p className="font-bold">FIBRAZ PERÚ S.A.C.</p>
              <p className="text-[10px]">RUC: 20608934521 | Teléfono: +51 987 654 321</p>
              <div className="border-b border-dashed border-slate-400 my-1"></div>
              
              <p className="font-bold">RECIBO DE PAGO</p>
              <p className="font-bold text-lg">{viewingReceipt.invoice_number}</p>
              <p className="text-[11px]">Fecha: {viewingReceipt.payment_date ? viewingReceipt.payment_date.split("T")[0] : viewingReceipt.issue_date}</p>
              
              <div className="border-b border-dashed border-slate-400 my-1"></div>
              <div className="text-left space-y-0.5 text-[11px]">
                <p><span className="font-bold">Cliente:</span> {viewingReceipt.client_name}</p>
                <p><span className="font-bold">Período:</span> {viewingReceipt.month_period}</p>
                <p><span className="font-bold">Plan:</span> {viewingReceipt.plan_name}</p>
              </div>
              
              <div className="border-b border-dashed border-slate-400 my-1"></div>
              <div className="text-right font-bold text-sm">
                TOTAL: S/. {Number(viewingReceipt.paid_amount || viewingReceipt.amount).toFixed(2)}
              </div>
              <p className="text-[10px]">Medio: {viewingReceipt.payment_method || "Efectivo"}</p>
              <p className="text-[10px] font-bold">¡Gracias por su pago!</p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
