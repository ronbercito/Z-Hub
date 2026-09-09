/**
 * Archivo: frontend/src/components/layout/Layout.jsx
 * Función: Estructura principal del panel una vez autenticado: barra lateral, barra
 *          superior y el área de contenido que muestra el módulo activo (pestaña).
 * Trabaja con: components/layout/Sidebar.jsx, components/layout/Navbar.jsx,
 *              modules/<modulo>/*.jsx (Dashboard, Network, Plans, Clients, Billing,
 *              Hotspot, Tasks, Inventory, Tickets, Messaging, Settings)
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Dashboard from "../../modules/inicio/Dashboard";
import Network from "../../modules/red/Network";
import IPv4Networks from "../../modules/red/ipv4/IPv4Networks";
import NapBoxes from "../../modules/red/nap_boxes/NapBoxes";
import Monitoring from "../../modules/red/monitoring/Monitoring";
import Plans from "../../modules/planes/Plans";
import Users from "../../modules/clientes/usuarios/Users";
import Zones from "../../modules/clientes/zonas/Zones";
import ClientMap from "../../modules/clientes/mapa/ClientMap";
import Billing from "../../modules/facturacion/Billing";
import Hotspot from "../../modules/hotspot/Hotspot";
import Tasks from "../../modules/tareas/Tasks";
import Inventory from "../../modules/almacen/Inventory";
import Tickets from "../../modules/tickets/Tickets";
import Messaging from "../../modules/mensajeria/Messaging";
import Settings from "../../modules/ajustes/Settings";
import { PANEL_VERSION } from "../../modules/system-update/version";
import { applyPanelTheme } from "../../modules/appearance/panelThemes";

export default function Layout() {
  const { API, token } = useAuth();
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("fibraz_company_name") || "Z-Hub");
  const [logoData, setLogoData] = useState(() => localStorage.getItem("fibraz_logo_data") || "");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("fibraz_active_tab") || "inicio");
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem("fibraz_sidebar_open") !== "false");

  useEffect(() => { localStorage.setItem("fibraz_active_tab", activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem("fibraz_sidebar_open", String(sidebarOpen)); }, [sidebarOpen]);

  useEffect(() => {
    const loadCompanyName = async () => {
      try {
        const response = await axios.get(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        const name = response.data.company_name?.trim() || "Z-Hub";
        const logo = response.data.logo_data || "";
        setCompanyName(name);
        setLogoData(logo);
        applyPanelTheme(response.data.panel_theme || "dark");
        localStorage.setItem("fibraz_company_name", name);
        localStorage.setItem("fibraz_logo_data", logo);
      } catch (_) {
        // Se conserva el último nombre conocido si el backend no está disponible.
      }
    };
    loadCompanyName();
  }, [API, token]);

  useEffect(() => {
    const syncName = (event) => {
      const name = event.detail?.companyName?.trim() || "Z-Hub";
      const logo = event.detail?.logoData || "";
      setCompanyName(name);
      setLogoData(logo);
      if (event.detail?.panelTheme) applyPanelTheme(event.detail.panelTheme);
      localStorage.setItem("fibraz_company_name", name);
      localStorage.setItem("fibraz_logo_data", logo);
    };
    window.addEventListener("fibraz-branding", syncName);
    return () => window.removeEventListener("fibraz-branding", syncName);
  }, []);

  useEffect(() => { document.title = `${companyName} · Z-Hub`; }, [companyName]);

  const renderContent = () => {
    if (activeTab.startsWith("settings_")) return <Settings section={activeTab.replace("settings_", "")} />;
    switch (activeTab) {
      case "inicio":
        return <Dashboard setActiveTab={setActiveTab} />;
      case "red":
      case "routers":
        return <Network focus="mikrotik" />;
      case "olts":
        return <Network focus="olt" />;
      case "red_ipv4":
        return <IPv4Networks />;
      case "nap_boxes":
        return <NapBoxes />;
      case "monitoring":
        return <Monitoring />;
      case "servicios":
        return <Plans />;
      case "clientes":
      case "client_users":
        return <Users />;
      case "client_zones":
        return <Zones />;
      case "client_map":
        return <ClientMap />;
      case "facturacion":
        return <Billing />;
      case "hotspot":
        return <Hotspot />;
      case "tareas":
        return <Tasks />;
      case "almacen":
        return <Inventory />;
      case "tickets":
        return <Tickets />;
      case "mensajeria":
        return <Messaging />;
      case "ajustes":
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        companyName={companyName}
        logoData={logoData}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-20"
      }`}>
        <Navbar setActiveTab={setActiveTab} />
        <main className="flex-1 w-full max-w-none px-4 py-4 sm:px-6 sm:py-6 lg:px-6 lg:py-7">
          {renderContent()}
        </main>
        <footer className="panel-footer mt-auto border-t px-6 py-3 text-center text-sm font-bold tracking-wide text-slate-600">Panel Z-Hub · v{PANEL_VERSION}</footer>
      </div>
    </div>
  );
}
