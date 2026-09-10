# Backup previo a 1.2.25

Estado base: Z-Hub 1.2.24. Estos blobs son el contenido exacto anterior y pueden restaurarse desde Git si falla la actualización.

- `frontend/src/modules/clientes/Clients.jsx` — `1a1d4a7bb60f677bd425b43901513dcf5e2eb27d`
- `backend/app/models/client.py` — `9f6bba0e99e6b891a574c427145f4e083d6e40c6`
- `backend/server.py` — `1baabbb2f66c4c4e2879721c1404437130513dc0`
- `backend/app/routers/clientes/installations.py` — `1924a76968aecc799e78d26673699b68109a0bc4`
- `frontend/src/modules/system-update/version.js` — `5ea72bdb8a31c8f48b76b6ba1f9001804c9ab23f`

`backend/app/routers/clientes/retired.py` no existía en 1.2.24 y debe eliminarse en un rollback completo.

No se modificó `ClientRegistrationWizard.jsx`; el flujo de reactivación reutiliza el asistente existente.