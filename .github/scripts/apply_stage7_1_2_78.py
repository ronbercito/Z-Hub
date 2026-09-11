from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


def replace_once(path, old, new):
    text = read(path)
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Patrón no encontrado en {path}: {old[:100]!r}")
    write(path, text.replace(old, new, 1))


# -----------------------------------------------------------------------------
# License Server: cierre funcional Etapa 7
# -----------------------------------------------------------------------------
main_path = "license_server/app/main.py"
main = read(main_path)
main = main.replace('APP_VERSION = "1.2.1"', 'APP_VERSION = "1.3.0"', 1)

if "class TrialRenewIn(BaseModel):" not in main:
    marker = '''class InstallationIn(BaseModel):\n    installation_id: str = Field(min_length=8, max_length=160)\n    installation_name: str = ""\n    status: str = "ACTIVA"\n'''
    addition = marker + '''\n\nclass TrialRenewIn(BaseModel):\n    days: int = Field(default=TRIAL_DAYS, ge=1, le=365)\n'''
    if marker not in main:
        raise SystemExit("No se encontró InstallationIn")
    main = main.replace(marker, addition, 1)

old_dashboard = '''@app.get("/admin/dashboard", dependencies=[Depends(_admin)])\ndef admin_dashboard() -> dict[str, Any]:\n    since = (_now() - timedelta(hours=24)).isoformat()\n    with _connect() as db:\n        customers = db.execute("SELECT COUNT(*) AS n FROM customers").fetchone()["n"]\n        active_licenses = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA'").fetchone()["n"]\n        active_installations = db.execute("SELECT COUNT(*) AS n FROM installations WHERE status='ACTIVA'").fetchone()["n"]\n        validations_24h = db.execute("SELECT COUNT(*) AS n FROM validations WHERE created_at >= ?", (since,)).fetchone()["n"]\n    return {"customers": customers, "active_licenses": active_licenses, "active_installations": active_installations, "validations_24h": validations_24h}\n'''
new_dashboard = '''@app.get("/admin/dashboard", dependencies=[Depends(_admin)])\ndef admin_dashboard() -> dict[str, Any]:\n    since = (_now() - timedelta(hours=24)).isoformat()\n    next_7d = (_now() + timedelta(days=7)).isoformat()\n    now = _now().isoformat()\n    with _connect() as db:\n        customers = db.execute("SELECT COUNT(*) AS n FROM customers").fetchone()["n"]\n        active_licenses = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA'").fetchone()["n"]\n        active_installations = db.execute("SELECT COUNT(*) AS n FROM installations WHERE status='ACTIVA'").fetchone()["n"]\n        validations_24h = db.execute("SELECT COUNT(*) AS n FROM validations WHERE created_at >= ?", (since,)).fetchone()["n"]\n        paid_active = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='PAID'").fetchone()["n"]\n        trial_active = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='TRIAL' AND (expires_at IS NULL OR expires_at > ?)", (now,)).fetchone()["n"]\n        suspended_licenses = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status IN ('SUSPENDIDA','REVOCADA')").fetchone()["n"]\n        expiring_trials_7d = db.execute("SELECT COUNT(*) AS n FROM licenses WHERE status='ACTIVA' AND type='TRIAL' AND expires_at IS NOT NULL AND expires_at > ? AND expires_at <= ?", (now, next_7d)).fetchone()["n"]\n        rejected_validations_24h = db.execute("SELECT COUNT(*) AS n FROM validations WHERE created_at >= ? AND result <> 'AUTHORIZED'", (since,)).fetchone()["n"]\n    return {\n        "customers": customers,\n        "active_licenses": active_licenses,\n        "active_installations": active_installations,\n        "validations_24h": validations_24h,\n        "paid_active": paid_active,\n        "trial_active": trial_active,\n        "suspended_licenses": suspended_licenses,\n        "expiring_trials_7d": expiring_trials_7d,\n        "rejected_validations_24h": rejected_validations_24h,\n    }\n'''
if old_dashboard not in main:
    raise SystemExit("No se encontró admin_dashboard original")
