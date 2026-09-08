/**
 * MikroHub — verificación cruzada del resumen de eliminación.
 * Actualización 2026-09-08: usa las mismas fuentes que la ficha Cliente/Servicios y Facturación
 * para evitar que la ventana de eliminación muestre 0 cuando los datos reales existen.
 * Trabaja con: clientDeleteGuard.js, /clients/{id}/services y /invoices.
 */
import axios from "axios";

if (typeof window !== "undefined" && !window.__mikrohubClientDeleteSummaryFix) {
  window.__mikrohubClientDeleteSummaryFix = true;

  axios.interceptors.response.use(async (response) => {
    const url = String(response?.config?.url || "");
    if (!/\/clients\/[^/?#]+\/deletion-summary\/?$/.test(url)) return response;
    if (response.config.__mikrohubSummaryEnriched) return response;

    const match = url.match(/\/clients\/([^/?#]+)\/deletion-summary\/?$/);
    if (!match) return response;

    const clientId = match[1];
    const base = (response.config.baseURL || axios.defaults.baseURL || "").replace(/\/$/, "");
    const apiRoot = /^https?:\/\//i.test(url) ? url.replace(/\/clients\/[^/?#]+\/deletion-summary\/?$/, "") : base;
    const headers = response.config.headers || {};

    try {
      const [servicesResponse, invoicesResponse] = await Promise.all([
        axios.get(`${apiRoot}/clients/${clientId}/services`, { headers }),
        axios.get(`${apiRoot}/invoices`, { headers }),
      ]);

      const services = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
      const invoices = Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [];
      const pendingInvoices = invoices.filter((invoice) =>
        String(invoice?.client_id || "") === String(clientId) &&
        ["unpaid", "overdue"].includes(String(invoice?.status || "").toLowerCase())
      );

      const summary = response.data || {};
      const pendingTotal = pendingInvoices.reduce((total, invoice) => {
        const amount = Number(invoice?.amount || 0);
        const paid = Number(invoice?.paid_amount || 0);
        return total + Math.max(0, amount - paid);
      }, 0);

      response.data = {
        ...summary,
        services,
        service_count: services.length,
        pending_invoice_count: pendingInvoices.length,
        pending_total: Number(pendingTotal.toFixed(2)),
      };
      response.config.__mikrohubSummaryEnriched = true;
    } catch (error) {
      // Si la verificación cruzada falla, no ocultamos el error original del resumen.
      // El guardia principal mantiene el bloqueo por seguridad cuando el resumen no puede obtenerse.
      console.warn("MikroHub: no se pudo cruzar el resumen de eliminación", error);
    }

    return response;
  });
}
