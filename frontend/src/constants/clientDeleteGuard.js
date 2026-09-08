/* MikroHub: confirmacion de eliminacion de clientes con estilo propio, sin dialogs nativos del navegador. */
import axios from "axios";

const DELETE_CLIENT_RE = /\/clients\/([^/?#]+)\/?$/;

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function asArray(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function showDeleteModal({ clientName, servicesCount, pendingCount, pendingTotal, priority = false }) {
  return new Promise((resolve) => {
    const old = document.getElementById("mikrohub-critical-delete-modal");
    if (old) old.remove();
    const overlay = document.createElement("div");
    overlay.id = "mikrohub-critical-delete-modal";
    const title = priority ? "Advertencia prioritaria" : "Confirmar eliminación";
    const subtitle = priority ? "Eliminación definitiva del cliente" : "Confirma esta operación antes de continuar";
    const intro = priority
      ? "Esta acción eliminará definitivamente la información asociada al cliente."
      : "Se eliminará definitivamente el cliente y la información asociada.";
    const observations = priority
      ? `<div>Observaciones</div><p>• Se eliminarán todos los servicios del cliente.</p><p>• Se eliminarán las facturas y registros asociados.</p><p>• Los datos eliminados no podrán recuperarse desde el panel.</p>`
      : `<div>Antes de continuar</div><p>• Revisa que el cliente sea el correcto.</p><p>• Esta operación es definitiva y no podrá deshacerse desde el panel.</p>`;
    overlay.innerHTML = `
      <div class="mk-delete-card ${priority ? "is-priority" : ""}" role="dialog" aria-modal="true" aria-labelledby="mk-delete-title">
        <div class="mk-delete-head">
          <div class="mk-delete-icon">${priority ? "⚠" : "?"}</div>
          <div><div id="mk-delete-title" class="mk-delete-title">${title}</div><div class="mk-delete-sub">${subtitle}</div></div>
          <button class="mk-delete-x" data-close aria-label="Cerrar">×</button>
        </div>
        <div class="mk-delete-body">
          <div class="mk-delete-alert"><strong>${priority ? "ATENCIÓN PRIORITARIA" : "CONFIRMACIÓN"}</strong><span>${intro}</span></div>
          <div class="mk-delete-grid">
            <span>Cliente</span><strong>${escapeHtml(clientName)}</strong>
            <span>Servicios registrados</span><strong>${servicesCount}</strong>
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
      #mikrohub-critical-delete-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,6,23,.74);backdrop-filter:blur(6px);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #mikrohub-critical-delete-modal .mk-delete-card{width:min(520px,100%);max-height:calc(100vh - 40px);overflow:auto;background:#111827;color:#e5e7eb;border:1px solid rgba(148,163,184,.20);border-radius:16px;box-shadow:0 25px 70px rgba(0,0,0,.58)}
      #mikrohub-critical-delete-modal .mk-delete-card.is-priority{border-color:rgba(190,76,91,.55);box-shadow:0 25px 70px rgba(0,0,0,.58),0 0 0 4px rgba(127,29,29,.10)}
      .mk-delete-head{display:flex;align-items:center;gap:12px;padding:17px 20px;border-bottom:1px solid rgba(148,163,184,.14)}
      .mk-delete-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(14,165,233,.12);border:1px solid rgba(56,189,248,.25);color:#7dd3fc;font-size:20px;font-weight:800}.is-priority .mk-delete-icon{background:rgba(159,50,65,.16);border-color:rgba(210,94,108,.34);color:#f3a0aa}.mk-delete-title{font-size:16px;font-weight:750;color:#f8fafc}.mk-delete-sub{font-size:12px;color:#94a3b8;margin-top:3px}.mk-delete-x{margin-left:auto;border:0;background:transparent;color:#94a3b8;font-size:23px;cursor:pointer;padding:2px 6px}.mk-delete-x:hover{color:#f3a0aa}
      .mk-delete-body{padding:18px 20px}.mk-delete-alert{display:flex;flex-direction:column;gap:3px;padding:12px 13px;border:1px solid rgba(148,163,184,.18);border-radius:11px;background:rgba(15,23,42,.72);color:#cbd5e1;font-size:12px}.mk-delete-alert strong{font-size:12px;letter-spacing:.04em;color:#7dd3fc}.is-priority .mk-delete-alert{border-color:rgba(190,76,91,.34);background:linear-gradient(135deg,rgba(127,29,29,.20),rgba(69,10,10,.10));color:#f3c1c6}.is-priority .mk-delete-alert strong{color:#f0a0aa}.mk-delete-grid{display:grid;grid-template-columns:1fr auto;gap:8px 16px;margin-top:14px;padding:12px 13px;border:1px solid rgba(148,163,184,.14);border-radius:11px;background:rgba(15,23,42,.66);font-size:13px}.mk-delete-grid span{color:#94a3b8}.mk-delete-grid strong{color:#f8fafc}.is-priority .mk-delete-grid strong:nth-of-type(n+3){color:#ef9aa4}.mk-delete-observations{margin-top:15px;font-size:12px;color:#cbd5e1;line-height:1.45}.mk-delete-observations>div{font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:6px}.mk-delete-observations p{margin:4px 0}.mk-delete-confirm-note{margin-top:15px;padding:10px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.55);color:#cbd5e1;font-size:12px;line-height:1.45}.is-priority .mk-delete-confirm-note{border-color:rgba(190,110,70,.28);background:rgba(124,45,18,.08);color:#eab49a}.mk-delete-input{box-sizing:border-box;width:100%;height:42px;margin-top:12px;border:1px solid rgba(148,163,184,.25);border-radius:9px;background:#0b1120;color:#f8fafc;padding:0 12px;outline:none;font-size:13px}.mk-delete-input:focus{border-color:#7dd3fc;box-shadow:0 0 0 3px rgba(56,189,248,.10)}.is-priority .mk-delete-input{border-color:rgba(190,76,91,.30)}.is-priority .mk-delete-input:focus{border-color:#d27682;box-shadow:0 0 0 3px rgba(190,76,91,.10)}.mk-delete-foot{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px 18px;border-top:1px solid rgba(148,163,184,.14)}.mk-delete-cancel,.mk-delete-confirm{height:38px;padding:0 16px;border-radius:9px;font-weight:700;cursor:pointer}.mk-delete-cancel{border:1px solid rgba(148,163,184,.25);background:#1e293b;color:#cbd5e1}.mk-delete-confirm{border:1px solid rgba(190,76,91,.42);background:linear-gradient(135deg,#a33a4b,#752536);color:#fff}.mk-delete-confirm:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.25)}
    `;
    document.head.appendChild(style); document.body.appendChild(overlay);
    const input=overlay.querySelector("[data-confirm]"), button=overlay.querySelector("[data-confirm-button]");
    const finish=(ok)=>{overlay.remove();style.remove();resolve(ok)};
    const update=()=>{const ok=input.value.trim().toUpperCase()==="SI";button.disabled=!ok};
    input.addEventListener("input",update); input.addEventListener("keydown",e=>{if(e.key==="Escape")finish(false);if(e.key==="Enter"&&input.value.trim().toUpperCase()==="SI")finish(true)});
    button.addEventListener("click",()=>finish(true)); overlay.querySelector("[data-cancel]").addEventListener("click",()=>finish(false)); overlay.querySelector("[data-close]").addEventListener("click",()=>finish(false)); overlay.addEventListener("click",e=>{if(e.target===overlay)finish(false)}); setTimeout(()=>input.focus(),0);
  });
}

function installClientDeleteGuard(){
  if(typeof window==="undefined"||window.__mikrohubClientDeleteGuard)return; window.__mikrohubClientDeleteGuard=true;
  const originalRequest=axios.request.bind(axios);
  axios.interceptors.request.use(async config=>{
    if((config.method||"").toLowerCase()!=="delete"||config.__mikrohubDeleteConfirmed)return config;
    const match=String(config.url||"").match(DELETE_CLIENT_RE); if(!match)return config;
    const clientId=match[1];
    try{
      const configuredBase=config.baseURL||"", originalUrl=String(config.url||""), isAbsolute=/^https?:\/\//i.test(originalUrl);
      const apiRoot=isAbsolute||originalUrl.startsWith("/")?originalUrl.replace(DELETE_CLIENT_RE,""):configuredBase.replace(/\/$/,"");
      const headers=config.headers||{}; const makeUrl=s=>`${apiRoot}/clients/${clientId}${s}`;
      const [clientRes,servicesRes,invoicesRes]=await Promise.all([originalRequest({method:"get",url:makeUrl(""),headers}),originalRequest({method:"get",url:makeUrl("/services"),headers}),originalRequest({method:"get",url:makeUrl("/invoices"),headers})]);
      const clientName=clientRes.data?.full_name||clientRes.data?.name||clientId;
      const services=asArray(servicesRes.data,["services","items","data"]);
      const invoices=asArray(invoicesRes.data,["invoices","items","data"]);
      const pending=invoices.filter(i=>["unpaid","overdue","pending"].includes(String(i.status||"").toLowerCase()));
      const pendingTotal=pending.reduce((sum,i)=>sum+Math.max(0,Number(i.amount||0)-Number(i.paid_amount||0)),0);
      const priority=services.length>1&&pending.length>0;
      if(!await showDeleteModal({clientName,servicesCount:services.length,pendingCount:pending.length,pendingTotal,priority})){const e=new Error("Eliminación cancelada por el operador.");e.__mikrohubDeleteCancelled=true;throw e}
    }catch(error){if(error.__mikrohubDeleteCancelled)throw error;console.error("MikroHub: no se pudo verificar servicios/facturación antes de eliminar",error);const e=new Error("No se pudo verificar la información del cliente. Eliminación cancelada por seguridad.");e.__mikrohubDeleteCancelled=true;throw e}
    config.__mikrohubDeleteConfirmed=true; return config;
  });
}
installClientDeleteGuard();
