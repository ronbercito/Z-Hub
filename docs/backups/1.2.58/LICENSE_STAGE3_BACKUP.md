# Backup previo — Sistema de licencias Etapa 3/7

Fecha: 2026-09-10

Antes de aplicar el límite efectivo de abonados se protege el estado estable publicado de Z-Hub 1.2.58.

- Rama de respaldo: `backup/pre-license-stage3-1.2.58-20260910`
- Commit protegido: `c5b6ebba9a2e21b563691577fc00847459186ebd`
- Alcance: estado completo de `main` antes de conectar `can_create_client()` al alta real de abonados.
- La Etapa 3 no debe modificar ni eliminar abonados existentes; solo impedir nuevas altas al alcanzar el límite.
