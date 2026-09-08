# Continuidad MikroHub — 2026-09-08 — detalle de eliminación definitiva

## Versión
- PANEL_VERSION: **1.0.74**
- Corrección funcional publicada en `frontend/src/constants/clientDeleteGuard.js`.

## Solicitud
La ventana de eliminación debía identificar claramente al abonado y mostrar qué información se perderá: nombre real del cliente, servicios que tiene, cantidad de facturas pendientes y monto total pendiente de pago.

## Problema observado
La ventana mostraba el ID/UUID interno en el campo Cliente y solo el número de servicios, sin detallar cuáles eran. Esto dificultaba verificar que el operador estaba eliminando al abonado correcto.

## Implementación
- Se muestra el **nombre real del cliente**.
- Si el endpoint individual no entrega el nombre, se consulta el listado de clientes para resolverlo por ID antes de usar el ID como último recurso.
- Se mantiene la cantidad total de servicios.
- Se lista cada servicio registrado, indicando servicio principal/adicional y plan o nombre disponible.
- Se muestra la cantidad de facturas pendientes.
- Se muestra el saldo total pendiente calculado como monto de factura menos pagos registrados.
- Se mantiene la advertencia prioritaria cuando existen más de un servicio y al menos una factura pendiente.
- Se conserva la confirmación escrita `SI`.
- Si falla la verificación, la eliminación continúa bloqueada por seguridad.
- No se usa el diálogo nativo del navegador.

## Archivo afectado
- `frontend/src/constants/clientDeleteGuard.js`

## Publicación
- Corrección: `227f8eec65c346ebc8338b67f6695c4e593cc636`
- Versión: `d4cec4b086ceb17718024dad639a338975404f16`

## Verificación recomendada
Probar con un cliente que tenga 2 servicios y facturas pendientes. La ventana debe mostrar el nombre del cliente, el detalle de ambos servicios, cantidad de facturas y saldo total. No debe mostrar el UUID como nombre ni `192.168.x.x dice`.

## Política aplicada
Se revisó primero el flujo existente y el origen de los datos. Se corrigió únicamente la presentación y resolución de información en el guardia de eliminación, sin modificar la operación destructiva del backend ni eliminar datos de forma distinta.
