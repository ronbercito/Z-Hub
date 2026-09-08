/*
 * MikroHub — confirmaciones críticas de eliminación.
 * Actualización 2026-09-08: ventana visual roja reutilizable para eliminar clientes y servicios adicionales.
 * Función: presenta confirmaciones críticas con diseño consistente y evita los diálogos nativos del navegador.
 * Clientes: recibe un resumen ya validado desde Clients.jsx; no consulta ni intercepta Axios.
 * Servicios: intercepta únicamente los window.confirm() generados por ClientServiceEditor para reemplazarlos por el mismo patrón visual.
 */
import axios from "axios";

const DELETE_CLIENT_RE = /\/clients\/([^/?#]+)\/?$/;
const CLIENT_DELETE_CONFIRM_RE = /¿Estás seguro de eliminar el cliente/i;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function serviceLabel(service, index) {
  if (service?.label) return service.label;
  const plan = service?.plan_name || service?.plan?.name || "Sin plan";
  if (service?.is_primary || index === 0) return `Servicio principal · ${plan}`;
  return `Servicio ${index + 1} · ${plan}`;
}

export function showDeleteModal({ clientName, services = [], pendingCount = 0, pendingTotal = 0, priority = false }) {
  return new Promise((resolve) => {
    document.getElementById("mikrohub-critical-delete-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "mikrohub-critical-delete-modal";
    const title = priority ? "Advertencia prioritaria" : "Confirmar eliminación";
    const intro = priority
      ? "Esta acción eliminará definitivamente la información asociada al cliente."
      : "Se eliminará definitivamente el cliente y la información asociada.";
    const observations = priority
      ? `<div>Observaciones</div>
         <p>• Se eliminarán todos los servicios registrados del cliente.</p>
         <p>• Se eliminarán las ${pendingCount} factura${pendingCount === 1 ? "" : "s"} pendientes y sus registros asociados.</p>
         <p>• El saldo pendiente total es S/. ${pendingTotal.toFixed(2)}.</p>
         <p>• Los datos eliminados no podrán recuperarse desde el panel.</p>`
      : `<div>Antes de continuar</div>
         <p>• Revisa que el cliente sea el correcto.</p>
         <p>• Esta operación es definitiva y no podrá deshacerse desde el panel.</p>`;
    const serviceItems = services.length
      ? services.map((service, index) => `<li>${escapeHtml(serviceLabel(service, index))}</li>`).join("")
      : "<li>Sin servicios registrados</li>";

    overlay.innerHTML = `<div class="mk-delete-card ${priority ? "is-priority" : ""}" role="dialog" aria-modal="true">
      <div class="mk-delete-head"><div class="mk-delete-icon">${priority ? "⚠" : "?"}</div>
        <div><div class="mk-delete-title">${title}</div><div class="mk-delete-sub">${priority ? "Eliminación definitiva del cliente" : "Confirma esta operación antes de continuar"}</div></div>
        <button class="mk-delete-x" data-close aria-label="Cerrar">×</button>
      </div>
      <div class="mk-delete-body">
        <div class="mk-delete-alert"><strong>${priority ? "ATENCIÓN PRIORITARIA" : "CONFIRMACIÓN"}</strong><span>${intro}</span></div>
        <div class="mk-delete-grid">
          <span>Cliente</span><strong>${escapeHtml(clientName)}</strong>
          <span>Servicios</span><strong>${services.length}</strong>
          <div class="mk-delete-services"><ul>${serviceItems}</ul></div>
          <span>Facturas pendientes</span><strong>${pendingCount}</strong>
          <span>Saldo pendiente</span><strong>S/. ${pendingTotal.toFixed(2)}</strong>
        </div>
        <div class="mk-delete-observations">${observations}</div>
        <div class="mk-delete-confirm-note">Para confirmar, escribe <b>SI</b>. Para cancelar, escribe <b>NO</b> o cierra esta ventana.</div>
        <input class="mk-delete-input" data-confirm type="text" autocomplete="off" placeholder="Escribe SI para confirmar" />
      </div>
      <div class="mk-delete-foot"><button class="mk-delete-cancel" data-cancel>Cancelar</button><button class="mk-delete-confirm" data-confirm-button disabled>Eliminar definitivamente</button></div>
    </div>`;

    const style = document.createElement("style");
    style.textContent = `
      #mikrohub-critical-delete-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,6,23,.74);backdrop-filter:blur(6px);font-family:Inter,system-ui,sans-serif}
      #mikrohub-critical-delete-modal .mk-delete-card{width:min(520px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#111827;color:#e5e7eb;border:1px solid rgba(148,163,184,.2);border-radius:16px;box-shadow:0 25px 70px rgba(0,0,0,.58)}
      #mikrohub-critical-delete-modal .is-priority{border-color:rgba(190,76,91,.55);box-shadow:0 25px 70px rgba(0,0,0,.58),0 0 0 4px rgba(127,29,29,.1)}
      .mk-delete-head{display:flex;align-items:center;gap:12px;padding:17px 20px;border-bottom:1px solid rgba(148,163,184,.14)}
      .mk-delete-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(14,165,233,.12);border:1px solid rgba(56,189,248,.25);color:#7dd3fc;font-size:20px;font-weight:800}
      .is-priority .mk-delete-icon{background:rgba(159,50,65,.16);border-color:rgba(210,94,108,.34);color:#f3a0aa}
      .mk-delete-title{font-size:16px;font-weight:750;color:#f8fafc}.mk-delete-sub{font-size:12px;color:#94a3b8;margin-top:3px}.mk-delete-x{margin-left:auto;border:0;background:transparent;color:#94a3b8;font-size:23px;cursor:pointer}
      .mk-delete-body{padding:18px 20px}.mk-delete-alert{display:flex;flex-direction:column;gap:3px;padding:12px 13px;border:1px solid rgba(148,163,184,.18);border-radius:11px;background:rgba(15,23,42,.72);color:#cbd5e1;font-size:12px}.mk-delete-alert strong{color:#7dd3fc}
      .is-priority .mk-delete-alert{border-color:rgba(190,76,91,.34);background:linear-gradient(135deg,rgba(127,29,29,.2),rgba(69,10,10,.1));color:#f3c1c6}.is-priority .mk-delete-alert strong{color:#f0a0aa}
      .mk-delete-grid{display:grid;grid-template-columns:1fr auto;gap:8px 16px;margin-top:14px;padding:12px 13px;border:1px solid rgba(148,163,184,.14);border-radius:11px;background:rgba(15,23,42,.66);font-size:13px}.mk-delete-grid span{color:#94a3b8}.mk-delete-grid strong{color:#f8fafc}
      .mk-delete-services{grid-column:1/-1;padding:8px 10px;border-radius:8px;background:rgba(2,6,23,.35);border:1px solid rgba(148,163,184,.1)}.mk-delete-services ul{margin:0;padding-left:18px;color:#cbd5e1}.mk-delete-services li{margin:3px 0}
      .mk-delete-observations{margin-top:15px;font-size:12px;color:#cbd5e1;line-height:1.45}.mk-delete-observations>div{font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:6px}.mk-delete-observations p{margin:4px 0}
      .mk-delete-confirm-note{margin-top:15px;padding:10px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.55);color:#cbd5e1;font-size:12px}.is-priority .mk-delete-confirm-note{border-color:rgba(190,110,70,.28);background:rgba(124,45,18,.08);color:#eab49a}
      .mk-delete-input{box-sizing:border-box;width:100%;height:42px;margin-top:12px;border:1px solid rgba(148,163,184,.25);border-radius:9px;background:#0b1120;color:#f8fafc;padding:0 12px;outline:none}.mk-delete-input:focus{border-color:#7dd3fc;box-shadow:0 0 0 3px rgba(56,189,248,.1)}.is-priority .mk-delete-input{border-color:rgba(190,76,91,.3)}
      .mk-delete-foot{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px 18px;border-top:1px solid rgba(148,163,184,.14)}.mk-delete-cancel,.mk-delete-confirm{height:38px;padding:0 16px;border-radius:9px;font-weight:700;cursor:pointer}.mk-delete-cancel{border:1px solid rgba(148,163,184,.25);background:#1e293b;color:#cbd5e1}.mk-delete-confirm{border:1px solid rgba(190,76,91,.42);background:linear-gradient(135deg,#a33a4b,#752536);color:#fff}.mk-delete-confirm:disabled{opacity:.45;cursor:not-allowed}`;
    document.head.appendChild(style); document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-confirm]"), button = overlay.querySelector("[data-confirm-button]");
    const finish = (ok) => { overlay.remove(); style.remove(); resolve(ok); };
    const update = () => { button.disabled = input.value.trim().toUpperCase() !== "SI"; };
    input.addEventListener("input", update);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") finish(false);
      if (event.key === "Enter" && input.value.trim().toUpperCase() === "SI") finish(true);
    });
    button.addEventListener("click", () => finish(true));
    overlay.querySelector("[data-cancel]").addEventListener("click", () => finish(false));
    overlay.querySelector("[data-close]").addEventListener("click", () => finish(false));
    overlay.addEventListener("click", (event) => { if (event.target === overlay) finish(false); });
    setTimeout(() => input.focus(), 0);
  });
}

