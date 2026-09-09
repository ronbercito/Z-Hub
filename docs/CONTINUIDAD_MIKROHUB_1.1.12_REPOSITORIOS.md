# Z-Hub 1.1.12 — Migración de repositorio y actualizador dual

Fecha: 2026-09-09

## Repositorio principal
`ronbercito/Z-Hub`

## Repositorio legado / fallback
`ronbercito/mirkohub`

## Regla
Desde 1.1.12 todo desarrollo nuevo se realiza en Z-Hub. MikroHub se conserva temporalmente como fuente secundaria para que paneles instalados anteriormente puedan migrar sin reinstalación.

## Actualizador
El backend consulta ambos `main`, lee `PANEL_VERSION`, elige la versión mayor y, en empate, prioriza Z-Hub. La instalación cambia `origin` a la fuente seleccionada y conserva rollback al commit anterior.

## Seguridad
Backup previo: `backup-pre-dual-repo-1.1.12`.

No se modifican base de datos, clientes, facturación, red, OLT, autenticación, permisos ni templates.

## Validación
La entrega valida sintaxis Python, sintaxis Bash y build React antes de promocionarse a `main`.
