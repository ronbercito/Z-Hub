/**
 * Módulo aislado: gráfico de tráfico OLT.
 * Solo consulta /olt-traffic/summary. Un error se limita a este recuadro.
 */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

const fmt = (value) => value === null || value === undefined ? "—" : value >= 1000 ? `${(value / 1000).toFixed(2)} Gbps` : `${value.toFixed(1)} Mbps`;

export default function OltTrafficWidget({ router }) {
  const { API, token } = useAuth();
  const [sample, setSample] = useState({ history: [], rxMbps: null, txMbps: null, message: "Leyendo contadores del puerto uplink…" });
  const prior = useRef(null);

  useEffect(() => {
    let active = true;
    const read = async () => {
      try {
        const response = await axios.get(`${API}/routers/${router.id}/olt-traffic/summary`, { headers: { Authorization: `Bearer ${token}` } });
        const info = response.data?.info;
        if (!active || !response.data?.ok || !info) throw new Error(response.data?.error || "Sin lectura");
        const now = Date.now();
        const old = prior.current;
        const seconds = old ? (now - old.at) / 1000 : 0;
        const rxMbps = seconds > 0 ? Math.max(0, ((Number(info.rx_bytes) - old.rx) * 8) / seconds / 1000000) : null;
        const txMbps = seconds > 0 ? Math.max(0, ((Number(info.tx_bytes) - old.tx) * 8) / seconds / 1000000) : null;
        prior.current = { rx: Number(info.rx_bytes), tx: Number(info.tx_bytes), at: now };
        setSample((current) => ({ history: [...current.history, { rxMbps, txMbps }].slice(-24), rxMbps, txMbps, ports: info.active_ports || [], message: seconds ? "" : "Tomando segunda muestra para calcular velocidad…" }));
      } catch {
        if (active) setSample((current) => ({ ...current, message: current.history.length ? "Última lectura conservada" : "Sin lectura de tráfico disponible" }));
      }
    };
    read();
    const timer = window.setInterval(read, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [API, token, router.id]);

  const points = sample.history.map((item, index) => {
    const value = Math.max(item.rxMbps || 0, item.txMbps || 0);
    return `${index * 28},${36 - Math.min(32, value > 0 ? Math.log10(value + 1) * 9 : 0)}`;
  }).join(" ");

  return (
    <div className="mt-4 pt-3 border-t border-slate-800">
      <div className="flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-wider text-slate-500">
        <span>Tráfico actual</span>
        <span className="normal-case tracking-normal text-slate-400">{sample.ports?.length ? `Uplink: ${sample.ports.join(", ")}` : sample.message}</span>
      </div>
      <div className="mt-2 rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_10px_24px_rgba(0,0,0,0.30)]">
        <div className="mb-1 flex justify-end gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-indigo-300"><ArrowDown className="w-3.5 h-3.5" />{fmt(sample.rxMbps)}</span>
          <span className="flex items-center gap-1 text-cyan-300"><ArrowUp className="w-3.5 h-3.5" />{fmt(sample.txMbps)}</span>
        </div>
        <svg viewBox="0 0 650 40" preserveAspectRatio="none" className="w-full h-10" aria-label="Historial de tráfico">
          <polyline points={points || "0,36 650,36"} fill="none" stroke="#647cff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}
