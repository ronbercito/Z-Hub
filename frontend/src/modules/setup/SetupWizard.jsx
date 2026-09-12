import React, { useMemo, useState } from "react";
import axios from "axios";
import { Building2, CheckCircle2, Globe2, Lock, Mail, Phone, ShieldCheck, UserRound, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { PANEL_VERSION } from "../system-update/version";

const API = "/api";

const LATAM_COUNTRIES = [
  { name:"Argentina", code:"54" },
  { name:"Bolivia", code:"591" },
  { name:"Brasil", code:"55" },
  { name:"Chile", code:"56" },
  { name:"Colombia", code:"57" },
  { name:"Costa Rica", code:"506" },
  { name:"Cuba", code:"53" },
  { name:"Ecuador", code:"593" },
  { name:"El Salvador", code:"503" },
  { name:"Guatemala", code:"502" },
  { name:"Haití", code:"509" },
  { name:"Honduras", code:"504" },
  { name:"México", code:"52" },
  { name:"Nicaragua", code:"505" },
  { name:"Panamá", code:"507" },
  { name:"Paraguay", code:"595" },
  { name:"Perú", code:"51" },
  { name:"República Dominicana", code:"1" },
  { name:"Uruguay", code:"598" },
  { name:"Venezuela", code:"58" },
];

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [registration, setRegistration] = useState({ country:"Perú", company_name:"", contact_name:"", email:"", phone:"" });
  const [customerEmail, setCustomerEmail] = useState("");
  const [licenseValid, setLicenseValid] = useState(false);
  const [licenseOwner, setLicenseOwner] = useState(null);
  const [admin, setAdmin] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const country = useMemo(() => LATAM_COUNTRIES.find((item)=>item.name===registration.country) || LATAM_COUNTRIES.find((item)=>item.name==="Perú"), [registration.country]);

  const run = async (action, successStep) => {
    setLoading(true); setError("");
    try { await action(); setStep(successStep); }
    catch (err) {
      const msg = err.response?.data?.detail || "No se pudo completar este paso.";
      setError(typeof msg === "string" ? msg : "No se pudo completar este paso.");
      toast.error(typeof msg === "string" ? msg : "Error de configuración");
    } finally { setLoading(false); }
  };

  const registerCustomer = () => run(async () => {
    const nationalPhone = String(registration.phone || "").replace(/\D/g, "").replace(/^0+/, "");
    const fullPhone = `+${country.code}${nationalPhone}`;
    const response = await axios.post(`${API}/setup/register`, {
      company_name: registration.company_name.trim(),
      contact_name: registration.contact_name.trim(),
      email: registration.email.trim().toLowerCase(),
      phone: fullPhone,
      country: registration.country,
    });
    const email = response.data?.email || registration.email.trim().toLowerCase();
    setCustomerEmail(email);
    toast.success(response.data?.existing ? "Cuenta existente actualizada. Continúa con la activación." : "Registro preparado. Continúa con la activación.");
  }, 2);

  const skipRegistration = () => {
    setError("");
    setCustomerEmail(registration.email.trim().toLowerCase());
    setStep(2);
  };

  const activateTrial = () => run(async () => {
    const response = await axios.post(`${API}/setup/auto-trial`, { email: customerEmail, installation_name: "Z-Hub" });
    setLicenseValid(true);
    setLicenseOwner(response.data);
    setAdmin((current) => ({ ...current, email: current.email || customerEmail }));
    toast.success(response.data.recovered ? "TRIAL recuperado para este servidor" : "TRIAL activado automáticamente");
  }, 3);

  const createAdmin = () => run(async () => {
    if (admin.password !== admin.password_confirmation) throw { response: { data: { detail: "Las contraseñas no coinciden" } } };
    await axios.post(`${API}/setup/admin`, admin);
  }, 4);

  const finish = () => run(async () => { await axios.post(`${API}/setup/complete`, {}); }, 5).then(() => { window.location.href = "/"; });
  const input = "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";
  const registrationReady = registration.company_name.trim().length>=2 && registration.contact_name.trim().length>=2 && registration.email.includes("@") && String(registration.phone||"").replace(/\D/g, "").length>=6;

  return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl p-8">
      <div className="text-center mb-8"><div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center"><ShieldCheck className="h-7 w-7 text-white" /></div><h1 className="text-2xl font-bold">Configurar Z-Hub</h1><p className="mt-2 text-sm text-slate-400">Registro, activación automática y configuración inicial</p></div>
      <div className="grid grid-cols-4 gap-2 mb-8">{["Registro", "Activación", "Administrador", "Finalizar"].map((label,index)=>{const n=index+1; const active=step>=n; return <div key={label} className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${active?"bg-cyan-500/15 text-cyan-300":"bg-slate-800 text-slate-500"}`}>{n}. {label}</div>;})}</div>
      {error && <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

      {step===1 && <section>
        <div className="flex items-center gap-3 mb-5"><Building2 className="text-cyan-400"/><div><h2 className="font-semibold">Registra tu empresa</h2><p className="text-xs text-slate-400">Z-Hub preparará tu cuenta y el TRIAL sin abrir el portal Web-Licence.</p></div></div>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-300 mb-2">PAÍS</label><div className="relative"><Globe2 className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none"/><select className={`${input} pl-10`} value={registration.country} onChange={(e)=>setRegistration({...registration,country:e.target.value})}>{LATAM_COUNTRIES.map((item)=><option key={item.name} value={item.name}>{item.name} (+{item.code})</option>)}</select></div></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-2">EMPRESA / ISP</label><input className={input} value={registration.company_name} onChange={(e)=>setRegistration({...registration,company_name:e.target.value})} placeholder="Nombre de tu empresa"/></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-2">NOMBRE DE CONTACTO</label><input className={input} value={registration.contact_name} onChange={(e)=>setRegistration({...registration,contact_name:e.target.value})} placeholder="Nombre y apellido"/></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-2">CORREO ELECTRÓNICO</label><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="email" value={registration.email} onChange={(e)=>setRegistration({...registration,email:e.target.value.trim()})} placeholder="cliente@empresa.com"/></div></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-2">TELÉFONO / WHATSAPP</label><div className="flex gap-2"><div className="w-24 shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-center text-sm font-semibold text-cyan-300">+{country.code}</div><div className="relative flex-1"><Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} inputMode="numeric" value={registration.phone} onChange={(e)=>setRegistration({...registration,phone:e.target.value.replace(/[^0-9 ]/g, "")})} placeholder="Número de WhatsApp"/></div></div><p className="mt-1 text-xs text-slate-500">El prefijo +{country.code} se agrega automáticamente según el país seleccionado.</p></div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={loading} onClick={skipRegistration} className="rounded-xl border border-slate-700 py-3 font-semibold text-slate-200 hover:bg-slate-800">Ya tengo una cuenta</button><button disabled={loading || !registrationReady} onClick={registerCustomer} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold disabled:opacity-50">{loading?"Registrando...":"Registrar y continuar"}</button></div>
      </section>}

      {step===2 && <section>
        <div className="flex items-center gap-3 mb-5"><WandSparkles className="text-cyan-400"/><div><h2 className="font-semibold">Activar prueba de Z-Hub</h2><p className="text-xs text-slate-400">Usa el correo registrado. No necesitas escribir ninguna licencia.</p></div></div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">CORREO REGISTRADO</label>
        <div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="email" value={customerEmail} onChange={(e)=>setCustomerEmail(e.target.value.trim())} placeholder="cliente@empresa.com" autoFocus/></div>
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-xs text-slate-300">Z-Hub identificará este servidor de forma segura. Si este hardware ya utilizó un TRIAL, Web-Licence recuperará el mismo registro. Una cuenta con un TRIAL ligado a otro servidor no obtiene una segunda prueba.</div>
        <div className="mt-6 flex gap-3"><button disabled={loading} onClick={()=>setStep(1)} className="w-1/3 rounded-xl border border-slate-700 py-3 font-semibold">Atrás</button><button disabled={loading || !customerEmail.includes("@")} onClick={activateTrial} className="w-2/3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold disabled:opacity-50">{loading?"Conectando con Web-Licence...":"Activar y continuar"}</button></div>
      </section>}

      {step===3 && <section>
        <div className="flex items-center gap-3 mb-5"><UserRound className="text-cyan-400"/><div><h2 className="font-semibold">Crear cuenta de administrador</h2><p className="text-xs text-slate-400">Esta será la cuenta utilizada para ingresar al panel.</p></div></div>
        {licenseOwner && <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm"><div className="font-semibold text-emerald-300">{licenseOwner.recovered?"TRIAL recuperado":"TRIAL activado"}</div><div className="mt-1 text-slate-200">{licenseOwner.owner||"Empresa registrada"}</div><div className="text-slate-400">Plan {licenseOwner.plan||"TRIAL"} · hasta {licenseOwner.max_clients||20} abonados activos</div></div>}
        <div className="space-y-4"><input className={input} placeholder="Nombre completo" value={admin.name} onChange={(e)=>setAdmin({...admin,name:e.target.value})}/><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="email" placeholder="Correo electrónico" value={admin.email} onChange={(e)=>setAdmin({...admin,email:e.target.value})}/></div><div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="password" placeholder="Contraseña (mínimo 10 caracteres)" value={admin.password} onChange={(e)=>setAdmin({...admin,password:e.target.value})}/></div><div className="relative"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input className={`${input} pl-10`} type="password" placeholder="Confirmar contraseña" value={admin.password_confirmation} onChange={(e)=>setAdmin({...admin,password_confirmation:e.target.value})}/></div></div>
        <div className="mt-6 flex gap-3"><button disabled={loading} onClick={()=>setStep(2)} className="w-1/3 rounded-xl border border-slate-700 py-3 font-semibold">Atrás</button><button disabled={loading||!admin.name||!admin.email||admin.password.length<10} onClick={createAdmin} className="w-2/3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold disabled:opacity-50">{loading?"Creando...":"Siguiente"}</button></div>
      </section>}

      {step===4 && <section className="text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400"/><h2 className="mt-4 text-2xl font-bold">Z-Hub está listo</h2><p className="mt-2 text-sm text-slate-400">El registro, la licencia y la cuenta administrativa fueron configurados.</p><div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-left space-y-3"><div className="flex justify-between"><span className="text-slate-400">Registro</span><span className="text-emerald-400 font-semibold">✓ Preparado</span></div><div className="flex justify-between"><span className="text-slate-400">Licencia</span><span className="text-emerald-400 font-semibold">✓ TRIAL automático</span></div><div className="flex justify-between"><span className="text-slate-400">Administrador</span><span className="text-emerald-400 font-semibold">✓ Configurado</span></div><div className="flex justify-between"><span className="text-slate-400">Versión instalada</span><span className="font-semibold">Z-Hub {PANEL_VERSION}</span></div></div><button disabled={loading||!licenseValid} onClick={finish} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold">{loading?"Finalizando...":"FINALIZAR"}</button></section>}
    </div>
  </div>;
}
