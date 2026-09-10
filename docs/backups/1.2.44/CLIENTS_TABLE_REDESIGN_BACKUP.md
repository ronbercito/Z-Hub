# Backup previo — tabla principal de Clientes 1.2.45

- Fecha: 2026-09-10
- Versión origen: Z-Hub 1.2.44
- Rama de respaldo: `backup/pre-clients-table-redesign-1.2.44-20260910`
- HEAD respaldado: `eaad19a611149f76fdc8afd3c31a02d8589f8fb9`

## Alcance
El respaldo conserva íntegramente el estado anterior al rediseño visual de la tabla principal de Clientes.

Archivos modificados en 1.2.45:
- `frontend/src/modules/clientes/Clients.jsx`
- `frontend/src/modules/clientes/clients-theme.css`
- `backend/tests/test_maintenance_contracts.py`
- `frontend/src/modules/system-update/version.js`

## Rollback
Para volver exactamente al estado anterior de 1.2.44, usar la rama de respaldo indicada arriba. No es necesario borrar ni modificar MariaDB.