function parseServiceDeleteMessage(message) {
  const text = String(message || "");
  const secondStep = /SEGUNDA ADVERTENCIA/i.test(text);
  if (secondStep) {
    const pending = text.match(/tiene\s+(\d+)\s+factura\(s\)\s+pendiente\(s\)\s+por\s+un\s+total\s+de\s+S\/.\s*([\d.,]+)/i);
    return {
      secondStep: true,
      count: pending ? Number(pending[1]) : null,
      total: pending ? pending[2] : null,
      message: text,
    };
  }
  const service = text.match(/Vas a eliminar\s+(.+?)\.\s*\n([\s\S]*?)\n\nEsta acción/i);
  const details = service?.[2]
    ? service[2].split("|").map((part) => part.trim()).filter(Boolean)
    : [];
  return {
    secondStep: false,
    serviceName: service?.[1] || "el servicio adicional seleccionado",
    details,
    message: text,
  };
}

function showServiceDeleteModal(message) {
  const parsed = parseServiceDeleteMessage(message);
  return new Promise((resolve) => {
    document.getElementById("mikrohub-service-delete-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "mikrohub-service-delete-modal";
    const title = parsed.secondStep ? "Confirmación de facturas" : "Advertencia prioritaria";
    const subtitle = parsed.secondStep ? "Eliminación del servicio y facturación pendiente" : "Eliminación definitiva del servicio adicional";
    const intro = parsed.secondStep
      ? "Este servicio tiene facturación pendiente asociada. Revisa el impacto antes de continuar."
      : "Esta acción eliminará definitivamente el servicio seleccionado del cliente.";
    const detailsHtml = parsed.secondStep
      ? `<span>Facturas pendientes</span><strong>${parsed.count ?? "—"}</strong><span>Total pendiente</span><strong>S/. ${escapeHtml(parsed.total ?? "0.00")}</strong>`
      : parsed.details.length
        ? parsed.details.map((detail) => { const [label, ...rest] = detail.split(":"); return `<span>${escapeHtml(label.trim())}</span><strong>${escapeHtml(rest.join(":").trim() || "—")}</strong>`; }).join("")
        : `<span>Servicio</span><strong>${escapeHtml(parsed.serviceName)}</strong>`;
    const observations = parsed.secondStep
      ? `<div>Observaciones</div><p>• Se eliminará el servicio y también las facturas pendientes indicadas.</p><p>• Las facturas pagadas o parcialmente pagadas no se eliminan mediante este flujo.</p><p>• La operación no puede deshacerse desde el panel.</p>`
      : `<div>Observaciones</div><p>• El servicio dejará de aparecer en la ficha del cliente.</p><p>• La eliminación es permanente.</p><p>• Si existen facturas pendientes, aparecerá una segunda confirmación antes de eliminarlas.</p>`;
    overlay.innerHTML = `<div class="mk-service-delete-card" role="dialog" aria-modal="true">
      <div class="mk-service-delete-head"><div class="mk-service-delete-icon">⚠</div><div><div class="mk-service-delete-title">${title}</div><div class="mk-service-delete-sub">${subtitle}</div></div><button class="mk-service-delete-x" data-close aria-label="Cerrar">×</button></div>
      <div class="mk-service-delete-body">
        <div class="mk-service-delete-alert"><strong>ATENCIÓN PRIORITARIA</strong><span>${intro}</span></div>
        <div class="mk-service-delete-grid">${!parsed.secondStep ? `<span>Servicio</span><strong>${escapeHtml(parsed.serviceName)}</strong>` : ""}${detailsHtml}</div>
        <div class="mk-service-delete-observations">${observations}</div>
        <div class="mk-service-delete-confirm-note">Para confirmar, escribe <b>SI</b>. Para cancelar, escribe <b>NO</b> o cierra esta ventana.</div>
        <input class="mk-service-delete-input" data-confirm type="text" autocomplete="off" placeholder="Escribe SI para confirmar" />
      </div>
      <div class="mk-service-delete-foot"><button class="mk-service-delete-cancel" data-cancel>Cancelar</button><button class="mk-service-delete-confirm" data-confirm-button disabled>${parsed.secondStep ? "Eliminar servicio y pendientes" : "Eliminar servicio"}</button></div>
    </div>`;
    const style = document.createElement("style");
    style.textContent = `
      #mikrohub-service-delete-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);font-family:Inter,system-ui,sans-serif}
      #mikrohub-service-delete-modal .mk-service-delete-card{width:min(540px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#111827;color:#e5e7eb;border:1px solid rgba(190,76,91,.58);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.62),0 0 0 4px rgba(127,29,29,.1)}
      .mk-service-delete-head{display:flex;align-items:center;gap:12px;padding:17px 20px;border-bottom:1px solid rgba(148,163,184,.14)}
      .mk-service-delete-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(159,50,65,.16);border:1px solid rgba(210,94,108,.36);color:#f3a0aa;font-size:20px;font-weight:800}
      .mk-service-delete-title{font-size:16px;font-weight:750;color:#f8fafc}.mk-service-delete-sub{font-size:12px;color:#94a3b8;margin-top:3px}.mk-service-delete-x{margin-left:auto;border:0;background:transparent;color:#94a3b8;font-size:23px;cursor:pointer}
      .mk-service-delete-body{padding:18px 20px}.mk-service-delete-alert{display:flex;flex-direction:column;gap:4px;padding:12px 13px;border:1px solid rgba(190,76,91,.36);border-radius:11px;background:linear-gradient(135deg,rgba(127,29,29,.2),rgba(69,10,10,.1));color:#f3c1c6;font-size:12px}.mk-service-delete-alert strong{color:#f0a0aa}
      .mk-service-delete-grid{display:grid;grid-template-columns:1fr auto;gap:8px 16px;margin-top:14px;padding:12px 13px;border:1px solid rgba(148,163,184,.14);border-radius:11px;background:rgba(15,23,42,.66);font-size:13px}.mk-service-delete-grid span{color:#94a3b8}.mk-service-delete-grid strong{color:#f8fafc;text-align:right}.mk-service-delete-grid span:nth-last-child(1){max-width:270px}
      .mk-service-delete-observations{margin-top:15px;font-size:12px;color:#cbd5e1;line-height:1.45}.mk-service-delete-observations>div{font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:6px}.mk-service-delete-observations p{margin:4px 0}
      .mk-service-delete-confirm-note{margin-top:15px;padding:10px 12px;border-radius:10px;border:1px solid rgba(190,110,70,.28);background:rgba(124,45,18,.08);color:#eab49a;font-size:12px}
      .mk-service-delete-input{box-sizing:border-box;width:100%;height:42px;margin-top:12px;border:1px solid rgba(190,76,91,.34);border-radius:9px;background:#0b1120;color:#f8fafc;padding:0 12px;outline:none}.mk-service-delete-input:focus{border-color:#f0a0aa;box-shadow:0 0 0 3px rgba(190,76,91,.12)}
      .mk-service-delete-foot{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px 18px;border-top:1px solid rgba(148,163,184,.14)}.mk-service-delete-cancel,.mk-service-delete-confirm{height:38px;padding:0 16px;border-radius:9px;font-weight:700;cursor:pointer}.mk-service-delete-cancel{border:1px solid rgba(148,163,184,.25);background:#1e293b;color:#cbd5e1}.mk-service-delete-confirm{border:1px solid rgba(190,76,91,.42);background:linear-gradient(135deg,#a33a4b,#752536);color:#fff}.mk-service-delete-confirm:disabled{opacity:.45;cursor:not-allowed}
      @media (max-width:640px){#mikrohub-service-delete-modal{padding:10px}.mk-service-delete-head,.mk-service-delete-body,.mk-service-delete-foot{padding-left:14px;padding-right:14px}.mk-service-delete-grid{grid-template-columns:1fr}.mk-service-delete-grid strong{text-align:left}.mk-service-delete-foot{flex-direction:column}.mk-service-delete-cancel,.mk-service-delete-confirm{width:100%}}
    `;
    document.head.appendChild(style); document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-confirm]");
    const button = overlay.querySelector("[data-confirm-button]");
    const finish = (ok) => { overlay.remove(); style.remove(); resolve(ok); };
    const update = () => { button.disabled = input.value.trim().toUpperCase() !== "SI"; };
    input.addEventListener("input", update);
    input.addEventListener("keydown", (event) => { if (event.key === "Escape") finish(false); if (event.key === "Enter" && input.value.trim().toUpperCase() === "SI") finish(true); });
    button.addEventListener("click", () => finish(true));
    overlay.querySelector("[data-cancel]").addEventListener("click", () => finish(false));
    overlay.querySelector("[data-close]").addEventListener("click", () => finish(false));
    overlay.addEventListener("click", (event) => { if (event.target === overlay) finish(false); });
    setTimeout(() => input.focus(), 0);
  });
}

