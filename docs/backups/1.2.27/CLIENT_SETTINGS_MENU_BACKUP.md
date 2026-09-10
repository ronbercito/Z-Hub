# Backup previo a Z-Hub 1.2.28 — Configuración clientes

Fecha: 2026-09-09

Antes de crear el submenú `Ajustes → Configuración clientes`, se registran los blobs exactos de 1.2.27 para rollback:

- `frontend/src/modules/ajustes/navigation/settingsSections.js` → `b509084e23116e6c7870551d6e61df6244f91018`
- `frontend/src/modules/ajustes/Settings.jsx` → `6fd2a2dcd628498499a1fb15428490382562316c`
- `frontend/src/modules/system-update/version.js` → `cec1e1e357ab159a9f349820bb627610d1b099d2`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → `a36c53c2a761f182362c13edc737b68584d72612`

No se modifica `Layout.jsx`: ya resuelve genéricamente cualquier `settings_<id>` hacia `Settings`.