main = main.replace(old_dashboard, new_dashboard, 1)

renew_endpoint = '''\n\n@app.post("/admin/licenses/{license_key}/renew-trial", dependencies=[Depends(_admin)])\ndef renew_trial(license_key: str, payload: TrialRenewIn) -> dict[str, Any]:\n    key = license_key.strip().upper()\n    with _connect() as db:\n        row = db.execute("SELECT type FROM licenses WHERE license_key=?", (key,)).fetchone()\n        if not row:\n            raise HTTPException(status_code=404, detail="Licencia no encontrada")\n        if str(row["type"]).upper() != "TRIAL":\n            raise HTTPException(status_code=409, detail="Solo las licencias TRIAL pueden renovar su período de prueba")\n        expires_at = (_now() + timedelta(days=payload.days)).isoformat()\n        db.execute(\n            "UPDATE licenses SET expires_at=?, status='ACTIVA', updated_at=? WHERE license_key=?",\n            (expires_at, _now().isoformat(), key),\n        )\n    return {"ok": True, "license_key": key, "expires_at": expires_at, "days": payload.days}\n'''
if 'renew-trial' not in main:
    anchor = '\n\n@app.delete("/admin/licenses/{license_key}", dependencies=[Depends(_admin)])\ndef delete_license'
    if anchor not in main:
        raise SystemExit("No se encontró ancla delete_license")
    main = main.replace(anchor, renew_endpoint + anchor, 1)

old_validations = '''        rows = db.execute(\n            "SELECT license_key, installation_id, result, created_at FROM validations ORDER BY id DESC LIMIT ?",\n            (size,),\n        ).fetchall()'''
new_validations = '''        rows = db.execute(\n            """SELECT v.license_key, v.installation_id, v.result, v.created_at, c.company_name\n               FROM validations v\n               LEFT JOIN licenses l ON l.license_key=v.license_key\n               LEFT JOIN customers c ON c.id=l.customer_id\n               ORDER BY v.id DESC LIMIT ?""",\n            (size,),\n        ).fetchall()'''
if old_validations not in main:
    raise SystemExit("No se encontró consulta validations")
main = main.replace(old_validations, new_validations, 1)
write(main_path, main)

# -----------------------------------------------------------------------------
# License Center HTML: filtros comerciales y ayudas
# -----------------------------------------------------------------------------
html_path = "license_server/static/index.html"
html = read(html_path)
html = html.replace('<p>Administración central de clientes, licencias e instalaciones.</p>', '<p>Administración central de clientes, licencias e instalaciones.</p><small class="secure-note">Use este centro únicamente mediante HTTPS.</small>', 1)
html = html.replace('<div id="customersTable"></div>', '<div class="filters"><input id="customerSearch" placeholder="Buscar empresa, contacto, correo o documento"><select id="customerStatus"><option value="">Todos los estados</option><option>ACTIVA</option><option>INACTIVA</option><option>SUSPENDIDA</option></select></div><div id="customersTable"></div>', 1)
html = html.replace('<div id="licensesTable"></div>', '<div class="filters"><input id="licenseSearch" placeholder="Buscar clave, cliente, titular o correo"><select id="licenseType"><option value="">Todos los tipos</option><option>PAID</option><option>TRIAL</option></select><select id="licenseStatus"><option value="">Todos los estados</option><option>ACTIVA</option><option>SUSPENDIDA</option><option>REVOCADA</option></select><select id="licensePlan"><option value="">Todos los planes</option><option>TRIAL</option><option>PLAN_100</option><option>PLAN_300</option><option>PLAN_500</option><option>PLAN_1000</option><option>ILIMITADO</option></select></div><div id="licensesTable"></div>', 1)
html = html.replace('<div id="installationsTable"></div>', '<div class="filters"><input id="installationSearch" placeholder="Buscar ID, nombre, licencia o cliente"><select id="installationStatus"><option value="">Todos los estados</option><option>ACTIVA</option><option>INACTIVA</option><option>SUSPENDIDA</option></select></div><div id="installationsTable"></div>', 1)
html = html.replace('<div id="validationsTable"></div>', '<div class="filters"><input id="validationSearch" placeholder="Buscar licencia, instalación, cliente o resultado"><select id="validationResult"><option value="">Todos los resultados</option><option>AUTHORIZED</option><option>LICENSE_NOT_FOUND</option><option>TRIAL_EXPIRED</option><option>LICENSE_BLOCKED</option><option>INSTALLATION_NOT_AUTHORIZED</option></select></div><div id="validationsTable"></div>', 1)
write(html_path, html)

