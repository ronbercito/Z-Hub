/**
 * MikroHub: evita el confirm() nativo del navegador en la eliminación de clientes.
 * El flujo real de confirmación lo presenta clientDeleteGuard.js mediante el modal del panel.
 */
const CLIENT_DELETE_CONFIRM_RE = /¿Estás seguro de eliminar el cliente/i;

if (typeof window !== "undefined" && !window.__mikrohubNativeClientDeleteBlocked) {
  window.__mikrohubNativeClientDeleteBlocked = true;
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = (message) => {
    if (CLIENT_DELETE_CONFIRM_RE.test(String(message || ""))) {
      // Clients.jsx todavía llama confirm() antes de enviar el DELETE.
      // Permitimos que el interceptor de clientDeleteGuard.js muestre el modal propio.
      return true;
    }
    return nativeConfirm(message);
  };
}
