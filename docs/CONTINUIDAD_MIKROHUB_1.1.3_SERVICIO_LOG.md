# MikroHub — Continuidad 1.1.3 — Log de eliminación de servicios

Fecha: 2026-09-08

## Causa

Al eliminar un servicio adicional de un cliente con varios servicios, el Log mostraba un evento genérico como `Servicio editado`. No permitía identificar qué servicio se eliminó ni si junto con él se eliminaron facturas pendientes/deuda.

## Solución

Se añadió un endpoint de eliminación auditada que conserva la confirmación existente cuando hay facturas pendientes y registra después de una eliminación exitosa:

- servicio y número de servicio;
- plan y precio;
- conexión y tecnología;
- MikroTik, IP y usuario PPPoE;
- zona y estado anterior;
- cantidad de facturas pendientes eliminadas;
- monto total de las facturas eliminadas;
- número, monto y estado de cada factura eliminada;
- indicación explícita cuando no había deuda/facturas pendientes;
- cuenta autenticada y rol del administrador o técnico.

## Corrección adicional de interfaz

`ClientServiceEditor.jsx` ya no dispara el evento genérico `Servicio editado` después de eliminar. El callback informa la operación como `delete`, por lo que `ClientDetail.jsx` evita crear un segundo registro genérico. Para creación/edición conserva un registro específico con la configuración del servicio.

## Archivos

- `backend/app/routers/clientes/service_delete_audit.py`
- `backend/server.py`
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`
- `frontend/src/modules/clientes/ClientDetail.jsx`
- `frontend/src/modules/system-update/version.js`

## Flujo de deuda

Si existen facturas `unpaid` o `overdue` con `paid_amount <= 0`, primero se mantiene la advertencia/confirmación existente. Con confirmación, esas facturas son las únicas que se eliminan en este flujo. Las facturas pagadas o parcialmente pagadas quedan protegidas.

## Ejemplo

`Servicio 2 eliminado | Plan: PLAN50 | Precio: S/. 50.00 | Conexión: PPPoE | Tecnología: fiber | MikroTik: RB-01 | IP: 10.0.0.25 | Usuario PPPoE: cliente002 | Zona: Norte | Estado anterior: active | Deuda/facturas pendientes eliminadas: 1 por S/. 50.00 | Facturas eliminadas: REC-123: S/. 50.00 (unpaid) | Cuenta: tecnico@ejemplo.pe | Rol: tecnico`

## Backup

`backup/pre-log-servicio-detallado-2026-09-08` creado desde el estado previo `6188bb788895147b69f026e615912e962ef725a1`.

## Versión

`PANEL_VERSION = 1.1.3`.

## Validación

- [x] backup creado;
- [x] endpoint auditado creado;
- [x] detalle de servicio y deuda implementado;
- [x] cuenta y rol autenticados incluidos;
- [x] evento genérico posterior a eliminación suprimido;
- [x] comprobación sintáctica básica del módulo nuevo;
- [ ] build React/backend en servidor;
- [ ] prueba real sin deuda;
- [ ] prueba real con deuda;
- [ ] prueba con administrador y técnico.
