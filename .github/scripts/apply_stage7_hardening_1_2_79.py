from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')

# Harden visual exposure of identifiers while preserving copy actions.
js_path = 'license_server/static/app.js'
js = read(js_path)

anchor = "async function copyText(v,label='Dato'){try{await navigator.clipboard.writeText(String(v));toast(`${label} copiado`)}catch(e){toast('No se pudo copiar',true)}}"
mask_helpers = anchor + "\nfunction maskLicense(v){const s=String(v||'');if(!s)return '-';const tail=s.slice(-4);return `ZHUB-••••-••••-${esc(tail)}`}\nfunction maskInstallation(v){const s=String(v||'');if(!s)return '-';if(s.length<=12)return '••••••••';return `${esc(s.slice(0,8))}-••••-••••-••••-${esc(s.slice(-6))}`}"
if 'function maskLicense(' not in js:
    if anchor not in js:
        raise SystemExit('copyText anchor not found')
    js = js.replace(anchor, mask_helpers, 1)

js = js.replace("<td>${esc(v.license_key)}</td><td>${esc(v.installation_id)}</td>", "<td>${maskLicense(v.license_key)}</td><td>${maskInstallation(v.installation_id)}</td>")
js = js.replace("<td><strong>${esc(l.license_key)}</strong><br><button class=\"link-btn\"", "<td><strong>${maskLicense(l.license_key)}</strong><br><button class=\"link-btn\"")
js = js.replace("<td><strong>${esc(i.installation_id)}</strong><br>${esc(i.installation_name||'')}<br><button", "<td><strong>${maskInstallation(i.installation_id)}</strong><br>${esc(i.installation_name||'')}<br><button")
js = js.replace("</td><td>${esc(i.license_key)}</td><td>${esc(i.company_name||'-')}</td>", "</td><td>${maskLicense(i.license_key)}</td><td>${esc(i.company_name||'-')}</td>")

write(js_path, js)

# Add regression contract for masking while preserving copy operations.
test_path = 'backend/tests/test_license_center_web_contract.py'
test = read(test_path)
block = '''\n\ndef test_stage7_hardening_masks_sensitive_identifiers_but_keeps_copy_actions():\n    js = read("license_server/static/app.js")\n    assert "function maskLicense(" in js\n    assert "function maskInstallation(" in js\n    assert "maskLicense(v.license_key)" in js\n    assert "maskInstallation(v.installation_id)" in js\n    assert "maskLicense(l.license_key)" in js\n    assert "maskInstallation(i.installation_id)" in js\n    assert "copyText('${esc(l.license_key)}','Licencia')" in js\n    assert "copyText('${esc(i.installation_id)}','Installation ID')" in js\n'''
if 'test_stage7_hardening_masks_sensitive_identifiers' not in test:
    test += block
write(test_path, test)

# Bump panel release.
version = '''/** Z-Hub panel version — changelog contains only the current release. */\nexport const PANEL_VERSION = "1.2.79";\nexport const CHANGELOG = [\n  { type: "Licencias", text: "Cierre endurecido de Etapa 7/7: claves e Installation ID se muestran enmascarados por defecto en el License Center." },\n  { type: "Seguridad", text: "Las acciones Copiar conservan el valor real para administradores autenticados sin exponerlo visualmente en tablas o capturas." },\n  { type: "Pruebas", text: "Se agregan contratos de regresión para enmascarado, filtros y acciones comerciales; backend y frontend deben pasar CI antes del merge." },\n  { type: "Documentación", text: "Se consolida la continuidad únicamente en docs/CONTINUIDAD_Z-HUB.md y se retira el archivo histórico duplicado 1.2.71." },\n  { type: "Backup", text: "Se creó backup/pre-stage7-hardening-1.2.79-20260911 antes del cierre final de Etapa 7/7." },\n];\n'''
write('frontend/src/modules/system-update/version.js', version)

# Append final stage 7 validation note to master continuity.
cont_path = 'docs/CONTINUIDAD_Z-HUB.md'
cont = read(cont_path)
entry = '''\n\n## 2026-09-11 — Z-Hub 1.2.79 — cierre endurecido y pruebas finales Etapa 7/7\n\n- Estado: **Etapa 7/7 cerrada** después de validar en laboratorio el License Center 1.3.0 y el flujo remoto de Z-Hub.\n- Seguridad visual: `license_key` e `installation_id` quedan enmascarados por defecto en Resumen, Licencias, Instalaciones y Validaciones.\n- Operación: los botones **Copiar clave** y **Copiar ID** conservan el valor real únicamente dentro de la sesión administrativa autenticada.\n- Se mantienen clientes/ISP, PAID/TRIAL, planes, capacidad, vencimiento, renovación TRIAL, suspensión, revocación, instalaciones autorizadas, filtros y auditoría de validaciones.\n- La autoridad sigue en el License Server: plan, capacidad, estado, vencimiento e instalación; JWT RS256 y período de gracia no cambian.\n- Se retira `docs/CONTINUIDAD_Z-HUB-1.2.71.md`; la única bitácora maestra vigente es `docs/CONTINUIDAD_Z-HUB.md`.\n- Backup previo: `backup/pre-stage7-hardening-1.2.79-20260911`.\n- Validación requerida para cierre: contrato License Center, sintaxis JS/Python, CI backend y build frontend en verde; despliegue final de 1.2.79 en `z2` y actualización del License Server desde `main`.\n'''
if 'Z-Hub 1.2.79 — cierre endurecido' not in cont:
    cont += entry
write(cont_path, cont)

# Remove stale duplicate continuity file if present.
dup = Path('docs/CONTINUIDAD_Z-HUB-1.2.71.md')
if dup.exists():
    dup.unlink()
