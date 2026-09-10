# Backup Z-Hub 1.2.29 — Configuración clientes

Creado antes del cambio visual/organizativo de Configuración clientes.

Archivos existentes y blobs de `main`:
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` — `89638785a9423da7b373cf384cd1593a267ecab3`
- `frontend/src/modules/system-update/version.js` — `6d4c3471e88a38ad82d318eb07aa56518ddda74d`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — `ad2a4d1fcd7049b15c81a672391d9f04607973a0`

Archivo nuevo de esta entrega que debe eliminarse en un rollback completo:
- `frontend/src/modules/ajustes/clientes/client-settings-theme.css`

Alcance previsto: reemplazar `Avisos del cliente` por `Recuperación de equipos`, compactar las tarjetas y darles estilo específico para el tema `zhub-light`, sin modificar backend, facturación ni lógica de suspensión prolongada.
