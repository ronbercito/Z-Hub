/*
 * MikroHub — confirmaciones críticas de eliminación.
 * Actualización 2026-09-08 — versión 1.1.8: el modal de servicio conserva los campos
 * del aviso nativo y muestra cantidad/total reales de facturación pendiente.
 * Clientes: modal visual reutilizable desde Clients.jsx.
 * Servicios: intercepta los window.confirm() de ClientServiceEditor y conserva el contexto
 * del primer aviso para reutilizarlo en la segunda confirmación.
 */

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

function installCriticalStyle() {
  if (document.getElementById("mikrohub-critical-delete-style")) return;
  const style = document.createElement("style");
  style.id = "mikrohub-critical-delete-style";
  style.textContent = `
#mikrohub-critical-delete-modal,#mikrohub-service-delete-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,6,23,.78);backdrop-filter:blur(6px);font-family:Inter,system-ui,sans-serif}
.mk-delete-card,.mk-service-delete-card{width:min(520px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#111827;color:#e5e7eb;border:1px solid rgba(190,76,91,.55);border-radius:16px;box-shadow:0 25px 70px rgba(0,0,0,.58),0 0 0 4px rgba(127,29,29,.1)}
.mk-delete-head,.mk-service-delete-head{display:flex;align-items:center;gap:12px;padding:17px 20px;border-bottom:1px solid rgba(148,163,184,.14)}
.mk-delete-icon,.mk-service-delete-icon{width:38px;height:38px;flex:0 0 38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(159,50,65,.16);border:1px solid rgba(210,94,108,.34);color:#f3a0aa;font-size:20px;font-weight:800}
.mk-delete-title,.mk-service-delete-title{font-size:16px;font-weight:750;color:#f8fafc}.mk-delete-sub,.mk-service-delete-sub{font-size:12px;color:#94a3b8;margin-top:3px}.mk-delete-x,.mk-service-delete-x{margin-left:auto;border:0;background:transparent;color:#94a3b8;font-size:23px;cursor:pointer}
.mk-delete-body,.mk-service-delete-body{padding:18px 20px}.mk-delete-alert,.mk-service-delete-alert{display:flex;flex-direction:column;gap:3px;padding:12px 13px;border:1px solid rgba(190,76,91,.34);border-radius:11px;background:linear-gradient(135deg,rgba(127,29,29,.2),rgba(69,10,10,.1));color:#f3c1c6;font-size:12px}.mk-delete-alert strong,.mk-service-delete-alert strong{color:#f0a0aa}
.mk-delete-grid,.mk-service-delete-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 16px;margin-top:14px;padding:12px 13px;border:1px solid rgba(148,163,184,.14);border-radius:11px;background:rgba(15,23,42,.66);font-size:13px}.mk-delete-grid span,.mk-service-delete-grid span{color:#94a3b8}.mk-delete-grid strong,.mk-service-delete-grid strong{color:#f8fafc;text-align:right;overflow-wrap:anywhere}
.mk-delete-services{grid-column:1/-1;padding:8px 10px;border-radius:8px;background:rgba(2,6,23,.35);border:1px solid rgba(148,163,184,.1)}.mk-delete-services ul{margin:0;padding-left:18px;color:#cbd5e1}.mk-delete-services li{margin:3px 0}
.mk-delete-observations,.mk-service-delete-observations{margin-top:15px;font-size:12px;color:#cbd5e1;line-height:1.45}.mk-delete-observations>div,.mk-service-delete-observations>div{font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:6px}.mk-delete-observations p,.mk-service-delete-observations p{margin:4px 0}
.mk-delete-confirm-note,.mk-service-delete-confirm-note{margin-top:15px;padding:10px 12px;border-radius:10px;border:1px solid rgba(190,110,70,.28);background:rgba(124,45,18,.08);color:#eab49a;font-size:12px}
.mk-delete-input,.mk-service-delete-input{box-sizing:border-box;width:100%;height:42px;margin-top:12px;border:1px solid rgba(190,76,91,.3);border-radius:9px;background:#0b1120;color:#f8fafc;padding:0 12px;outline:none}.mk-delete-input:focus,.mk-service-delete-input:focus{border-color:#f0a0aa;box-shadow:0 0 0 3px rgba(190,76,91,.1)}
.mk-delete-foot,.mk-service-delete-foot{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px 18px;border-top:1px solid rgba(148,163,184,.14)}
.mk-delete-cancel,.mk-delete-confirm,.mk-service-delete-cancel,.mk-service-delete-confirm{height:38px;padding:0 16px;border-radius:9px;font-weight:700;cursor:pointer}.mk-delete-cancel,.mk-service-delete-cancel{border:1px solid rgba(148,163,184,.25);background:#1e293b;color:#cbd5e1}.mk-delete-confirm,.mk-service-delete-confirm{border:1px solid rgba(190,76,91,.42);background:linear-gradient(135deg,#a33a4b,#752536);color:#fff}.mk-delete-confirm:disabled,.mk-service-delete-confirm:disabled{opacity:.45;cursor:not-allowed}
.mk-service-delete-detail-block{grid-column:1/-1;padding:8px 10px;border-radius:8px;background:rgba(2,6,23,.35);border:1px solid rgba(148,163,184,.1)}
`;
  document.head.appendChild(style);
}

