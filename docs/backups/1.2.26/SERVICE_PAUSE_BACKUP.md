# Backup previo a Z-Hub 1.2.27

Estado base: **Z-Hub 1.2.26**.

Blobs exactos antes de implementar Servicio en pausa:

- `frontend/src/modules/clientes/Clients.jsx` — `82b9c8e5080dbd892e270c4945c3cbd9d93cc8aa`
- `backend/app/models/client.py` — `a7cd5b1904bcbdf703dafda41d6ee8da5327033f`
- `backend/server.py` — `997f635cec82683d026888e4ad82f454acd0f598`
- `backend/app/routers/facturacion/router.py` — `5d797c4335d346fd725f2f216ced91f953e006ae`
- `frontend/src/modules/system-update/version.js` — `0efb71386d4bb3ddb802a7e6d54ab729fcbc0e64`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — `649619a48c168454c7cf9d474d34169e7d0dec87`

El nuevo archivo `backend/app/routers/clientes/pause.py` no existía en 1.2.26 y debe eliminarse para un rollback completo.

Este documento permite restaurar el estado previo desde Git si la actualización falla.