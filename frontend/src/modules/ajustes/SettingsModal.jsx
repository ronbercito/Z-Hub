import React, { useEffect } from "react";
import { X } from "lucide-react";
import Settings from "./Settings";
import ClientSettings from "./clientes/ClientSettings";
import "./settings-modal.css";

export default function SettingsModal({ section, onClose }) {
  useEffect(() => {
    if (!section) return undefined;
    const onKey = (event) => { if (event.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section, onClose]);

  if (!section) return null;
  const title = section === "clients" ? "Configuración clientes" : null;

  return <div className="settings-modal-backdrop" onMouseDown={onClose} role="presentation">
    <section className="settings-modal-panel" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title || "Configuración"}>
      <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Cerrar"><X /></button>
      <div className="settings-modal-scroll">
        {section === "clients" ? <ClientSettings onSaved={onClose} compact /> : <Settings section={section} onSaved={onClose} compact />}
      </div>
    </section>
  </div>;
}
