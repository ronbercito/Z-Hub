# Backup integral previo a Z-Hub 1.2.39

Fecha: 2026-09-10

Antes de corregir el fallo de actualización `craco: Permission denied`, se preservó íntegramente el estado de Z-Hub 1.2.38.

## Rama de respaldo

`backup/pre-update-fix-1.2.38-20260910`

## Commit exacto respaldado

`113df7bf6cf100d4eea8c0b8c5ba11b37d451196`

## Motivo

La versión 1.2.38 podía aplicar permisos `0644` dentro de `frontend/node_modules`, eliminando el bit ejecutable de binarios como `node_modules/.bin/craco`. Una actualización posterior podía fallar durante `yarn build` con `craco: Permission denied`.

## Recuperación

Si la corrección 1.2.39 presentara un problema crítico, la rama indicada conserva el árbol completo anterior a cualquier cambio de este hotfix.
