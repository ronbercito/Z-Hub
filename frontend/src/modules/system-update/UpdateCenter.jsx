/**
 * Módulo aislado: ventana de actualización y changelog.
 */
import React,{useState}from "react";
import { createPortal } from "react-dom";
import {Download,X,Sparkles}from "lucide-react";
import {PANEL_VERSION,CHANGELOG} from "./version";

export default function UpdateCenter(){
  const [open,setOpen]=useState(false);
  const modal=open ? createPortal(
    <div onMouseDown={()=>setOpen(false)} className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <section onMouseDown={(event)=>event.stopPropagation()} className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex justify-between">
          <div><b className="text-cyan-300 flex gap-2"><Sparkles className="w-4 h-4"/>Actualizaciones</b><p className="mt-1 text-xs text-slate-400">Panel MikroHub · Versión {PANEL_VERSION}</p></div>
          <button onClick={()=>setOpen(false)} className="text-slate-400"><X/></button>
        </div>
        <p className="mt-4 text-xs uppercase tracking-wider text-slate-500">Cambios de la versión {PANEL_VERSION}</p>
        <div className="mt-2 space-y-2">{CHANGELOG.map((item,index)=><div key={index} className="rounded-lg bg-slate-950/70 p-3 text-xs"><b className="text-cyan-300">{item.type}</b><p className="mt-1 text-slate-300">{item.text}</p></div>)}</div>
        <button onClick={()=>alert("El actualizador automático se habilitará al publicar la siguiente versión.")} className="mt-5 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm">Actualizar</button>
      </section>
    </div>,document.body
  ) : null;
  return <><button onClick={()=>setOpen(true)} title={status?.available ? "Nueva actualización disponible" : "Actualizaciones"} className={status?.available ? "flex items-center gap-2 rounded-xl border border-amber-300 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-3 py-2 text-xs font-bold text-white shadow-lg animate-pulse" : "p-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"}><Download className="w-4 h-4"/>{status?.available && <span>Nueva actualización</span>}</button>{modal}</>;
}