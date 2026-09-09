/**
 * Archivo: frontend/src/modules/auth/Login.jsx
 * Función: Pantalla de inicio de sesión (correo + contraseña).
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { TEST_IDS } from "../../constants/testIds";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { applyPanelTheme } from "../appearance/panelThemes";

export default function Login() {
  const { login, API } = useAuth();
  const [branding, setBranding] = useState({ company_name: "Z-Hub", logo_data: "", panel_theme: "dark" });
  const [email, setEmail] = useState(() => localStorage.getItem("zhub_remembered_email") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => localStorage.getItem("zhub_remember_account") === "true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/settings/public`).then((response) => {
      const name = response.data.company_name?.trim() || "Z-Hub";
      setBranding({ company_name: name, logo_data: response.data.logo_data || "", panel_theme: response.data.panel_theme || "dark" });
      applyPanelTheme(response.data.panel_theme || "dark");
      document.title = `${name} · Z-Hub`;
    }).catch(() => { document.title = "Panel · Z-Hub"; });
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem("zhub_remember_account", "true");
        localStorage.setItem("zhub_remembered_email", email.trim().toLowerCase());
      } else {
        localStorage.removeItem("zhub_remember_account");
        localStorage.removeItem("zhub_remembered_email");
      }
      toast.success(`¡Bienvenido al Panel de Control ${branding.company_name}!`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al iniciar sesión. Verifique credenciales.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error(typeof msg === "string" ? msg : "Error de acceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="login-glow login-glow--primary absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="login-glow login-glow--secondary absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="login-card w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/30">{branding.logo_data ? <img src={branding.logo_data} alt="Logo de empresa" className="h-full w-full object-contain" /> : <img src="/zhub-logo.svg" alt="Z-Hub" className="h-full w-full object-contain bg-white" />}</div>
            <div className="text-left"><h1 className="login-title text-2xl font-bold tracking-tight text-slate-100">{branding.company_name}</h1><p className="text-xs text-cyan-400/80 font-medium tracking-wide uppercase">Panel ISP</p></div>
          </div>
          <p className="login-subtitle text-sm text-slate-400 mt-2">Panel de Facturación, Control de Clientes y Gestión · Z-Hub</p>
        </div>
        {error && <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="login-label block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Correo Electrónico</label><div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" /><input data-testid={TEST_IDS.LOGIN_EMAIL} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" className="login-input w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" /></div></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Contraseña</label><div className="relative"><Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" /><input data-testid={TEST_IDS.LOGIN_PASSWORD} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" /></div></div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-400">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" />
            <span>Recordar mi cuenta</span>
          </label>
          <button data-testid={TEST_IDS.LOGIN_SUBMIT} type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-600/30 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">{loading ? <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <><ShieldCheck className="w-4 h-4" />Ingresar al Sistema</>}</button>
        </form>
      </div>
    </div>
  );
}
