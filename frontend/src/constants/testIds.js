/**
 * Archivo: frontend/src/constants/testIds.js
 * Actualización: 2026-09-08 — las IP visibles en la tabla de abonados se pueden abrir en una pestaña nueva y se incorpora protección de eliminación definitiva de clientes.
 * Función: registro central de atributos data-testid y comportamientos ligeros usados por el panel.
 * Trabaja con: todos los modules/* y components/layout/*; navegación IP y guardia de eliminación.
 */
import "./clientDeleteGuard";

const IPV4_RE = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function enableClientIpLinks() {
  if (typeof document === "undefined" || window.__mikrohubClientIpLinks) return;
  window.__mikrohubClientIpLinks = true;

  document.addEventListener("click", (event) => {
    const element = event.target?.closest?.("td, span, div, a");
    if (!element || !element.closest("tbody")) return;
    const text = (element.textContent || "").trim();
    if (!IPV4_RE.test(text)) return;
    event.preventDefault();
    event.stopPropagation();
    window.open(`http://${text}`, "_blank", "noopener,noreferrer");
  }, true);

  document.addEventListener("mouseover", (event) => {
    const element = event.target?.closest?.("td, span, div, a");
    if (!element || !element.closest("tbody")) return;
    const text = (element.textContent || "").trim();
    if (!IPV4_RE.test(text)) return;
    element.style.cursor = "pointer";
    element.title = `Abrir http://${text} en una nueva pestaña`;
  });
}

enableClientIpLinks();

export const TEST_IDS = {
  NAV_INICIO: "nav-inicio", NAV_RED: "nav-red", NAV_SERVICIOS: "nav-servicios", NAV_CLIENTES: "nav-clientes",
  NAV_FACTURACION: "nav-facturacion", NAV_HOTSPOT: "nav-hotspot", NAV_TAREAS: "nav-tareas", NAV_ALMACEN: "nav-almacen",
  NAV_TICKETS: "nav-tickets", NAV_MENSAJERIA: "nav-mensajeria", NAV_AJUSTES: "nav-ajustes", LOGIN_EMAIL: "login-email-input",
  LOGIN_PASSWORD: "login-password-input", LOGIN_SUBMIT: "login-submit-button", LOGOUT_BTN: "logout-button",
  CLIENT_SEARCH: "client-search-input", BTN_NEW_CLIENT: "btn-new-client", BTN_NEW_INVOICE: "btn-new-invoice",
  BTN_MASS_INVOICES: "btn-mass-invoices", BTN_SYNC_CUTS: "btn-sync-cuts", BTN_NEW_ROUTER: "btn-new-router",
  BTN_NEW_PLAN: "btn-new-plan", BTN_NEW_TICKET: "btn-new-ticket", BTN_NEW_ITEM: "btn-new-item", BTN_GENERATE_HOTSPOT: "btn-generate-hotspot"
};
