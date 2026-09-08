# Continuidad MikroHub — 2026-09-08 — Corrección eliminación definitiva 1.0.76

## Motivo
El operador reportó que la ventana de emergencia de eliminación mostraba `Servicios: 0` y `Facturas pendientes: 0` aunque la ficha del cliente demostraba 2 servicios y 2 facturas pendientes por S/. 100.00.

## Evidencia revisada
Las capturas del cliente `prueba` muestran:
- pestaña Servicios: `Principal` y `Servicio 1`, total 2 servicios;
- pestaña Facturación: 2 facturas pendientes de S/. 50.00 cada una;
- saldo por cobrar: S/. 100.00.
La ventana de eliminación, en cambio, mostraba servicios 0 y facturas 0.

## Causa
El guardia frontend `clientDeleteGuard.js` intentaba reconstruir la información mediante varias solicitudes genéricas (`/clients/{id}`, `/services`, `/invoices`). Esa estrategia podía producir un resumen incompleto y no garantizaba que la ventana usara la misma fuente de datos que la ficha del cliente.

## Corrección
Se creó `backend/app/routers/clientes/deletion_summary.py`, endpoint `GET /api/clients/{client_id}/deletion-summary`, que consulta directamente la base de datos y devuelve de forma autoritativa:
- nombre real del cliente;
- servicio principal;
- todos los servicios adicionales y sus planes;
- cantidad real de facturas `unpaid`/`overdue`;
- saldo pendiente real considerando `paid_amount`.

`frontend/src/constants/clientDeleteGuard.js` ahora utiliza exclusivamente este resumen para construir la advertencia previa a la eliminación. Si el resumen no puede obtenerse, la eliminación se cancela por seguridad.

## Archivos modificados
- `backend/app/routers/clientes/deletion_summary.py` — nuevo endpoint de resumen.
- `backend/server.py` — registro del nuevo router bajo permiso `clients`.
- `frontend/src/constants/clientDeleteGuard.js` — consume el resumen autoritativo.
- `frontend/src/modules/system-update/version.js` — versión 1.0.76 y changelog.

## Versión
**1.0.76**

## Commits
- `ba30b3fe` — endpoint de resumen.
- `98b32dea` — registro del router.
- `2c32dd36` — guardia frontend.
- `2e4cd4d4` — versión 1.0.76.

## Prueba requerida antes de producción
1. Cliente con 2 servicios y 2 facturas pendientes por S/. 100.00: la alerta debe mostrar exactamente esos datos y listar los 2 servicios.
2. Cliente sin servicios adicionales y sin deuda: debe mostrar 1 servicio principal, 0 facturas y S/. 0.00.
3. Error del endpoint de resumen: debe bloquear la eliminación.
4. Confirmación: solamente escribir `SI` permite continuar.
5. Verificar compilación aislada antes de actualizar producción, conforme a la política prioritaria de errores de actualización.
