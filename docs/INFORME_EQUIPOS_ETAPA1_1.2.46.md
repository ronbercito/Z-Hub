# Z-Hub 1.2.46 — Equipos, Etapa 1/4

## Objetivo
Agregar la base segura y opcional del control de equipos de clientes sin quitar ni reemplazar funciones existentes.

## Implementado
- Nuevo ajuste `client_equipment_recovery_enabled`, desactivado por defecto.
- `Ajustes → Clientes → Equipos` permite activar/desactivar el módulo.
- Si está desactivado, `Clientes → Recuperación` se oculta y la API de equipos no permite operar.
- Nueva tabla `client_equipment` para equipos físicos asignados a un abonado.
- Nueva API `/api/client-equipment` para listar, asignar, editar y quitar equipos de la ficha.
- La ficha del cliente incorpora la pestaña `Equipos` únicamente cuando la función está activa.
- Datos por equipo: tipo, marca/modelo, serial/MAC, propiedad, fecha de entrega, estado y observaciones.
- La etapa no modifica Almacén, no crea movimientos de inventario, no retira clientes y no crea casos automáticos de recuperación.

## Compatibilidad
La opción queda en `false` por defecto. Una instalación que actualice y no la active conserva la navegación y operación anterior. La tabla nueva se crea mediante el mecanismo normal de `init_db()` sin borrar datos existentes.

## Backup
- Rama: `backup/pre-equipment-stage1-1.2.45-20260910`
- HEAD: `15892ebffa0460845964590ffa5eca18a0cbc23d`

## Pendiente dentro del flujo general
El alta guiada de un cliente todavía usa el formulario técnico existente; la asignación de equipos de esta etapa se realiza desde la pestaña Equipos de la ficha una vez creado el abonado. La integración directa del bloque Equipos dentro del asistente de alta debe completarse antes de considerar cerrada funcionalmente la Etapa 1/4.

## Pruebas
GitHub Actions debe validar compilación Python, regresiones y build React del HEAD publicado. La prueba visual/operativa real queda pendiente en el servidor del usuario.