# -----------------------------------------------------------------------------
# License Center JS: filtros, métricas y acciones comerciales explícitas
# -----------------------------------------------------------------------------
js_path = "license_server/static/app.js"
js = read(js_path)

js = js.replace("let TOKEN=sessionStorage.getItem('zhub_admin_token')||'';let DATA={customers:[],licenses:[],installations:[],validations:[],stats:{}};", "let TOKEN=sessionStorage.getItem('zhub_admin_token')||'';let DATA={customers:[],licenses:[],installations:[],validations:[],stats:{}};let FILTERS={customerSearch:'',customerStatus:'',licenseSearch:'',licenseType:'',licenseStatus:'',licensePlan:'',installationSearch:'',installationStatus:'',validationSearch:'',validationResult:''};", 1)

old_stats = re.search(r"function renderStats\(\)\{.*?\}\nfunction renderCustomers", js, re.S)
if not old_stats:
    raise SystemExit("No se encontró renderStats")
new_stats = '''function renderStats(){const s=DATA.stats;$('#stats').innerHTML=[['Clientes / ISP',s.customers],['Licencias activas',s.active_licenses],['PAID activas',s.paid_active],['TRIAL activas',s.trial_active],['Instalaciones activas',s.active_installations],['Validaciones 24 h',s.validations_24h],['Rechazos 24 h',s.rejected_validations_24h],['TRIAL vencen ≤7 días',s.expiring_trials_7d]].map(([a,b])=>`<div class="stat"><span>${a}</span><strong>${b??0}</strong></div>`).join('');const recent=DATA.validations.slice(0,8).map(v=>`<tr><td>${fmtDate(v.created_at)}</td><td>${esc(v.company_name||'-')}</td><td>${esc(v.license_key)}</td><td>${esc(v.installation_id)}</td><td>${badge(v.result==='AUTHORIZED'?'ACTIVA':v.result)}</td></tr>`);$('#recentValidations').innerHTML=table(['Fecha','Cliente','Licencia','Instalación','Resultado'],recent)}
function norm(v){return String(v??'').toLowerCase()}
function fmtDate(v){if(!v)return '-';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):d.toLocaleString('es-PE')}
function daysLeft(v){if(!v)return null;const n=Math.ceil((new Date(v).getTime()-Date.now())/86400000);return Number.isFinite(n)?n:null}
async function copyText(v,label='Dato'){try{await navigator.clipboard.writeText(String(v));toast(`${label} copiado`)}catch(e){toast('No se pudo copiar',true)}}
function renderCustomers'''
js = js[:old_stats.start()] + new_stats + js[old_stats.end():]

m = re.search(r"function renderCustomers\(\)\{.*?\}\nfunction renderLicenses", js, re.S)
if not m: raise SystemExit("No renderCustomers")
replacement = '''function renderCustomers(){const q=norm(FILTERS.customerSearch),st=FILTERS.customerStatus;const list=DATA.customers.filter(c=>(!q||[c.company_name,c.contact_name,c.email,c.phone,c.tax_id].some(x=>norm(x).includes(q)))&&(!st||c.status===st));const rows=list.map(c=>`<tr><td><strong>${esc(c.company_name)}</strong><br><span>${esc(c.contact_name||'')}</span></td><td>${esc(c.email||'-')}<br>${esc(c.phone||'')}</td><td>${esc(c.tax_id||'-')}</td><td>${badge(c.status)}</td><td>${c.license_count||0}</td><td><div class="actions"><button class="mini" onclick='openCustomerModal(${JSON.stringify(c)})'>Editar</button><button class="mini danger" onclick="deleteCustomer(${c.id})">Eliminar</button></div></td></tr>`);$('#customersTable').innerHTML=table(['Empresa / contacto','Contacto','RUC/DNI','Estado','Licencias','Acciones'],rows)}
function renderLicenses'''
js = js[:m.start()] + replacement + js[m.end():]