export function showDeleteModal({ clientName, services = [], pendingCount = 0, pendingTotal = 0, priority = false }) {
  return new Promise((resolve) => {
    document.getElementById("mikrohub-critical-delete-modal")?.remove();
    installCriticalStyle();
    const overlay = document.createElement("div");
    overlay.id = "mikrohub-critical-delete-modal";
    const title = priority ? "Advertencia prioritaria" : "Confirmar eliminación";
    const intro = priority
      ? "Esta acción eliminará definitivamente la información asociada al cliente."
      : "Se eliminará definitivamente el cliente y la información asociada.";
    const observations = priority
      ? `<div>Observaciones</div><p>• Se eliminarán todos los servicios registrados del cliente.</p><p>• Se eliminarán las ${pendingCount} factura${pendingCount === 1 ? "" : "s"} pendientes y sus registros asociados.</p><p>• El saldo pendiente total es S/. ${Number(pendingTotal || 0).toFixed(2)}.</p><p>• Los datos eliminados no podrán recuperarse desde el panel.</p>`
      : `<div>Antes de continuar</div><p>• Revisa que el cliente sea el correcto.</p><p>• Esta operación es definitiva y no podrá deshacerse desde el panel.</p>`;
    const serviceItems = services.length ? services.map((service, index) => `<li>${escapeHtml(serviceLabel(service, index))}</li>`).join("") : "<li>Sin servicios registrados</li>";
    overlay.innerHTML = `<div class="mk-delete-card" role="dialog" aria-modal="true"><div class="mk-delete-head"><div class="mk-delete-icon">⚠</div><div><div class="mk-delete-title">${title}</div><div class="mk-delete-sub">${priority ? "Eliminación definitiva del cliente" : "Confirma esta operación antes de continuar"}</div></div><button class="mk-delete-x" data-close aria-label="Cerrar">×</button></div><div class="mk-delete-body"><div class="mk-delete-alert"><strong>${priority ? "ATENCIÓN PRIORITARIA" : "CONFIRMACIÓN"}</strong><span>${intro}</span></div><div class="mk-delete-grid"><span>Cliente</span><strong>${escapeHtml(clientName)}</strong><span>Servicios</span><strong>${services.length}</strong><div class="mk-delete-services"><ul>${serviceItems}</ul></div><span>Facturas pendientes</span><strong>${pendingCount}</strong><span>Saldo pendiente</span><strong>S/. ${Number(pendingTotal || 0).toFixed(2)}</strong></div><div class="mk-delete-observations">${observations}</div><div class="mk-delete-confirm-note">Para confirmar, escribe <b>SI</b>. Para cancelar, escribe <b>NO</b> o cierra esta ventana.</div><input class="mk-delete-input" data-confirm type="text" autocomplete="off" placeholder="Escribe SI para confirmar" /></div><div class="mk-delete-foot"><button class="mk-delete-cancel" data-cancel>Cancelar</button><button class="mk-delete-confirm" data-confirm-button disabled>Eliminar definitivamente</button></div></div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-confirm]"), button = overlay.querySelector("[data-confirm-button]");
    const finish = (ok) => { overlay.remove(); resolve(ok); };
    const update = () => { button.disabled = input.value.trim().toUpperCase() !== "SI"; };
    input.addEventListener("input", update); input.addEventListener("keydown", (event) => { if (event.key === "Escape") finish(false); if (event.key === "Enter" && input.value.trim().toUpperCase() === "SI") finish(true); });
    button.addEventListener("click", () => finish(true)); overlay.querySelector("[data-cancel]").addEventListener("click", () => finish(false)); overlay.querySelector("[data-close]").addEventListener("click", () => finish(false)); overlay.addEventListener("click", (event) => { if (event.target === overlay) finish(false); });
    setTimeout(() => input.focus(), 0);
  });
}

function parseServiceDeleteMessage(message) {
  const text = String(message || "");
  const secondStep = /SEGUNDA\s+ADVERTENCIA/i.test(text);
  if (secondStep) {
    const countMatch = text.match(/(\d+)\s+factura(?:\(s\))?\s+pendiente(?:\(s\))?/i);
    const totalMatch = text.match(/S\/.\s*([\d.,]+)/i);
    return { secondStep: true, count: countMatch ? Number(countMatch[1]) : null, total: totalMatch ? totalMatch[1] : null, message: text };
  }
  const serviceMatch = text.match(/Vas a eliminar\s+(.+?)\.\s*(?:\r?\n)+([\s\S]*?)(?:\r?\n)+\r?\nEsta acción/i);
  const details = serviceMatch?.[2]
    ? serviceMatch[2].split("|").map((part) => part.trim()).filter(Boolean).map((part) => { const [label, ...rest] = part.split(":"); return { label: label.trim(), value: rest.join(":").trim() || "—" }; })
    : [];
  return { secondStep: false, serviceName: serviceMatch?.[1]?.trim() || "Servicio adicional", details, message: text };
}

function renderServiceDetails(details) {
  if (!details?.length) return "";
  return details.map((item) => `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong>`).join("");
}

function showServiceDeleteModal(message, context = {}) {
  const parsed = parseServiceDeleteMessage(message);
  const serviceContext = context.first || {};
  const details = parsed.secondStep ? (serviceContext.details || []) : parsed.details;
  const serviceName = parsed.secondStep ? (serviceContext.serviceName || "Servicio adicional") : parsed.serviceName;
  return new Promise((resolve) => {
    document.getElementById("mikrohub-service-delete-modal")?.remove();
    installCriticalStyle();
    const overlay = document.createElement("div");
    overlay.id = "mikrohub-service-delete-modal";
    const title = parsed.secondStep ? "Confirmación de eliminación del servicio" : "Advertencia prioritaria";
    const subtitle = parsed.secondStep ? "El servicio tiene facturación pendiente asociada" : "Eliminación definitiva del servicio adicional";
    const intro = parsed.secondStep ? "Este servicio tiene facturación pendiente asociada. Revisa el impacto antes de continuar." : "Esta acción eliminará definitivamente el servicio seleccionado del cliente.";
    const pendingBlock = parsed.secondStep ? `<span>Facturas pendientes</span><strong>${parsed.count ?? "—"}</strong><span>Total pendiente</span><strong>S/. ${escapeHtml(parsed.total ?? "0.00")}</strong>` : "";
    const serviceBlock = `<span>Servicio</span><strong>${escapeHtml(serviceName)}</strong>${renderServiceDetails(details)}`;
    const observations = parsed.secondStep
      ? `<div>Observaciones</div><p>• Se eliminará el servicio y también las facturas pendientes indicadas.</p><p>• Las facturas pagadas o parcialmente pagadas no se eliminan mediante este flujo.</p><p>• La operación no puede deshacerse desde el panel.</p>`
      : `<div>Observaciones</div><p>• El servicio dejará de aparecer en la ficha del cliente.</p><p>• La eliminación es permanente.</p><p>• Si existen facturas pendientes, aparecerá una segunda confirmación antes de eliminarlas.</p>`;
    overlay.innerHTML = `<div class="mk-service-delete-card" role="dialog" aria-modal="true"><div class="mk-service-delete-head"><div class="mk-service-delete-icon">⚠</div><div><div class="mk-service-delete-title">${title}</div><div class="mk-service-delete-sub">${subtitle}</div></div><button class="mk-service-delete-x" data-close aria-label="Cerrar">×</button></div><div class="mk-service-delete-body"><div class="mk-service-delete-alert"><strong>ATENCIÓN PRIORITARIA</strong><span>${intro}</span></div><div class="mk-service-delete-grid">${serviceBlock}${pendingBlock}</div><div class="mk-service-delete-observations">${observations}</div><div class="mk-service-delete-confirm-note">Para confirmar, escribe <b>SI</b>. Para cancelar, escribe <b>NO</b> o cierra esta ventana.</div><input class="mk-service-delete-input" data-confirm type="text" autocomplete="off" placeholder="Escribe SI para confirmar" /></div><div class="mk-service-delete-foot"><button class="mk-service-delete-cancel" data-cancel>Cancelar</button><button class="mk-service-delete-confirm" data-confirm-button disabled>${parsed.secondStep ? "Eliminar servicio y pendientes" : "Eliminar servicio"}</button></div></div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector("[data-confirm]"), button = overlay.querySelector("[data-confirm-button]");
    const finish = (ok) => { overlay.remove(); resolve(ok); };
    const update = () => { button.disabled = input.value.trim().toUpperCase() !== "SI"; };
    input.addEventListener("input", update); input.addEventListener("keydown", (event) => { if (event.key === "Escape") finish(false); if (event.key === "Enter" && input.value.trim().toUpperCase() === "SI") finish(true); });
    button.addEventListener("click", () => finish(true)); overlay.querySelector("[data-cancel]").addEventListener("click", () => finish(false)); overlay.querySelector("[data-close]").addEventListener("click", () => finish(false)); overlay.addEventListener("click", (event) => { if (event.target === overlay) finish(false); });
    setTimeout(() => input.focus(), 0);
  });
}

