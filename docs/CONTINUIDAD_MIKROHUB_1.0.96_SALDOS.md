# MikroHub — continuidad funcional 1.0.97

**Fecha:** 2026-09-08
**Versión funcional:** 1.0.97
**Tema:** Facturación del cliente → Saldos

## Objetivo
Implementar y corregir el libro mayor de saldos para registrar abonos a favor y deudas del cliente, manteniendo trazabilidad y aplicación automática en facturas futuras.

## Regla funcional definitiva
- Monto positivo: saldo a favor del cliente.
- Monto negativo: deuda del cliente.
- Saldo a favor se descuenta automáticamente de la siguiente factura mensual o manual.
- Deuda se suma **completa** a la siguiente factura mensual o manual, aunque la deuda sea mayor que el monto base de esa factura.
- Las aplicaciones quedan registradas como movimientos con factura destino.
- Una factura puede quedar pagada total o parcialmente con saldo a favor.

## Corrección 1.0.97
En la primera implementación, una deuda negativa se limitaba al saldo pendiente de la factura nueva. Eso no correspondía a la regla solicitada: `-100` + factura base `50` debe producir una factura final de `150`. Se corrigió `balances.py` para trasladar la deuda completa y consumirla en un solo movimiento de aplicación.

## Archivos nuevos
- `backend/app/models/client_balance.py` — libro mayor ORM de movimientos firmados.
- `backend/app/routers/facturacion/balances.py` — motor de aplicación automática de crédito/deuda.
- `backend/app/routers/facturacion/client_balances.py` — API aislada de Saldos.
- `frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx` — UI aislada de Saldos.

## Archivos modificados
- `backend/app/models/__init__.py` — registra `ClientBalance` para creación/migración ligera de tabla.
- `backend/server.py` — monta la API de saldos con permiso `billing`.
- `backend/app/routers/facturacion/router.py` — aplica saldo al crear facturas, aplica facturación mensual masiva y corrige el cálculo de pendiente/pagos parciales.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — integra el submódulo `ClientBillingBalances`.
- `backend/app/routers/facturacion/balances.py` — corrección de deuda completa.
- `frontend/src/modules/system-update/version.js` — versión 1.0.97 y changelog.

## API
- `GET /api/clients/{client_id}/balances`
- `POST /api/clients/{client_id}/balances`

## Flujo
1. Usuario entra a Facturación → Saldos.
2. Registra `500` como saldo a favor o `-100` como deuda.
3. El movimiento queda en `client_balances` con monto firmado y saldo restante.
4. Al generar una factura manual, el backend aplica el libro mayor.
5. La generación mensual masiva utiliza el mismo motor.
6. Crédito positivo aumenta `paid_amount` hasta el máximo de la factura y deja el excedente como saldo disponible.
7. Deuda negativa aumenta el `amount` de la nueva factura con el total de la deuda y consume esa deuda.
8. Cada aplicación queda trazada con factura destino.

## Validación pendiente
No se ha ejecutado `yarn build` ni una prueba contra la base de producción desde este entorno. Antes de considerar 1.0.97 final se debe validar mediante el Centro de Actualizaciones:
- `500` → factura base `50` → factura final `50`, estado `paid`, pago automático `50`, saldo disponible `450`;
- `-100` → factura base `50` → factura final `150`, deuda consumida `100`;
- pagos parciales siguen calculando correctamente el pendiente;
- historial de Saldos muestra factura origen/destino y movimientos de aplicación;
- Facturas, Transacciones y Configuración siguen funcionando;
- las demás pestañas del cliente no presentan regresiones.

**Nota de continuidad:** el registro maestro `docs/CONTINUIDAD_MIKROHUB.md` debe incorporar este registro antes de declarar 1.0.97 cerrada. Se mantiene separado para no reemplazar ni perder el historial maestro existente.
