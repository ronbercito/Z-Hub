# Backup previo a Z-Hub 1.2.40

Fecha: 2026-09-10

Antes de corregir el filtro de planes por tecnología se creó la rama integral:

`backup/pre-plan-tech-filter-1.2.39-20260910`

La rama apunta al HEAD previo `0d93f37057a62712a0f8a25c680c14748c92cebb` y conserva íntegramente Z-Hub 1.2.39 antes de esta modificación.

Motivo del cambio: en `Clientes > ficha > Servicios de Internet > Nuevo servicio`, el selector de plan mostraba todos los planes sin respetar la tecnología Fibra óptica/Inalámbrico.
