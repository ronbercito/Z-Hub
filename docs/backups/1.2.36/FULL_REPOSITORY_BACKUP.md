# Backup integral previo al saneamiento 1.2.37

Fecha: 2026-09-10
Repositorio: `ronbercito/Z-Hub`
Rama origen: `main`
Commit íntegro respaldado: `d086581b5f8e09fcb518ea702b51a2950306bcdc`
Rama de respaldo creada antes de cualquier cambio funcional: `backup/pre-maintenance-1.2.36-20260910`

## Alcance

Este respaldo representa **todo el repositorio versionado** exactamente como estaba en Z-Hub 1.2.36 antes del saneamiento. Git conserva el árbol completo (backend, frontend, deploy, docs, pruebas y archivos auxiliares) en el commit indicado y, adicionalmente, la rama de respaldo fija ese commit para recuperación directa.

## Restauración completa

Desde el servidor Z-Hub, si fuera necesario regresar íntegramente al estado anterior:

```bash
cd /var/www/z-hub
git fetch origin
git reset --hard d086581b5f8e09fcb518ea702b51a2950306bcdc
ZHUB_SKIP_GIT_SYNC=1 bash install.sh
```

También puede inspeccionarse/restaurarse desde la rama:

```bash
git fetch origin backup/pre-maintenance-1.2.36-20260910
git reset --hard origin/backup/pre-maintenance-1.2.36-20260910
ZHUB_SKIP_GIT_SYNC=1 bash install.sh
```

> Este backup cubre archivos versionados. Los datos reales de MariaDB y el `.env` del servidor no viven en Git y no son modificados por esta copia. Las correcciones de 1.2.37 están diseñadas para no borrar la base de datos.
