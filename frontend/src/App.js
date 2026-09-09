/**
 * Archivo: frontend/src/App.js
 * Función: Componente raíz de React: envuelve la app con el proveedor de autenticación y muestra Login o el Layout del panel según la sesión; monta el contenedor de notificaciones (toasts).
 * Trabaja con: index.js, context/AuthContext.js, modules/auth/Login.jsx, components/layout/Layout.jsx
 */
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./modules/auth/Login";
import Layout from "./components/layout/Layout";
import { Toaster } from "sonner";
import "./App.css";
import "./modules/appearance/panel-theme.css";
import "./modules/appearance/settings-layout.css";
import "./modules/appearance/sidebar-theme.css";
import { bootstrapPanelTheme, getToastTheme } from "./modules/appearance/panelThemes";

bootstrapPanelTheme();

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
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
