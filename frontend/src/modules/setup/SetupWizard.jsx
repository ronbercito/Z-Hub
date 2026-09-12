import React, { useState } from "react";
import axios from "axios";
import { CheckCircle2, Lock, Mail, ShieldCheck, UserRound, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { PANEL_VERSION } from "../system-update/version";

const API = "/api";

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [customerEmail, setCustomerEmail] = useState("");
  const [licenseValid, setLicenseValid] = useState(false);
  const [licenseOwner, setLicenseOwner] = useState(null);
  const [admin, setAdmin] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (action, successStep) => {
    setLoading(true); setError("");
    try { await action(); setStep(successStep); }
    catch (err) {
      const msg = err.response?.data?.detail || "No se pudo completar este paso.";
      setError(typeof msg === "string" ? msg : "No se pudo completar este paso.");
      toast.error(typeof msg === "string" ? msg : "Error de configuración");
    } finally { setLoading(false); }
  };

  const activateTrial = () => run(async () => {
    const response = await axios.post(`${API}/setup/auto-trial`, { email: customerEmail, installation_name: "Z-Hub" });
    setLicenseValid(true);
    setLicenseOwner(response.data);
    setAdmin((current) => ({ ...current, email: current.email || customerEmail }));
    toast.success(response.data.recovered ? "TRIAL recuperado para este servidor" : "TRIAL activado automáticamente");
  }, 2);

  const createAdmin = () => run(async () => {
    if (admin.password !== admin.password_confirmation) throw { response: { data: { detail: "Las contraseñas no coinciden" } } };
    await axios.post(`${API}/setup/admin`, admin);
  }, 3);

  const finish = () => run(async () => { await axios.post(`${API}/setup/complete`, {}); }, 4).then(() => { window.location.href = "/"; });
  const input = "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";

  return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl p-8">
      <div className="text-center mb-8"><div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center"><ShieldCheck className="h-7 w-7 text-white" /></div><h1 className="text-2xl font-bold">Configurar Z-Hub</h1><p className="mt-2 text-sm text-slate-400">Activación automática y configuración inicial</p></div>
      <div className="grid grid-cols-3 gap-2 mb-8">{["Activación", "Administrador", "Finalizar"].map((label,index)=>{const n=index+1; const active=step>=n; return <div key={label} className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${active?"bg-cyan-500/15 text-cyan-300":"bg-slate-800 text-slate-500"}`}>{n}. {label}</div>;})}</div>
      {error && <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

      {step===1 && <section>
        <div className="flex items-center gap-3 mb-5"><WandSparkles className="text-cyan-400"/><div><h2 className="font-semibold">Activar prueba de Z-Hub</h2><p className="text-xs text-slate-400">Usa el correo con el que registraste tu empresa. No necesitas escribir ninguna licencia.</p></div></div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">CORREO REGISTRADO</label>
        <div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="email" value={customerEmail} onChange={(e)=>setCustomerEmail(e.target.value.trim())} placeholder="cliente@empresa.com" autoFocus/></div>
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-xs text-slate-300">Z-Hub identificará este servidor de forma segura. Si ya utilizó un TRIAL, Web-Licence recuperará el mismo registro en lugar de crear otro.</div>
        <button disabled={loading || !customerEmail.includes("@")} onClick={activateTrial} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold disabled:opacity-50">{loading?"Conectando con Web-Licence...":"Activar y continuar"}</button>
      </section>}

      {step===2 && <section>
        <div className="flex items-center gap-3 mb-5"><UserRound className="text-cyan-400"/><div><h2 className="font-semibold">Crear cuenta de administrador</h2><p className="text-xs text-slate-400">Esta será la cuenta utilizada para ingresar al panel.</p></div></div>
        {licenseOwner && <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm"><div className="font-semibold text-emerald-300">{licenseOwner.recovered?"TRIAL recuperado":"TRIAL activado"}</div><div className="mt-1 text-slate-200">{licenseOwner.owner||"Empresa registrada"}</div><div className="text-slate-400">Plan {licenseOwner.plan||"TRIAL"} · hasta {licenseOwner.max_clients||20} abonados</div></div>}
        <div className="space-y-4"><input className={input} placeholder="Nombre completo" value={admin.name} onChange={(e)=>setAdmin({...admin,name:e.target.value})}/><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="email" placeholder="Correo electrónico" value={admin.email} onChange={(e)=>setAdmin({...admin,email:e.target.value})}/></div><div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="password" placeholder="Contraseña (mínimo 10 caracteres)" value={admin.password} onChange={(e)=>setAdmin({...admin,password:e.target.value})}/></div><div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="password" placeholder="Confirmar contraseña" value={admin.password_confirmation} onChange={(e)=>setAdmin({...admin,password_confirmation:e.target.value})}/></div></div>
        <div className="mt-6 flex gap-3"><button disabled={loading} onClick={()=>setStep(1)} className="w-1/3 rounded-xl border border-slate-700 py-3 font-semibold">Atrás</button><button disabled={loading||!admin.name||!admin.email||admin.password.length<10} onClick={createAdmin} className="w-2/3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold disabled:opacity-50">{loading?"Creando...":"Siguiente"}</button></div>
      </section>}

      {step===3 && <section className="text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400"/><h2 className="mt-4 text-2xl font-bold">Z-Hub está listo</h2><p className="mt-2 text-sm text-slate-400">La licencia y la cuenta administrativa fueron configuradas.</p><div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-left space-y-3"><div className="flex justify-between"><span className="text-slate-400">Licencia</span><span className="text-emerald-400 font-semibold">✓ TRIAL automático</span></div><div className="flex justify-between"><span className="text-slate-400">Administrador</span><span className="text-emerald-400 font-semibold">✓ Configurado</span></div><div className="flex justify-between"><span className="text-slate-400">Versión instalada</span><span className="font-semibold">Z-Hub {PANEL_VERSION}</span></div></div><button disabled={loading||!licenseValid} onClick={finish} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold">{loading?"Finalizando...":"FINALIZAR"}</button></section>}
    </div>
  </div>;
}
