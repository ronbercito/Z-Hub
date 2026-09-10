# Backup previo a 1.2.25

Estado base: Z-Hub 1.2.24.

Archivos que serán modificados y sus blobs exactos recuperables desde Git:

- `frontend/src/modules/clientes/Clients.jsx` — blob `bb9828d088dfe31e87a988be57073a59cbb9a88d`
- `backend/app/models/client.py` — blob `9f6bba0e99e6b891a574c427145f4e083d6e40c6`
- `backend/server.py` — blob `1baabbb2f66c4c4e2879721c1404437130513dc0`
- `frontend/src/modules/clientes/instalaciones/Installations.jsx` — estado 1.2.24 en main antes de este cambio.
- `backend/app/routers/clientes/installations.py` — blob `1924a76968aecc799e78d26673699b68109a0bc4`
- `frontend/src/modules/system-update/version.js` — blob `5ea72bdb8a31c8f48b76b6ba1f9001804c9ab23f`

El nuevo archivo `backend/app/routers/clientes/retired.py` no existía en 1.2.24 y puede eliminarse para rollback.

Este documento permite restaurar exactamente los blobs previos desde el historial Git si la actualización falla.