import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, Edit3, Plus, Save, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

const empty = { name: "", email: "", phone: "", role: "tecnico", password: "", is_active: true, permissions: {}, access_schedule: {} };
const labels = { dashboard:"Inicio", clients:"Clientes", plans:"Servicios / Planes", billing:"Facturación", network:"Red", olt:"OLT", monitoring:"Monitoreo", tickets:"Tickets", inventory:"Almacén", messaging:"Mensajería", hotspot:"Hotspot", tasks:"Tareas", settings:"Ajustes", staff:"Gestión personal" };
const actionLabels = { view:"Ver", create:"Crear", edit:"Editar", delete:"Eliminar", suspend:"Suspender", operate:"Operar", pay:"Cobrar", report:"Reportes", send:"Enviar", manage:"Administrar" };

export default function StaffManagement() {
  const { API, token } = useAuth();
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState({ modules:{}, defaults:{} });
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const [staff, permissions] = await Promise.all([axios.get(`${API}/staff`, { headers }), axios.get(`${API}/staff/catalog`, { headers })]);
      setRows(staff.data); setCatalog(permissions.data);
    } catch { toast.error("No se pudo cargar Gestión personal"); }
  };
  useEffect(() => { load(); }, []);

  const setRole = (role) => setForm(current => ({ ...current, role, permissions: structuredClone(catalog.defaults?.[role] || {}) }));
  const toggle = (module, action) => setForm(current => {
    const currentActions = current.permissions?.[module] || [];
    const nextActions = currentActions.includes(action) ? currentActions.filter(item => item !== action) : [...currentActions, action];
    return { ...current, permissions: { ...current.permissions, [module]: nextActions } };
  });
  const beginEdit = (operator) => {
    setEditing(operator.id);
    setForm({ ...empty, ...operator, password:"", permissions: structuredClone(operator.permissions || catalog.defaults?.[operator.role] || {}) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancel = () => { setEditing(null); setForm(empty); };
  const save = async (event) => {
    event.preventDefault();
    try {
      const endpoint = editing ? `${API}/staff/${editing}` : `${API}/staff`;
      const response = editing ? await axios.put(endpoint, form, { headers }) : await axios.post(endpoint, form, { headers });
      toast.success(editing ? `Operador ${response.data.name} actualizado` : "Cuenta creada");
      cancel(); load();
    } catch (error) { toast.error(error.response?.data?.detail || "No se pudo guardar el operador"); }
  };

  return <section className="mx-auto max-w-6xl space-y-5">
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4"><div><h3 className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5 text-cyan-400" /> Gestión personal</h3><p className="mt-1 text-xs text-slate-400">Define qué puede ver y hacer cada operador. Los permisos se aplican al menú y a la API.</p></div>{editing && <button type="button" onClick={cancel} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold"><X className="h-4 w-4" /> Cancelar edición</button>}</div>
      <form onSubmit={save} className="mt-5 space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Nombre completo" className="field" />
          <input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="correo@empresa.com" className="field" />
          <input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="Teléfono" className="field" />
          <input required={!editing} type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder={editing ? "Nueva contraseña (opcional)" : "Contraseña mínima 8 caracteres"} className="field" />
          <select value={form.role} onChange={e => setRole(e.target.value)} className="field"><option value="admin">Administración · acceso total</option><option value="tecnico">Técnico · soporte y red</option><option value="cobrador">Cobrador · clientes y facturación</option></select>
          <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 text-xs font-semibold"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form,is_active:e.target.checked})} className="h-4 w-4 accent-cyan-500" /> Cuenta activa</label>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-300">Permisos por módulo</div><div className="grid gap-3 md:grid-cols-2">{Object.entries(catalog.modules || {}).map(([module, actions]) => <div key={module} className="rounded-xl border border-slate-800 bg-slate-900 p-3"><div className="mb-2 text-xs font-bold text-cyan-300">{labels[module] || module}</div><div className="flex flex-wrap gap-2">{actions.map(action => {const active=(form.permissions?.[module]||[]).includes(action); return <button key={action} type="button" onClick={()=>toggle(module,action)} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${active ? "border-cyan-400 bg-cyan-500/20 text-cyan-200" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>{active && <Check className="h-3 w-3" />}{actionLabels[action] || action}</button>})}</div></div>)}</div></div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-400"><Save className="h-4 w-4" />{editing ? "Guardar cambios" : "Crear cuenta"}</button>
      </form>
    </div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h4 className="font-bold">Operadores</h4><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="p-3">OPERADOR</th><th className="p-3">ROL</th><th className="p-3">ESTADO</th><th className="p-3 text-right">ACCIÓN</th></tr></thead><tbody>{rows.map(operator=><tr key={operator.id} className="border-t border-slate-800"><td className="p-3 font-semibold text-slate-100">{operator.name}<span className="mt-1 block font-normal text-slate-500">{operator.email}{operator.phone ? ` · ${operator.phone}` : ""}</span></td><td className="p-3 capitalize text-cyan-300">{operator.role}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${operator.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>{operator.is_active ? "ACTIVO" : "INACTIVO"}</span></td><td className="p-3 text-right"><button type="button" onClick={()=>beginEdit(operator)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-300"><Edit3 className="h-3.5 w-3.5" /> Editar</button></td></tr>)}</tbody></table>{!rows.length && <p className="p-4 text-center text-xs text-slate-500">Aún no hay operadores.</p>}</div></div>
  </section>;
}