function installServiceDeleteGuard() {
  if (typeof window === "undefined" || window.__mikrohubServiceDeleteGuardInstalled) return;
  window.__mikrohubServiceDeleteGuardInstalled = true;
  const originalConfirm = window.confirm.bind(window);
  let lastDeleteButton = null;
  let bypassConfirms = 0;

  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.('button[title="Eliminar"]');
    if (button) lastDeleteButton = button;
  }, true);

  window.confirm = (message) => {
    const text = String(message || "");
    const isServiceDelete = /ADVERTENCIA:\s*ELIMINACIÓN DE SERVICIO|SEGUNDA ADVERTENCIA/i.test(text);
    if (!isServiceDelete) return originalConfirm(text);
    if (bypassConfirms > 0) {
      bypassConfirms -= 1;
      return true;
    }
    const secondStep = /SEGUNDA ADVERTENCIA/i.test(text);
    showServiceDeleteModal(text).then((confirmed) => {
      if (!confirmed) return;
      if (!lastDeleteButton || !document.body.contains(lastDeleteButton)) return;
      bypassConfirms = secondStep ? 2 : 1;
      lastDeleteButton.click();
    });
    return false;
  };
}

installServiceDeleteGuard();

// Este módulo solo presenta las ventanas. Clients.jsx conserva la lógica y las consultas API.
