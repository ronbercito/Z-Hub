# Z-Hub 1.2.57 — Corrección visual de Gestión personal

## Objetivo
Corregir los colores de los controles de permisos dentro de Ajustes → Gestión personal, especialmente en tema claro, donde los botones inactivos heredaban fondo oscuro y texto con poco contraste.

## Cambios
- Los permisos inactivos en tema claro usan superficie clara, borde azul suave y texto legible.
- Los permisos activos usan fondo cyan suave, borde/acento cyan y check visible.
- Hover diferenciado en permisos activos e inactivos.
- Tema oscuro conserva una paleta azul noche uniforme con mejor contraste.
- La corrección también armoniza el control Cuenta activa dentro de esta sección.
- No se modifica la lógica de permisos ni los datos guardados.

## Backup
- Rama: `backup/pre-staff-theme-1.2.56-20260910`
- HEAD protegido: `a35232d1e2ae20c39c2ca331565a1108f2397f42`
- Registro adicional: `docs/backups/1.2.56/STAFF_THEME_BACKUP.md`

## Archivos
- `frontend/src/modules/ajustes/settings-modal.css`
- `frontend/src/modules/system-update/version.js`
- `backend/tests/test_settings_modal_contract.py`

## Compatibilidad
Sin cambios en API, MariaDB, roles, permisos, clientes, MikroTik, OLT, inventario ni recuperación.

## Validación
Se añadió contrato estático para comprobar los estilos de permisos activos/inactivos en el modal. GitHub Actions debe confirmar regresiones y build React sobre el HEAD final.

## Prueba pendiente en producción
Actualizar a 1.2.57 y comprobar Gestión personal en tema claro y oscuro, incluyendo permisos activos, inactivos y hover.
