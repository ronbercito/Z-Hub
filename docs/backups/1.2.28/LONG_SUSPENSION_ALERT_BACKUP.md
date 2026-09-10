# Backup Z-Hub 1.2.28 — alerta de suspensión prolongada

Respaldo previo a la implementación de 1.2.29. Los SHA corresponden a los blobs exactos en `main` antes del cambio.

- `backend/app/models/client.py` — `6023400af029d9ea4cfa3f4b4b5504c55790bfe4`
- `backend/app/models/setting.py` — `c1dc95a6988f135c50ca7f582acc26a2eb4664ef`
- `backend/app/routers/clientes/router.py` — `387c1c9b9905a22a04a3cd326b455dba5ff402e7`
- `backend/app/routers/red/router.py` — `98ce4f5d7b40e3e2fad662269a4fee41f337f99e`
- `backend/app/routers/facturacion/router.py` — `cb2f545bf00245621765dc8e587664cf450e9366`
- `backend/server.py` — `f0a4026cf84e1dd66353c9cbb78308200868c59c`
- `frontend/src/modules/clientes/usuarios/Users.jsx` — `ec6fdd703bd37bdab4d7c97b90ba5fe85d7949ab`
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` — `ca0bf808a3d07a3f035f8c65920ad79ba402fdeb`
- `frontend/src/modules/system-update/version.js` — `4d4c8ae5aeba24e12e93ff5e8ce04a7ab09cfc5a`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — `e34aac4de611d9e6fbab6555a9cca216087cc0f1`

Archivos nuevos de 1.2.29 que deberán eliminarse en un rollback completo:
- `backend/app/routers/clientes/suspension_alerts.py`
- `frontend/src/modules/clientes/usuarios/SuspensionRecoveryAlerts.jsx`
