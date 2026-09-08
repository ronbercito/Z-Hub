/**
 * Archivo: frontend/src/constants/clientDeleteGuard.js
 * Actualización: 2026-09-08 — protección de eliminación definitiva de clientes con múltiples servicios y facturación pendiente.
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
    if (typeof message === "string" && /^¿Estás seguro de eliminar el cliente/.test(message)) return true;
    return originalConfirm(message);
  };

  axios.interceptors.request.use(async (config) => {
    if ((config.method || "").toLowerCase() !== "delete" || config.__mikrohubDeleteConfirmed) return config;
    const match = String(config.url || "").match(DELETE_CLIENT_RE);
    if (!match) return config;

    const clientId = match[1];
    try {
      const configuredBase = config.baseURL || "";
      const originalUrl = String(config.url || "");
      const apiRoot = originalUrl.includes("/clients/")
        ? originalUrl.replace(DELETE_CLIENT_RE, "")
        : configuredBase;
      const headers = config.headers || {};
      const makeUrl = (suffix) => `${apiRoot}/clients/${clientId}${suffix}`;
      const [clientRes, servicesRes, invoicesRes] = await Promise.all([
        originalRequest({ method: "get", url: makeUrl(""), headers }),
        originalRequest({ method: "get", url: makeUrl("/services"), headers }),
        originalRequest({ method: "get", url: makeUrl("/invoices"), headers })
      ]);

      const clientName = clientRes.data?.full_name || clientId;
      const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];
      const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      const pending = invoices.filter((invoice) => ["unpaid", "overdue"].includes(invoice.status));
      const pendingTotal = pending.reduce(
        (sum, invoice) => sum + Math.max(0, Number(invoice.amount || 0) - Number(invoice.paid_amount || 0)),
        0
      );

      if (services.length > 1 && pending.length > 0) {
        const observation = [
          "⚠️ ALERTA DE ELIMINACIÓN DEFINITIVA",
          "",
          `Cliente: ${clientName}`,
          `Servicios registrados: ${services.length}`,
          `Facturas pendientes: ${pending.length}`,
          `Saldo pendiente: S/. ${pendingTotal.toFixed(2)}`,
          "",
          "OBSERVACIONES:",
          "• Se eliminarán todos los servicios del cliente.",
          "• Se eliminarán las facturas y registros asociados al cliente.",
          "• Esta operación es definitiva y no se puede deshacer.",
          "",
          "Confirmación requerida:",
          "Escribe SI para proceder o NO para cancelar."
        ].join("\n");
        const answer = window.prompt(observation, "");
        if (String(answer || "").trim().toUpperCase() !== "SI") {
          const error = new Error("Eliminación cancelada por el operador.");
          error.__mikrohubDeleteCancelled = true;
          throw error;
        }
      } else if (!originalConfirm(`¿Estás seguro de eliminar el cliente "${clientName}"?`)) {
        const error = new Error("Eliminación cancelada por el operador.");
        error.__mikrohubDeleteCancelled = true;
        throw error;
      }
    } catch (error) {
      if (error.__mikrohubDeleteCancelled) throw error;
      console.error("MikroHub: no se pudo verificar servicios/facturación antes de eliminar", error);
      const cancel = new Error("No se pudo verificar la información del cliente. Eliminación cancelada por seguridad.");
      cancel.__mikrohubDeleteCancelled = true;
      throw cancel;
    }

    config.__mikrohubDeleteConfirmed = true;
    return config;
  });
}

installClientDeleteGuard();
