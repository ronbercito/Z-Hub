# Z-Hub 1.2.49 — Corrección de validación de Etapa 3/4

## Motivo
La primera publicación 1.2.48 de la Etapa 3 no superó GitHub Actions. Python compiló, pero una regresión estática antigua esperaba marcadores de la interfaz previa; además Yarn intentó resolver una versión no disponible de una dependencia transitiva y recibió HTTP 404.

## Correcciones
- Se mantiene intacta la funcionalidad de Recuperación implementada en Etapa 3.
- Se actualiza el contrato de casos cerrados para validar la interfaz actual: `CLOSED`, `Ver detalle` y bloqueo de edición de casos cerrados.
- Se fijan `memfs` y `@jsonjoy.com/fs-snapshot` en `4.71.0` para impedir la resolución transitiva inválida que hizo fallar la instalación de dependencias.
- Se republica como `1.2.49` para garantizar que el Centro de Actualizaciones entregue un release distinto del 1.2.48 fallido.

## Backup
Antes de estas correcciones se creó `backup/pre-ci-fix-1.2.48-20260910`, apuntando a `d30d8c1d935678b14e5041e4d83daab407f42f66`.

## Seguridad y compatibilidad
No se eliminan ni migran destructivamente clientes, facturas, servicios, equipos o casos de recuperación. Almacén continúa fuera de esta etapa y no recibe movimientos automáticos.

## Validación
La publicación queda pendiente de GitHub Actions. Solo se considerará lista para instalar cuando finalicen correctamente las regresiones Python y el build React.
