/**
 * Archivo: frontend/src/modules/clientes/editor/ClientDocuments.jsx
 * Actualización: 2026-09-07 — gestor de documentos vinculados a clientes.
 * Función: carga, lista, descarga y elimina archivos del expediente del abonado.
 * Recibe: api, token y clientId desde ClientDetail.jsx.
 * Entrega: archivos a client_workspace/router.py y metadatos persistentes en MariaDB.
 */
import React,{useEffect,useState}from "react";
import axios from "axios";
import { Download, FileUp, Trash2 } from "lucide-react";

export default function ClientDocuments({api,token,clientId}){
 const [rows,setRows]=useState([]),[file,setFile]=useState(null),[title,setTitle]=useState(""),[category,setCategory]=useState("contract"),[error,setError]=useState("");const headers={Authorization:"Bearer "+token};
 const load=async()=>{try{setRows((await axios.get(api+"/clients/"+clientId+"/documents",{headers})).data);}catch(e){setError("No se pudieron cargar los documentos.");}};useEffect(()=>{load();},[clientId]);
 const upload=async e=>{e.preventDefault();if(!file)return;const data=new FormData();data.append("file",file);data.append("title",title);data.append("category",category);try{await axios.post(api+"/clients/"+clientId+"/documents",data,{headers});setFile(null);setTitle("");e.target.reset();load();}catch(e){setError(e.response?.data?.detail||"No se pudo cargar el documento.");}};
 const remove=async id=>{if(!window.confirm("¿Eliminar este documento?"))return;await axios.delete(api+"/clients/documents/"+id,{headers});load();};
 return <div className="space-y-4"><form onSubmit={upload} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="grid gap-3 sm:grid-cols-3"><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título del documento" className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"/><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"><option value="contract">Contrato</option><option value="installation">Instalación</option><option value="identity">Identidad</option><option value="other">Otro</option></select><input required type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="text-sm text-slate-300"/></div><button className="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950"><FileUp className="mr-1 inline w-4 h-4"/>Adjuntar documento</button></form>{error&&<p className="text-sm text-rose-300">{error}</p>}<div className="space-y-2">{rows.map(row=><div key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div><p className="font-medium text-slate-200">{row.title}</p><p className="text-xs text-slate-500">{row.original_name} · {Math.ceil(row.size_bytes/1024)} KB · {row.operator_name}</p></div><div className="flex gap-2"><a href={api+"/clients/documents/"+row.id+"/download"} onClick={e=>{e.preventDefault();axios.get(api+"/clients/documents/"+row.id+"/download",{headers,responseType:"blob"}).then(r=>{const url=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=url;a.download=row.original_name;a.click();URL.revokeObjectURL(url);});}} className="rounded-lg border border-cyan-500/30 p-2 text-cyan-300"><Download className="w-4 h-4"/></a><button onClick={()=>remove(row.id)} className="rounded-lg border border-rose-500/30 p-2 text-rose-300"><Trash2 className="w-4 h-4"/></button></div></div>)}</div></div>;
}