function installServiceDeleteGuard() {
  if (typeof window === "undefined" || window.__mikrohubServiceDeleteGuardInstalled) return;
  window.__mikrohubServiceDeleteGuardInstalled = true;
  const nativeConfirm = window.confirm.bind(window);
  let lastDeleteButton = null;
  let bypassConfirms = 0;
  let context = { first: null };

  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.('button[title="Eliminar"]');
    if (button) lastDeleteButton = button;
  }, true);

  window.confirm = function guardedConfirm(message) {
    const text = String(message || "");
    const isService = /ADVERTENCIA:\s*ELIMINACIÓN DE SERVICIO|SEGUNDA\s+ADVERTENCIA/i.test(text);
    if (!isService) return nativeConfirm(message);
    if (bypassConfirms > 0) { bypassConfirms -= 1; return true; }

    const parsed = parseServiceDeleteMessage(text);
    if (!parsed.secondStep) context = { first: parsed };

    Promise.resolve(showServiceDeleteModal(text, context)).then((confirmed) => {
      if (!confirmed) return;
      bypassConfirms = parsed.secondStep ? 2 : 1;
      if (lastDeleteButton?.isConnected) {
        lastDeleteButton.click();
      } else {
        nativeConfirm(message);
      }
    });
    return false;
  };
}

if (typeof window !== "undefined") installServiceDeleteGuard();
