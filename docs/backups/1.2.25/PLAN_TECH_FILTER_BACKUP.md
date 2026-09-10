# Backup previo al filtro de planes por tecnología — base 1.2.25

Archivos que se modificarán para 1.2.26 y sus blobs exactos recuperables desde Git:

- `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx` — blob `27b607d5ec13e5f365f02124eac4d1c87c84fc3a`
- `frontend/src/modules/system-update/version.js` — blob `5debb5d9ca590f5ae1a9e5c659b59558ded81042`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — blob `c96ed2e8742968fa6bac9c11662591dadf8c4844`
- `docs/CONTINUIDAD_Z-HUB.md` — blob `0694280a8ae3e366b16e26271156540e5d6fc22e`

El cambio previsto es únicamente filtrar los planes visibles en el asistente oficial según la tecnología seleccionada (Fibra óptica o Inalámbrico), limpiar un plan incompatible al cambiar de tecnología y validar que no pueda guardarse un plan de otra tecnología.

Este manifiesto permite restaurar exactamente el estado previo desde el historial Git si la actualización falla.