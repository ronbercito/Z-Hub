# MikroHub — continuidad 1.0.94

**Fecha:** 2026-09-08

## Cambio
Se agregó ordenamiento para la tabla de Facturación del cliente en los encabezados:
- Recibo
- Servicio
- Período
- Monto
- Vencimiento
- Estado

La columna Acciones no es ordenable.

## Solución
El ordenamiento se implementó como una capa independiente dentro de `frontend/src/modules/clientes/editor/billing/ClientBillingSorting.jsx`, montada desde el wrapper estable `frontend/src/modules/clientes/editor/ClientBilling.jsx`. Esto evita volver a editar el archivo grande de la implementación de facturación para este cambio visual/interactivo.

Cada encabezado alterna ascendente/descendente y muestra un indicador visual. Las filas auxiliares de pago permanecen asociadas a su factura al ordenar.

## Archivos
- `frontend/src/modules/clientes/editor/billing/ClientBillingSorting.jsx` — nueva capa de ordenamiento.
- `frontend/src/modules/clientes/editor/ClientBilling.jsx` — integración de la capa.
- `frontend/src/modules/system-update/version.js` — versión 1.0.94 y CHANGELOG.

## Compatibilidad
No se modificaron API, base de datos, autenticación ni lógica de facturación.

## Pruebas
- Se revisó el código de la implementación aislada existente antes del cambio.
- Se verificó balance de delimitadores del nuevo módulo de ordenamiento.
- Pendiente: ejecutar el build React mediante el Actualizador del panel y probar los seis encabezados en producción.

## Resultado esperado
La tabla debe permitir hacer clic en Recibo, Servicio, Período, Monto, Vencimiento y Estado para alternar el orden. El backup `backup/pre-facturacion-aislada-2026-09-08` se conserva hasta terminar la validación.

## Nota de continuidad
Este documento es un registro específico de la entrega 1.0.94. La bitácora maestra `docs/CONTINUIDAD_MIKROHUB.md` debe incorporar esta entrada en su siguiente actualización de documentación.
