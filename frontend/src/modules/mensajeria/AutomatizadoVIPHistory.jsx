import React, { useEffect, useState } from "react";
import axios from "axios";
import { History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function AutomatizadoVIPHistory() {
  const { API, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/whatsapp/automatizadovip/logs?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "No se pudo cargar el historial");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [API, token]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Historial AutomatizadoVIP</h3>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-900 text-slate-400">
            <tr><th className="p-2">Fecha</th><th className="p-2">Número</th><th className="p-2">Estado</th><th className="p-2">HTTP</th><th className="p-2">Mensaje</th></tr>
          </thead>
          <tbody>
            {logs.map(row => (
              <tr key={row.id} className="border-t border-slate-800 text-slate-300">
                <td className="p-2 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</td>
                <td className="p-2 font-mono">{row.phone}</td>
                <td className={`p-2 font-semibold ${row.status === "sent" ? "text-emerald-400" : "text-red-400"}`}>{row.status}</td>
                <td className="p-2">{row.http_status ?? "—"}</td>
                <td className="p-2 max-w-[420px] truncate" title={row.message}>{row.message}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan="5" className="p-5 text-center text-slate-500">No hay envíos registrados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