m = re.search(r"function renderLicenses\(\)\{.*?\}\nfunction renderInstallations", js, re.S)
if not m: raise SystemExit("No renderLicenses")
replacement = '''function renderLicenses(){const q=norm(FILTERS.licenseSearch),ty=FILTERS.licenseType,st=FILTERS.licenseStatus,pl=FILTERS.licensePlan;const list=DATA.licenses.filter(l=>(!q||[l.license_key,l.company_name,l.name,l.email].some(x=>norm(x).includes(q)))&&(!ty||l.type===ty)&&(!st||l.status===st)&&(!pl||l.plan===pl));const rows=list.map(l=>{const left=l.type==='TRIAL'?daysLeft(l.expires_at):null;const expiry=l.type==='TRIAL'?`${fmtDate(l.expires_at)}${left!=null?`<br><span class="${left<=7?'warn-text':'muted-text'}">${left<0?'Vencida':left+' día(s) restantes'}</span>`:''}`:'—';return `<tr><td><strong>${esc(l.license_key)}</strong><br><button class="link-btn" onclick="copyText('${esc(l.license_key)}','Licencia')">Copiar clave</button></td><td>${esc(l.company_name||l.name||'-')}</td><td>${esc(l.type)}</td><td>${esc(l.plan)}</td><td>${l.max_clients==null?'Ilimitada':esc(l.max_clients)}</td><td>${expiry}</td><td>${badge(l.status)}</td><td>${l.installation_count||0}</td><td><div class="actions"><button class="mini" onclick='openLicenseModal(${JSON.stringify(l)})'>Editar</button>${l.type==='TRIAL'?`<button class="mini" onclick="renewTrial('${esc(l.license_key)}')">Renovar Trial</button>`:''}<button class="mini" onclick="quickLicenseStatus('${esc(l.license_key)}','${l.status==='ACTIVA'?'SUSPENDIDA':'ACTIVA'}')">${l.status==='ACTIVA'?'Suspender':'Activar'}</button>${l.status!=='REVOCADA'?`<button class="mini danger" onclick="quickLicenseStatus('${esc(l.license_key)}','REVOCADA')">Revocar</button>`:''}<button class="mini danger" onclick="deleteLicense('${esc(l.license_key)}')">Eliminar</button></div></td></tr>`});$('#licensesTable').innerHTML=table(['Licencia','Cliente','Tipo','Plan','Capacidad','Vence','Estado','Instalaciones','Acciones'],rows)}
function renderInstallations'''
js = js[:m.start()] + replacement + js[m.end():]

m = re.search(r"function renderInstallations\(\)\{.*?\}\nfunction renderValidations", js, re.S)
if not m: raise SystemExit("No renderInstallations")
replacement = '''function renderInstallations(){const q=norm(FILTERS.installationSearch),st=FILTERS.installationStatus;const list=DATA.installations.filter(i=>(!q||[i.installation_id,i.installation_name,i.license_key,i.company_name].some(x=>norm(x).includes(q)))&&(!st||i.status===st));const rows=list.map(i=>`<tr><td><strong>${esc(i.installation_id)}</strong><br>${esc(i.installation_name||'')}<br><button class="link-btn" onclick="copyText('${esc(i.installation_id)}','Installation ID')">Copiar ID</button></td><td>${esc(i.license_key)}</td><td>${esc(i.company_name||'-')}</td><td>${badge(i.status)}</td><td>${fmtDate(i.updated_at)}</td><td><div class="actions"><button class="mini" onclick='openInstallationModal(${JSON.stringify(i)})'>Editar</button><button class="mini" onclick="quickInstallationStatus('${esc(i.license_key)}','${esc(i.installation_id)}','${i.status==='ACTIVA'?'SUSPENDIDA':'ACTIVA'}')">${i.status==='ACTIVA'?'Suspender':'Activar'}</button><button class="mini danger" onclick="deleteInstallation('${esc(i.license_key)}','${esc(i.installation_id)}')">Eliminar</button></div></td></tr>`);$('#installationsTable').innerHTML=table(['Instalación','Licencia','Cliente','Estado','Actualizada','Acciones'],rows)}
function renderValidations'''
js = js[:m.start()] + replacement + js[m.end():]

