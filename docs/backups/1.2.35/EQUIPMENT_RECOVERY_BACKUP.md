# Backup Z-Hub 1.2.35 — Recuperación de equipos

Creado antes de implementar el módulo operativo de recuperación de equipos.

## Archivos previos / referencias
- `backend/app/models/__init__.py` — blob `16e28612c139f98eb22fe4958a81e4cf1b5b94ea`.
- `backend/server.py` — blob `fed2b8fd32ad2e352c7f0416d8555e272bf55735`.
- `backend/app/models/client.py` — blob `ecb241bc5e53d76d7bcb6677b70ff13d868122ee` (no se modifica en esta entrega salvo necesidad sobrevenida).
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` — blob `e12409c234a2378650b4f303a757c07c0798a233`.
- `frontend/src/modules/clientes/Clients.jsx` — blob `a5da80ebd12f2bbeac6f350ff5be2296ebaa9dd4`.
- `frontend/src/modules/clientes/usuarios/SuspensionRecoveryAlerts.jsx` — blob `dd1dbfc328af8ebd14b8854df53c0c530df0098c`.
- `frontend/src/modules/system-update/version.js` — blob `ac797a52c4da14e3e567016069a40f27c4847dad`.
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — blob `4779e0355ad4ccd784f3d041e471567b8d28f374`.
- `frontend/src/components/layout/Sidebar.jsx`, `frontend/src/components/layout/Layout.jsx` y `frontend/src/modules/ajustes/staff/permissions.js` se respaldan por historial Git de este commit previo.

## Archivos nuevos previstos
Antes de 1.2.36 no existen:
- `backend/app/models/equipment_recovery.py`
- `backend/app/routers/clientes/equipment_recoveries.py`
- `frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx`

Para rollback completo deben eliminarse esos archivos nuevos y restaurarse los archivos modificados al estado 1.2.35.

## Regla de seguridad
La primera versión de Recuperación de equipos no modificará existencias de Almacén automáticamente: aún no existe una asociación inequívoca entre una ONU/CPE recuperada y un registro concreto de inventario.