/**
 * Archivo: frontend/src/constants/clientDeleteGuard.js
 * Actualización: 2026-09-08 — se restaura el aviso nativo de eliminación que ya mostraba las dependencias reales.
 * Función: intercepta la eliminación de clientes desde el panel para consultar servicios/facturas y solicitar confirmación reforzada cuando corresponde.
 * Trabaja con: frontend/src/modules/clientes/Clients.jsx y API /clients/{id}.
 */
import axios from "axios";

const DELETE_CLIENT_RE = /\/clients\/([^/?#]+)\/?$/;

function installClientDeleteGuard() {
  if (typeof window === "undefined" || window.__mikrohubClientDeleteGuard) return;
  window.__mikrohubClientDeleteGuard = true;

  const originalConfirm = window.confirm.bind(window);
  const originalRequest = axios.request.bind(axios);

  window.confirm = (message) => {
    if (typeof message === "string" && /^¿Estás seguro de eliminar el cliente/.test(message)) {
      return true;
    }
    return originalConfirm(message);
  };

  axios.interceptors.request.use(async (config) => {
    if ((config.method || "").toLowerCase() !== "delete" || config.__mikrohubDeleteConfirmed) return config;
    const match = String(config.url || "").match(DELETE_CLIENT_RE);
    if (!match) return config;

    const clientId = match[1];
    try {
      const baseURL = config.baseURL || "";
      const headers = config.headers || {};
      const [servicesRes, invoicesRes] = await Promise.all([
        originalRequest({ method: "get", baseURL, url: `/clients/${clientId}/services`, headers }),
        originalRequest({ method: "get", baseURL, url: `/clients/${clientId}/invoices`, headers })
      ]);

      const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      const pending = invoices.filter((invoice) => ["unpaid", "overdue"].includes(invoice.status));
      const pendingTotal = pending.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.amount || 0) - Number(invoice.paid_amount || 0)), 0);

      if (services.length > 1 && pending.length > 0) {
        const observation = [
          "⚠️ ALERTA DE ELIMINACIÓN DEFINITIVA",
          "",
          `Cliente: ${String(messageFromDelete(config) || clientId)}`,
          `Servicios registrados: ${services.length}`,
          `Facturas pendientes: ${pending.length}`,
          `Saldo pendiente: S/. ${pendingTotal.toFixed(2)}`,
          "",
          "OBSERVACIONES:",
          "• Se eliminarán todos los servicios del cliente.",
          "• Se eliminarán también las facturas y registros asociados al cliente.",
          "• Esta operación es definitiva y no se puede deshacer.",
          "",
          "Para continuar escribe SI. Para cancelar escribe NO."
        ].join("\n");
        const answer = window.prompt(observation, "");
        if (String(answer || "").trim().toUpperCase() !== "SI") {
          const error = new Error("Eliminación cancelada por el operador.");
          error.__mikrohubDeleteCancelled = true;
          throw error;
        }
      } else if (!originalConfirm(`¿Estás seguro de eliminar el cliente "${String(messageFromDelete(config) || clientId)}"?`)) {
        const error = new Error("Eliminación cancelada por el operador.");
        error.__mikrohubDeleteCancelled = true;
        throw error;
      }
    } catch (error) {
      if (error.__mikrohubDeleteCancelled) throw error;
      console.error("MikroHub: no se pudo validar la eliminación del cliente", error);
      if (!originalConfirm("No se pudo verificar servicios/facturación del cliente. ¿Deseas continuar con la eliminación definitiva?")) {
        const cancel = new Error("Eliminación cancelada por el operador.");
        cancel.__mikrohubDeleteCancelled = true;
        throw cancel;
      }
    }

    config.__mikrohubDeleteConfirmed = true;
    return config;
  });
}

function messageFromDelete(config) {
  return config.__mikrohubDeleteClientName || "";
}

installClientDeleteGuard();