m = re.search(r"function renderValidations\(\)\{.*?\}\nfunction showView", js, re.S)
if not m: raise SystemExit("No renderValidations")
replacement = '''function renderValidations(){const q=norm(FILTERS.validationSearch),rs=FILTERS.validationResult;const list=DATA.validations.filter(v=>(!q||[v.license_key,v.installation_id,v.company_name,v.result].some(x=>norm(x).includes(q)))&&(!rs||v.result===rs));const rows=list.map(v=>`<tr><td>${fmtDate(v.created_at)}</td><td>${esc(v.company_name||'-')}</td><td>${esc(v.license_key)}</td><td>${esc(v.installation_id)}</td><td>${badge(v.result==='AUTHORIZED'?'ACTIVA':v.result)}</td></tr>`);$('#validationsTable').innerHTML=table(['Fecha','Cliente','Licencia','Instalación','Resultado'],rows)}
function showView'''
js = js[:m.start()] + replacement + js[m.end():]

if "async function renewTrial(" not in js:
    anchor = "async function deleteLicense(key){"
    pos = js.find(anchor)
    if pos < 0: raise SystemExit("No deleteLicense anchor")
    renew = '''async function renewTrial(key){const raw=prompt('Días para renovar el Trial:','30');if(raw===null)return;const days=Number(raw);if(!Number.isInteger(days)||days<1||days>365){toast('Ingrese entre 1 y 365 días',true);return}if(!confirm(`¿Renovar ${key} por ${days} días desde ahora?`))return;try{await api(`/admin/licenses/${encodeURIComponent(key)}/renew-trial`,{method:'POST',body:JSON.stringify({days})});toast('Trial renovado');refreshAll()}catch(e){toast(e.message,true)}}\n'''
    js = js[:pos] + renew + js[pos:]

# Conectar filtros al final sin interferir con navegación existente.
if "function bindCommercialFilters()" not in js:
    js += '''\nfunction bindCommercialFilters(){[['customerSearch','input'],['customerStatus','change'],['licenseSearch','input'],['licenseType','change'],['licenseStatus','change'],['licensePlan','change'],['installationSearch','input'],['installationStatus','change'],['validationSearch','input'],['validationResult','change']].forEach(([id,ev])=>{const el=$('#'+id);if(!el)return;el.addEventListener(ev,()=>{FILTERS[id]=el.value;renderAll()})})}\nwindow.addEventListener('DOMContentLoaded',bindCommercialFilters);\n'''
write(js_path, js)

# -----------------------------------------------------------------------------
# CSS de filtros/estado comercial
# -----------------------------------------------------------------------------
css_path = "license_server/static/styles.css"
css = read(css_path)
extra_css = '''\n.filters{display:grid;grid-template-columns:minmax(220px,2fr) repeat(3,minmax(140px,1fr));gap:10px;padding:14px 18px;background:#fbfdff;border-bottom:1px solid #edf3f8}.filters select,.filters input{margin:0}.secure-note{display:block;color:var(--muted);margin-top:8px}.link-btn{border:0;background:transparent;color:var(--blue2);padding:4px 0;cursor:pointer;font-size:11px;font-weight:700}.muted-text{color:var(--muted);font-size:11px}.warn-text{color:#a56b00;font-size:11px;font-weight:800}.stats{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:1100px){.filters{grid-template-columns:1fr 1fr}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.filters{grid-template-columns:1fr}}\n'''
if ".filters{" not in css:
    css += extra_css
write(css_path, css)

