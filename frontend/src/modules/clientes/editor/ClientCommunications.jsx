/**
 * Archivo: frontend/src/modules/clientes/editor/ClientCommunications.jsx
 * Actualización: 2026-09-07 — editor de comunicaciones persistentes por cliente.
 * Función: registra Email, SMS, WhatsApp y notas desde la ficha del abonado.
 * Recibe: api, token y clientId desde ClientDetail.jsx.
 * Entrega: historial guardado a client_workspace/router.py y actualizado en pantalla.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, MessageSquare, Plus, Save } from "lucide-react";

export default function ClientCommunications({ api, token, clientId, client }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState({ channel:"email", recipient:client?.email || "", subject:"", message:"" }), [error, setError] = useState("");
  const headers={Authorization:"Bearer "+token};
  const load=async()=>{ try { setRows((await axios.get(api+"/clients/"+clientId+"/communications",{headers})).data); } catch(e){setError("No se pudo cargar las comunicaciones.");} };
  useEffect(()=>{load();},[clientId]);
  const save=async e=>{e.preventDefault();try{await axios.post(api+"/clients/"+clientId+"/communications",form,{headers});setForm({channel:"email",recipient:client?.email||"",subject:"",message:""});load();}catch(e){setError(e.response?.data?.detail||"No se pudo guardar la comunicación.");}};
  return <div className="space-y-4"><form onSubmit={save} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3"><div className="flex items-center gap-2 text-cyan-300 font-semibold"><Plus className="w-4 h-4"/>Registrar comunicación</div><div className="grid gap-3 sm:grid-cols-3"><select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="note">Nota interna</option></select><input value={form.recipient} onChange={e=>setForm({...form,recipient:e.target.value})} placeholder="Destinatario" className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm sm:col-span-2"/></div><input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Asunto (opcional)" className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"/><textarea required rows="4" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Mensaje o nota" className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"/><button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950"><Save className="mr-1 inline w-4 h-4"/>Guardar</button></form>{error&&<p className="text-sm text-rose-300">{error}</p>}<div className="space-y-3">{rows.map(row=><article key={row.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><p className="font-semibold text-slate-200">{row.channel==="email"?<Mail className="mr-2 inline w-4 h-4 text-cyan-300"/>:<MessageSquare className="mr-2 inline w-4 h-4 text-emerald-300/>"}{row.subject||row.channel.toUpperCase()}</p><p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{row.message}</p><p className="mt-2 text-xs text-slate-500">{row.recipient||"Nota interna"} · {row.operator_name||"Sistema"} · {row.created_at}</p></article>)}</div></div>;
}
