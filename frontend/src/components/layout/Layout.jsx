/**
 * Archivo: frontend/src/components/layout/Layout.jsx
 * Función: Estructura principal del panel una vez autenticado: barra lateral, barra
 *          superior y el área de contenido que muestra el módulo activo (pestaña).
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
import Installations from "../../modules/clientes/instalaciones/Installations";
import EquipmentRecovery from "../../modules/clientes/recuperacion/EquipmentRecovery";
import Zones from "../../modules/clientes/zonas/Zones";
import ClientMap from "../../modules/clientes/mapa/ClientMap";
import Billing from "../../modules/facturacion/Billing";
import Hotspot from "../../modules/hotspot/Hotspot";
import Tasks from "../../modules/tareas/Tasks";
import Inventory from "../../modules/almacen/Inventory";
import Tickets from "../../modules/tickets/Tickets";
import Messaging from "../../modules/mensajeria/Messaging";
import SettingsHome from "../../modules/ajustes/SettingsHome";
import SettingsModal from "../../modules/ajustes/SettingsModal";
import { PANEL_VERSION } from "../../modules/system-update/version";
import { applyPanelTheme } from "../../modules/appearance/panelThemes";

const LOCKED_LICENSE_STATUSES = new Set(["trial_expired", "invalid", "missing"]);

export default function Layout() {
  const { API, token } = useAuth();
  const storedTab = localStorage.getItem("fibraz_active_tab") || "inicio";
  const legacySettingsSection = storedTab === "settings_clients" ? "clients" : storedTab.startsWith("settings_") ? storedTab.replace("settings_", "") : null;
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("fibraz_company_name") || "Z-Hub");
  const [logoData, setLogoData] = useState(() => localStorage.getItem("fibraz_logo_data") || "");
  const [activeTab, setActiveTab] = useState(() => legacySettingsSection ? "ajustes" : storedTab);
  const [settingsModalSection, setSettingsModalSection] = useState(legacySettingsSection);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem("fibraz_sidebar_open") !== "false");
  const [licenseLocked, setLicenseLocked] = useState(false);

  useEffect(() => { localStorage.setItem("fibraz_active_tab", activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem("fibraz_sidebar_open", String(sidebarOpen)); }, [sidebarOpen]);

  useEffect(() => {
    const loadCompanyName = async () => {
      try {
        const response = await axios.get(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        const name = response.data.company_name?.trim() || "Z-Hub";
        const logo = response.data.logo_data || "";
        setCompanyName(name); setLogoData(logo); applyPanelTheme(response.data.panel_theme || "dark");
        localStorage.setItem("fibraz_company_name", name); localStorage.setItem("fibraz_logo_data", logo);
      } catch (_) {}
    };
    loadCompanyName();
  }, [API, token]);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const response = await axios.get(`${API}/license/info`, { headers: token ? { Authorization:`Bearer ${token}` } : {} });
        const status = String(response.data?.status || "").toLowerCase();
        const blocked = LOCKED_LICENSE_STATUSES.has(status) || Boolean(response.data?.read_only);
        setLicenseLocked(blocked);
        if (blocked) {
          setActiveTab("ajustes");
          setSettingsModalSection("license");
        }
      } catch (_) {}
    };
    checkLicense();
    const onLicenseUpdated = () => checkLicense();
    window.addEventListener("zhub-license-updated", onLicenseUpdated);
    return () => window.removeEventListener("zhub-license-updated", onLicenseUpdated);
  }, [API, token]);

  useEffect(() => {
    const syncName = (event) => {
      const name = event.detail?.companyName?.trim() || "Z-Hub";
      const logo = event.detail?.logoData || "";
      setCompanyName(name); setLogoData(logo);
      if (event.detail?.panelTheme) applyPanelTheme(event.detail.panelTheme);
      localStorage.setItem("fibraz_company_name", name); localStorage.setItem("fibraz_logo_data", logo);
    };
    window.addEventListener("fibraz-branding", syncName);
    return () => window.removeEventListener("fibraz-branding", syncName);
  }, []);

  useEffect(() => { document.title = `${companyName} · Z-Hub`; }, [companyName]);

  const openSettingsSection = (section) => setSettingsModalSection(section);
  const closeSettingsModal = () => {
    if (licenseLocked && settingsModalSection === "license") return;
    setSettingsModalSection(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio": return <Dashboard setActiveTab={setActiveTab} />;
      case "red":
      case "routers": return <Network focus="mikrotik" />;
      case "olts": return <Network focus="olt" />;
      case "red_ipv4": return <IPv4Networks />;
      case "nap_boxes": return <NapBoxes />;
      case "monitoring": return <Monitoring />;
      case "servicios": return <Plans />;
      case "clientes":
      case "client_users": return <Users onOpenRecovery={() => setActiveTab("client_recovery")} />;
      case "client_zones": return <Zones />;
      case "client_installations": return <Installations onContinueToClient={() => setActiveTab("client_users")} />;
      case "client_recovery": return <EquipmentRecovery />;
      case "client_map": return <ClientMap />;
      case "facturacion": return <Billing />;
      case "hotspot": return <Hotspot />;
      case "tareas": return <Tasks />;
      case "almacen": return <Inventory />;
      case "tickets": return <Tickets />;
      case "mensajeria": return <Messaging />;
      case "ajustes": return <SettingsHome onOpen={openSettingsSection} />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { if (licenseLocked) return; closeSettingsModal(); setActiveTab(tab); }} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} companyName={companyName} logoData={logoData} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <Navbar setActiveTab={(tab) => { if (licenseLocked) return; closeSettingsModal(); setActiveTab(tab); }} />
        <main className="flex-1 w-full max-w-none px-4 py-4 sm:px-6 sm:py-6 lg:px-6 lg:py-7">{renderContent()}</main>
        <footer className="panel-footer mt-auto border-t px-6 py-3 text-center text-sm font-bold tracking-wide text-slate-600">Panel Z-Hub · v{PANEL_VERSION}</footer>
      </div>
      {activeTab === "ajustes" && <SettingsModal section={settingsModalSection} onClose={closeSettingsModal} locked={licenseLocked && settingsModalSection === "license"} />}
    </div>
  );
}
