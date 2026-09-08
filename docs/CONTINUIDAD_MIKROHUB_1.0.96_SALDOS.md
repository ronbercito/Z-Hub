# MikroHub — continuidad funcional 1.0.96

**Fecha:** 2026-09-08
**Versión funcional:** 1.0.96
**Tema:** Facturación del cliente → Saldos

## Objetivo
Implementar un libro mayor de saldos para registrar abonos a favor y deudas del cliente, manteniendo trazabilidad y aplicación automática en facturas futuras.

## Regla funcional
- Monto positivo: saldo a favor del cliente.
- Monto negativo: deuda del cliente.
- Saldo a favor se descuenta automáticamente de la siguiente factura mensual o manual.
- Deuda se suma automáticamente a la siguiente factura mensual o manual.
- Las aplicaciones quedan registradas como movimientos con factura destino.
- Una factura puede quedar pagada total o parcialmente con saldo a favor.

## Archivos nuevos
- `backend/app/models/client_balance.py` — libro mayor ORM de movimientos firmados.
- `backend/app/routers/facturacion/balances.py` — motor de aplicación automática de crédito/deuda.
- `backend/app/routers/facturacion/client_balances.py` — API aislada de Saldos.
- `frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx` — UI aislada de Saldos.

## Archivos modificados
- `backend/app/models/__init__.py` — registra `ClientBalance` para creación/migración ligera de tabla.
- `backend/server.py` — monta la API de saldos con permiso `billing`.
- `backend/app/routers/facturacion/router.py` — aplica saldo al crear facturas, aplica facturación mensual masiva y corrige el cálculo de pendiente/pagos parciales.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — integra el submódulo `ClientBillingBalances` sin mezclar su UI con la tabla de facturas.
- `frontend/src/modules/system-update/version.js` — versión 1.0.96 y changelog.

## API
- `GET /api/clients/{client_id}/balances`
- `POST /api/clients/{client_id}/balances`

## Flujo
1. Usuario entra a Facturación → Saldos.
2. Puede registrar, por ejemplo, `500` como saldo a favor o `-100` como deuda.
3. El movimiento queda en `client_balances` con monto firmado y saldo restante.
4. Al generar una factura manual desde Facturación, el backend aplica el libro mayor.
5. La generación mensual masiva usa el mismo motor.
6. Crédito positivo reduce `paid_amount` de la factura y puede marcarla `paid`.
7. Deuda negativa aumenta el monto de la nueva factura y se consume la deuda aplicada.
8. La aplicación queda trazada con factura destino.

## Validación pendiente
No se ha ejecutado `yarn build` ni una prueba contra la base de producción desde este entorno. La validación requerida antes de considerar 1.0.96 final es:
- actualizar por el Centro de Actualizaciones;
- comprobar que Facturación → Saldos carga;
- registrar `500` y verificar saldo a favor;
- generar una factura de `50` y verificar que queda pagada automáticamente y queda `450` disponible;
- registrar una deuda `-100` y generar una factura de `50`, verificando que la factura queda en `150` y la deuda se reduce en `50`;
- verificar historial, Facturas, Transacciones y Configuración;
- comprobar que las demás pestañas del cliente no presentan regresiones.

**Nota:** este registro complementa la bitácora maestra; la entrega no debe considerarse cerrada hasta que `docs/CONTINUIDAD_MIKROHUB.md` quede actualizado con este registro.
