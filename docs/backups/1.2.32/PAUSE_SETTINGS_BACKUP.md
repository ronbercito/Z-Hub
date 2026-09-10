# Backup Z-Hub 1.2.32 — Pausas de servicio

Respaldo previo a implementar preferencias funcionales en `Ajustes → Configuración clientes → Pausas de servicio`.

## Blobs 1.2.32
- `backend/app/models/setting.py` → `3f3f5f034b2dd9a9b5601e774c02b152e4f886b6`
- `backend/app/routers/clientes/pause.py` → `48a1d695ec7e21d3c1c9e38ccd25d7c361335bd8`
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` → `f3027ed222d2823face5da2b227f8bdd626af545`
- `frontend/src/modules/clientes/Clients.jsx` → `47031ca951008c83e779bc9c707fa5b602dfe3b7`
- `frontend/src/modules/system-update/version.js` → `8869b2594e95ba4c469a25cda51f2f56263f0b25`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → `e9a754678db391f02b011fba37bbce5bee056aeb`

## Rollback
Restaurar los blobs indicados para volver al comportamiento 1.2.32. No se requiere borrar tablas ni datos; las nuevas preferencias se guardan únicamente dentro del JSON de `settings`.