# -----------------------------------------------------------------------------
# README: declarar Etapa 7/7 completa
# -----------------------------------------------------------------------------
readme_path = "license_server/README.md"
readme = read(readme_path)
readme = readme.replace("# Z-Hub License Server — Etapa 6/7 + License Center web", "# Z-Hub License Server — Etapa 7/7 + License Center comercial", 1)
readme = readme.replace("Desde la versión Z-Hub 1.2.67 el License Server incorpora una interfaz web inicial en:", "Desde Z-Hub 1.2.78 el License Center queda consolidado como interfaz comercial de la Etapa 7/7 en:", 1)
old_list = '''- dashboard con clientes/ISP, licencias activas, instalaciones activas y validaciones de 24 h;\n- crear, editar y eliminar clientes/ISP;\n- crear, editar, activar, suspender y eliminar licencias;\n- asignar una licencia a un cliente/ISP;\n- definir plan y `max_clients`;\n- autorizar, editar, suspender, reactivar y eliminar instalaciones;\n- revisar historial de validaciones.'''
new_list = '''- dashboard comercial con clientes/ISP, PAID/TRIAL activas, instalaciones, validaciones, rechazos y Trials próximos a vencer;\n- crear, editar, buscar, filtrar y eliminar clientes/ISP;\n- crear, editar, activar, suspender, revocar y eliminar licencias;\n- generar claves de 192 bits, copiar claves y asignarlas a un cliente/ISP;\n- convertir TRIAL/PAID desde edición, definir plan y `max_clients` central;\n- renovar explícitamente un TRIAL entre 1 y 365 días desde la GUI;\n- autorizar, buscar, editar, suspender, reactivar y eliminar instalaciones;\n- buscar/filtrar el historial de validaciones con cliente, licencia, instalación y resultado.'''
if old_list in readme:
    readme = readme.replace(old_list, new_list, 1)
if "POST /admin/licenses/{license_key}/renew-trial" not in readme:
    readme = readme.replace("- `PUT|DELETE /admin/licenses/{license_key}`", "- `PUT|DELETE /admin/licenses/{license_key}`\n- `POST /admin/licenses/{license_key}/renew-trial`", 1)
write(readme_path, readme)

# -----------------------------------------------------------------------------
# Contratos de regresión
# -----------------------------------------------------------------------------
test_path = "backend/tests/test_license_center_web_contract.py"
test = read(test_path)
test = test.replace('assert \'APP_VERSION = "1.2.1"\' in main', 'assert \'APP_VERSION = "1.3.0"\' in main', 1)
if "def test_stage7_commercial_center_is_complete():" not in test:
    test += '''\n\ndef test_stage7_commercial_center_is_complete():\n    main = read("license_server/app/main.py")\n    html = read("license_server/static/index.html")\n    js = read("license_server/static/app.js")\n    css = read("license_server/static/styles.css")\n    assert 'APP_VERSION = "1.3.0"' in main\n    assert '@app.post("/admin/licenses/{license_key}/renew-trial"' in main\n    assert 'paid_active' in main and 'trial_active' in main\n    assert 'expiring_trials_7d' in main and 'rejected_validations_24h' in main\n    assert 'company_name' in main and 'FROM validations v' in main\n    assert 'customerSearch' in html and 'licenseSearch' in html\n    assert 'installationSearch' in html and 'validationSearch' in html\n    assert 'renewTrial' in js and 'copyText' in js\n    assert 'licenseType' in js and 'licenseStatus' in js and 'licensePlan' in js\n    assert '.filters{' in css\n'''
write(test_path, test)

