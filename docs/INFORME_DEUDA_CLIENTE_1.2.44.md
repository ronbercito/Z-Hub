# Z-Hub 1.2.44 — Estado / Deuda con múltiples servicios

## Objetivo
Restaurar en el listado de Clientes el comportamiento visual de deuda pendiente que existía antes de los cambios recientes en servicios múltiples.

## Corrección
- Si `balance_due > 0`, el monto vuelve a mostrarse resaltado en rojo/rosa.
- Junto al monto aparece una burbuja roja con `unpaid_invoices_count`.
- El tooltip identifica el valor como cantidad de facturas pendientes.
- El monto mostrado continúa siendo `balance_due`, que representa el saldo pendiente agregado del cliente y no el precio de un solo servicio.
- Si no existe deuda, se muestra `S/. 0.00` en tono neutro y sin burbuja roja.

## Servicios múltiples
Las facturas de los servicios adicionales se guardan con el mismo `client_id`; el saldo del cliente se calcula sobre sus facturas pendientes, por lo que el indicador de la lista representa el total del abonado aunque tenga varios servicios.

## Archivos modificados
- `frontend/src/modules/clientes/Clients.jsx`
- `backend/tests/test_maintenance_contracts.py`
- `frontend/src/modules/system-update/version.js`

## Backup
- Rama: `backup/pre-client-debt-display-1.2.43-20260910`
- HEAD previo: `e0f39345be3c97dd8c671be80384e2e65077761f`
- Registro: `docs/backups/1.2.43/CLIENT_DEBT_DISPLAY_BACKUP.md`

## Compatibilidad
No se modifica MariaDB, no se borran facturas ni servicios y no se cambia el aprovisionamiento MikroTik. La corrección recupera la representación visual del contador y del total pendiente existente en los datos del cliente.

## Validación
Se agregó una regresión estática que exige el uso de `balance_due`, `unpaid_invoices_count`, el texto de facturas pendientes y las clases de resaltado rojo. GitHub Actions debe validar además el build React y los contratos de mantenimiento.

## Prueba pendiente
Validación visual en el servidor con un cliente que tenga dos o más servicios y varias facturas pendientes, comprobando que la burbuja muestre el número correcto y el monto sea la suma total pendiente.
