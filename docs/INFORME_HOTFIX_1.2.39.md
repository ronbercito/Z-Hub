# Informe de hotfix — Z-Hub 1.2.39

**Fecha:** 2026-09-10  
**Repositorio:** `ronbercito/Z-Hub`  
**Rama:** `main`  
**Versión anterior:** 1.2.38  
**Versión publicada:** 1.2.39

## Incidencia confirmada

Durante una actualización 1.2.37 → 1.2.38, `yarn build` falló con:

```text
/bin/sh: 1: craco: Permission denied
error Command failed with exit code 127.
```

La causa estaba en `deploy/install.sh`: después de un build exitoso normalizaba todos los archivos del árbol de la aplicación a modo `0644`. Esa operación alcanzaba `frontend/node_modules` y podía quitar el permiso de ejecución a binarios usados por Yarn/CRACO.

## Corrección aplicada

1. Antes de `yarn install` se reparan los ejecutables existentes bajo `frontend/node_modules/.bin`.
2. Después de `yarn install` se vuelve a asegurar el permiso ejecutable antes de `yarn build`.
3. La normalización general de permisos excluye explícitamente:
   - `.git`
   - `backend/venv`
   - `frontend/node_modules`
4. Los scripts `.sh` del código versionado mantienen modo ejecutable.
5. `backend/.env` sigue protegido con `0600` y propietario `root`.
6. El mecanismo de rollback de `run_update.sh` no se modifica.

## Compatibilidad con servidores ya afectados

La reparación se ejecuta **antes** del build, por lo que un servidor donde 1.2.38 ya dejó `craco` sin permiso puede recuperarlo durante la instalación de 1.2.39 sin requerir borrar manualmente `node_modules`.

## Backup previo

Se creó antes de modificar código:

`backup/pre-update-fix-1.2.38-20260910`

Commit exacto respaldado:

`113df7bf6cf100d4eea8c0b8c5ba11b37d451196`

También se documentó en `docs/backups/1.2.38/UPDATE_PERMISSION_FIX_BACKUP.md`.

## Regresión automática

Se amplió `backend/tests/test_maintenance_contracts.py` para verificar que:

- `frontend/node_modules` quede excluido del chmod general;
- `backend/venv` quede excluido del chmod general;
- exista la reparación de `node_modules/.bin` antes del build.

## Datos y operación

Este hotfix no modifica clientes, facturas, MariaDB, MikroTik, OLT, NAP, ONU, planes ni configuraciones de red. Es una corrección del instalador/actualizador.

## Prueba pendiente de producción

La validación definitiva requiere ejecutar una actualización real 1.2.38 → 1.2.39 en el servidor donde se reprodujo la incidencia y confirmar que el build llega a 100% sin `Permission denied`.
