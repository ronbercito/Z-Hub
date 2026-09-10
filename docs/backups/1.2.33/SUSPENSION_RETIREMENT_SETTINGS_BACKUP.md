# Backup Z-Hub 1.2.33 — Suspensiones, retiros y reactivaciones

Respaldo previo a convertir `Ajustes → Configuración clientes → Suspensiones, retiros y reactivaciones` en una sección funcional más completa.

## Blobs 1.2.33
- `backend/app/models/setting.py` → `fac3ac205d4f60588f01add543bb2224d69f2c28`
- `backend/app/models/client.py` → `ec097cfa6bb5a61aea2d56b271a5ea6ff643cdfa`
- `backend/app/routers/clientes/retired.py` → `b2139ba81ced615743c358956b4325fca9e680c8`
- `backend/app/routers/clientes/router.py` → `387c1c9b9905a22a04a3cd326b455dba5ff402e7`
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` → `4ecc123d2b93d30e580e0a5d1f1a0f992bfab320`
- `frontend/src/modules/clientes/Clients.jsx` → `7eed61de7fcba357a5b229f359b3422c84ff9d6c`
- `frontend/src/modules/system-update/version.js` → `42c61cb5012c79b47a0c31db7c7a13f4deef0b34`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → `b9ccf8fdbb332a1e82da9f000b3046ceefcdea09`

## Rollback
Restaurar los blobs indicados para volver al comportamiento 1.2.33. Si la nueva versión llega a crear una columna adicional en `clients`, restaurar el código es suficiente para dejar de usarla; no borrar la base de datos ni datos reales.