import React, { useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import Settings from "./Settings";
import ClientSettings from "./clientes/ClientSettings";
import LicenseSettings from "./LicenseSettings";
import "./settings-modal.css";

export default function SettingsModal({ section, onClose }) {
  useEffect(() => {
    if (!section) return undefined;
    const onKey = (event) => { if (event.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section, onClose]);

  useEffect(() => {
    if (!section) return undefined;
    const interceptor = axios.interceptors.response.use((response) => {
      const method = String(response?.config?.method || "").toLowerCase();
      const url = String(response?.config?.url || "");
      const isWrite = ["post", "put", "patch", "delete"].includes(method);
      const isUtilityAction = /\/test(?:\?|$)/.test(url);
      if (isWrite && !isUtilityAction) window.setTimeout(() => onClose?.(), 120);
      return response;
    }, (error) => Promise.reject(error));
    return () => axios.interceptors.response.eject(interceptor);
  }, [section, onClose]);

  if (!section) return null;
  const title = section === "clients" ? "Configuración clientes" : section === "license" ? "Licencia Z-Hub" : null;

  return <div className="settings-modal-backdrop" onMouseDown={onClose} role="presentation">
    <section className="settings-modal-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title || "Configuración"}>
      <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Cerrar"><X /></button>
      <div className="settings-modal-scroll">
        {section === "clients" ? <ClientSettings compact /> : section === "license" ? <LicenseSettings /> : <Settings section={section} compact />}
      </div>
    </section>
  </div>;
}
