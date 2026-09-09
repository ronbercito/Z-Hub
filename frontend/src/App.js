/**
 * Archivo: frontend/src/App.js
 * Función: Componente raíz de React: muestra el asistente de configuración inicial antes del login cuando una instalación nueva aún no fue configurada.
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./modules/auth/Login";
import SetupWizard from "./modules/setup/SetupWizard";
import Layout from "./components/layout/Layout";
import { Toaster } from "sonner";
import "./App.css";
import "./modules/appearance/panel-theme.css";
import "./modules/appearance/network-metrics.css";
import "./modules/appearance/settings-layout.css";
import "./modules/appearance/sidebar-theme.css";
import { bootstrapPanelTheme, getToastTheme } from "./modules/appearance/panelThemes";

bootstrapPanelTheme();

function MainApp() {
  const { user, loading } = useAuth();
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    axios
      .get("/api/setup/status")
      .then((response) => setSetupRequired(Boolean(response.data.setup_required)))
      .catch(() => setSetupRequired(false))
      .finally(() => setSetupLoading(false));
  }, []);

  if (setupLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (setupRequired) return <SetupWizard />;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Iniciando Z-Hub ISP...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  return <Layout />;
}

function ThemedToaster() {
  const [theme, setTheme] = useState(() => getToastTheme());

  useEffect(() => {
    const sync = () => setTheme(getToastTheme());
    window.addEventListener("zhub-theme-changed", sync);
    return () => window.removeEventListener("zhub-theme-changed", sync);
  }, []);

  return <Toaster position="top-right" richColors theme={theme} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      <ThemedToaster />
    </AuthProvider>
  );
}
