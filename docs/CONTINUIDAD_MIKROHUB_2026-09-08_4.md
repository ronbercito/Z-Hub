# Continuidad MikroHub — 2026-09-08 — corrección 1.0.68

## 1. Problema detectado
Después de actualizar correctamente a 1.0.67 se verificó en producción que, al eliminar una factura pendiente desde `Clientes → ficha del cliente → Facturación`, la factura desaparecía de la lista pero el resumen de la ficha continuaba mostrando el contador y monto anterior.

Ejemplo observado: una factura de S/. 50.00 fue eliminada, pero el resumen seguía mostrando deuda/contador sin descontarla.

## 2. Análisis de causa
Se revisó primero el código modificado y la cadena completa de la funcionalidad, siguiendo la política prioritaria de errores y regresiones.

Archivo principal involucrado:
- `backend/app/routers/facturacion/invoice_actions.py`

Se comparó la operación de eliminación con la operación de anulación. La anulación ya recalculaba `unpaid_invoices_count` y `balance_due`, mientras que la eliminación definitiva solamente ejecutaba `db.delete(inv)` y `commit()`.

Por eso el registro de la factura se eliminaba correctamente, pero los campos resumen almacenados en `Client` podían quedar desactualizados.

También se detectó que editar el monto de una factura pendiente podía dejar el mismo problema si el resumen no se recalculaba.

## 3. Corrección realizada
Archivo funcional modificado:
- `backend/app/routers/facturacion/invoice_actions.py`

Se agregó `_refresh_client_balance()` para recalcular desde las facturas reales del cliente:
- `unpaid_invoices_count`
- `balance_due`

La función se ejecuta después de editar una factura y después de eliminarla. En la eliminación se hace `flush()` antes del recálculo para asegurar que la factura eliminada ya no participe en la consulta.

La anulación también utiliza la misma función para mantener una única lógica de cálculo.

Se mantiene la protección existente: facturas pagadas o con pagos registrados no pueden editarse, eliminarse ni anularse.

## 4. Versión
- Nueva versión funcional: **1.0.68**
- Archivo: `frontend/src/modules/system-update/version.js`
- Changelog actualizado con la sincronización del saldo.

## 5. Commits
- Corrección backend: `69d5f762bb8e4d253ae7b7b93b1411e007b7311b`
- Versión 1.0.68: `ea13a0ce16c6ffd9d5ad8ec99ccfde9b7dd840df`

## 6. Verificación prevista antes de producción
Debe probarse desde el Centro de Actualizaciones y posteriormente en una ficha de cliente:
1. Crear o disponer de una factura pendiente.
2. Confirmar que aparece en el contador y saldo.
3. Eliminarla desde la pestaña Facturación del cliente.
4. Confirmar que desaparece de la lista.
5. Confirmar que el contador y saldo del resumen se descuentan inmediatamente.
6. Editar el monto de otra factura pendiente y confirmar que el resumen cambia al nuevo monto.
7. Confirmar que una factura pagada continúa protegida.

## 7. Regla de seguridad
No se elimina ni modifica ninguna otra factura ni se reinicia la base de datos para corregir el resumen. El cálculo se deriva de los registros existentes del cliente.

## 8. Política aplicada
Se aplicó la política prioritaria `docs/POLITICA_PRIORITARIA_ERRORES_ACTUALIZACION.md`: revisar primero el cambio y la cadena de llamadas antes de realizar nuevas pruebas de actualización.
