# Backup Z-Hub 1.2.34 — orden de rutas de Clientes

Creado antes de corregir la colisión entre rutas dinámicas `/api/clients/{client_id}` y rutas estáticas agregadas por Configuración clientes.

## Archivos previos
- `backend/server.py` — blob `85f1364fd55d567d5833d569d8bd6704eac76d54`
- `frontend/src/modules/system-update/version.js` — blob `4bc3649053006c7e1531ce7d1879c8aa24c1bf01`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` — estado 1.2.34 previo a esta corrección.

## Diagnóstico
En `backend/server.py`, `clientes_router` estaba registrado antes de `pause_clients_router` y `retired_clients_router`. Como `clientes_router` contiene `GET /clients/{client_id}`, FastAPI podía resolver primero `/api/clients/pause-policy` o `/api/clients/retirement-policy` como si `pause-policy` / `retirement-policy` fueran IDs de cliente.

El frontend de Clientes carga datos con `Promise.all`; si una de esas políticas devuelve 404, se descarta el bloque completo de resultados y la tabla puede mostrar `Clientes (0)` aunque los clientes sigan en la base de datos y en MikroTik.

## Rollback
Restaurar los blobs anteriores de `backend/server.py` y `version.js`, y retirar la entrada documental de la versión correctiva correspondiente.