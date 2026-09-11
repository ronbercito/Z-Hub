import React, { useState } from "react";
import { ChevronRight, MessageCircle, Radio } from "lucide-react";
import WhatsAppAutomatizadoVIPSettings from "./WhatsAppAutomatizadoVIPSettings";

const GATEWAYS = [
  { id: "automatizadovip", name: "AutomatizadoVIP", description: "WhatsApp V2 · envíos automáticos y pruebas", active: true },
];

export default function MessagingSettings() {
  const [gateway, setGateway] = useState(null);
  if (gateway === "automatizadovip") return <div className="space-y-3"><button type="button" onClick={() => setGateway(null)} className="text-xs text-cyan-300 hover:text-cyan-200">← Volver a pasarelas</button><WhatsAppAutomatizadoVIPSettings /></div>;
  return <div className="space-y-5">
    <div><h3 className="text-base font-bold text-slate-100">Mensajería</h3><p className="text-xs text-slate-400 mt-1">Administra las pasarelas de envío. Se pueden incorporar nuevos proveedores sin crear nuevas opciones en el menú principal de Ajustes.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {GATEWAYS.map(item => <button key={item.id} type="button" onClick={() => setGateway(item.id)} className="text-left p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 transition-colors">
        <div className="flex items-start justify-between"><span className="p-2 rounded-xl bg-emerald-500/10"><MessageCircle className="w-5 h-5 text-emerald-400" /></span><ChevronRight className="w-4 h-4 text-slate-500" /></div>
        <h4 className="mt-4 text-sm font-bold text-slate-100">{item.name}</h4><p className="mt-1 text-xs text-slate-400">{item.description}</p><span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300"><Radio className="w-3 h-3" />Disponible</span>
      </button>)}
      <div className="p-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 flex items-center justify-center text-center"><div><p className="text-xs font-bold text-slate-400">Nueva pasarela</p><p className="text-[10px] text-slate-600 mt-1">Preparado para futuras integraciones</p></div></div>
    </div>
  </div>;
}