# -----------------------------------------------------------------------------
# Versión del panel 1.2.78
# -----------------------------------------------------------------------------
version_path = "frontend/src/modules/system-update/version.js"
write(version_path, '''/** Z-Hub panel version — changelog contains only the current release. */\nexport const PANEL_VERSION = "1.2.78";\nexport const CHANGELOG = [\n  { type: "Licencias", text: "Etapa 7/7 completada: License Center consolida la gestión comercial de clientes/ISP, licencias, planes, instalaciones y validaciones." },\n  { type: "Comercial", text: "Se agregan métricas PAID/TRIAL, Trials próximos a vencer, rechazos de validación, renovación de Trial y acciones explícitas de suspensión/revocación." },\n  { type: "Interfaz", text: "Clientes, licencias, instalaciones y validaciones incorporan búsqueda y filtros; claves e Installation ID pueden copiarse desde la tabla." },\n  { type: "Servidor", text: "License Server sube a 1.3.0 y mantiene autoridad sobre plan, capacidad, estado, vencimiento e instalación autorizada." },\n  { type: "Backup", text: "Se creó backup/pre-license-stage7-1.2.78-20260911 antes del cierre de Etapa 7." },\n];\n''')

# -----------------------------------------------------------------------------
# Bitácora maestra
# -----------------------------------------------------------------------------
continuity_path = "docs/CONTINUIDAD_Z-HUB.md"
continuity = read(continuity_path)
heading = "### 1.2.78 — 2026-09-11 — Etapa 7/7 cerrada: License Center comercial"
if heading not in continuity:
    continuity = continuity.rstrip() + '''\n\n---\n\n### 1.2.78 — 2026-09-11 — Etapa 7/7 cerrada: License Center comercial\n- **Punto de partida:** Etapa 6 quedó validada de extremo a extremo en `z2` con 1.2.77: Supervisor y el proceso real conservaron `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE`, y el panel permaneció en `TRIAL ACTIVO` / `Servidor remoto` después de actualizar.\n- **Objetivo Etapa 7/7:** completar la administración comercial desde `/admin-ui` sin depender de SQLite manual ni llamadas directas a `/admin/*` para la operación normal.\n- **Dashboard comercial:** el License Server expone y la GUI muestra clientes, licencias activas, PAID activas, TRIAL activas, instalaciones activas, validaciones 24 h, rechazos 24 h y Trials que vencen en los próximos 7 días.\n- **Licencias:** se mantienen alta/edición/plan/capacidad/estado; la GUI agrega búsqueda/filtros, copia de clave, suspensión/reactivación, revocación explícita y renovación de TRIAL por 1–365 días. La renovación vuelve el TRIAL a `ACTIVA` y calcula un nuevo `expires_at` desde el servidor central.\n- **Clientes / ISP:** CRUD existente más búsqueda por empresa, contacto, correo, teléfono o documento y filtro de estado.\n- **Instalaciones:** autorización/edición/suspensión/reactivación/eliminación existentes más búsqueda, filtro y copia de `installation_id`.\n- **Validaciones:** el historial ahora adjunta `company_name` cuando existe y permite búsqueda/filtro por licencia, instalación, cliente o resultado.\n- **Seguridad:** `/admin/*` sigue protegido por `ZHUB_LICENSE_ADMIN_TOKEN`; el token permanece únicamente en `sessionStorage`; la GUI recuerda usar HTTPS; no se exponen ni copian claves privadas.\n- **License Server:** `APP_VERSION` pasa de `1.2.1` a `1.3.0` para identificar el cierre de Etapa 7. El contrato `/v1/licenses/validate` y JWT RS256 de Etapa 6 se mantienen.\n- **Archivos:** `license_server/app/main.py`, `license_server/static/index.html`, `license_server/static/app.js`, `license_server/static/styles.css`, `license_server/README.md`, `backend/tests/test_license_center_web_contract.py`, `frontend/src/modules/system-update/version.js`.\n- **Backup previo:** `backup/pre-license-stage7-1.2.78-20260911`.\n- **Validación requerida después del merge:** desplegar el nuevo `license_server/` en `web-licencia`, reiniciar `zhub-license-server`, confirmar `/health` versión `1.3.0`, entrar a `/admin-ui`, comprobar filtros/métricas/renovación y verificar desde `z2` que la licencia remota continúa validando.\n- **Estado de etapas:** **7/7 completadas en código**. Después de la validación operativa del VPS, el sistema de licenciamiento queda cerrado y pasa a mantenimiento/hardening incremental, no a una nueva etapa numerada.\n''' + "\n"
    write(continuity_path, continuity)
