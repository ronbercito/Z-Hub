# Continuidad complementaria — Z-Hub 1.1.10

Este documento complementa `docs/CONTINUIDAD_MIKROHUB.md`. La bitácora maestra sigue siendo la fuente obligatoria.

## Alcance
Identidad visible Z-Hub + selector de template Oscuro clásico / Z-Hub Blanco en Ajustes → General.

## Protección
- Backup previo: `backup-pre-zhub-theme-1.1.10`.
- Desarrollo: `update-zhub-theme-1.1.10`.
- Base preservada: 1.1.9 (`9c269d9d39add24e860ba9c2ed7e8e9ffa21274b`).
- Rutas internas/repo/claves heredadas no se renombran.
- `company_name` existente del ISP no se pisa.

## Persistencia
`panel_theme` se guarda en el JSON de `settings`, sin migración SQL. Valores admitidos: `dark`, `zhub-light`.

## Validación
Build React de producción y `py_compile` de los archivos Python modificados mediante GitHub Actions. Los archivos delicados de frontend se restauraron desde `main` y los cambios se reaplicaron mínimamente.

## Instalación
Publicar en `main` hace visible 1.1.10 para el Centro de Actualizaciones. La instalación en servidor solo se considera terminada después de usar Actualizaciones → Comprobar → Actualizar y validar ambos templates.

## Regla para el futuro
Cada cambio posterior debe actualizar primero `docs/CONTINUIDAD_MIKROHUB.md` antes de comunicarse como terminado.
