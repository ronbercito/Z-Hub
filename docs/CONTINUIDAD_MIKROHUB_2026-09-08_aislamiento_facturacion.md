# MikroHub — continuidad: aislamiento de Facturación del cliente

**Fecha:** 2026-09-08  
**Versión funcional:** 1.0.91  
**Revisión interna:** aislamiento-facturacion-01

## Causa
La zona de Facturación del cliente concentra mucho JSX y lógica en `ClientBilling.jsx`. Una modificación anterior de ordenamiento produjo un error JSX que impidió compilar el frontend completo.

## Solución
Se mantiene el punto de entrada existente y se extrae la implementación a un submódulo dedicado:

- `frontend/src/modules/clientes/editor/ClientBilling.jsx` → wrapper estable.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` → implementación de facturación.
- `frontend/src/modules/clientes/editor/billing/ClientBillingErrorBoundary.jsx` → aislamiento de errores de ejecución.

`ClientDetail.jsx` no necesita cambiar su importación: continúa consumiendo `./editor/ClientBilling`.

## Flujo
```text
ClientDetail
  ↓
editor/ClientBilling.jsx
  ↓
ClientBillingErrorBoundary
  ↓
editor/billing/ClientBilling.jsx
  ↓
APIs existentes de clientes / facturas / pagos / configuración
```

Si el módulo produce un error durante renderizado, el ErrorBoundary muestra un aviso controlado únicamente en Facturación y permite reintentar. Las demás pestañas de la ficha permanecen fuera del boundary.

## Alcance
No se modifican endpoints, modelos, base de datos ni reglas de negocio. Se conserva el flujo existente de facturas, pagos, transacciones, saldos y configuración.

## Respaldo
Antes de modificar `main` se creó:
`backup/pre-facturacion-aislada-2026-09-08`

Este respaldo debe conservarse durante la validación. Si la nueva estructura queda estable después del despliegue y las pruebas operativas, podrá eliminarse en una mejora posterior.

## Pruebas
- Inspección del estado real de `main` antes del cambio: realizada.
- Creación y verificación del respaldo Git: realizada.
- Revisión de rutas/importaciones y extracción del módulo: realizada.
- Build React: pendiente de ejecutar en el servidor mediante `setup_debian.sh` / `yarn run craco build`.

## Riesgo conocido
El ErrorBoundary protege errores en tiempo de ejecución. Un error de sintaxis o compilación sigue afectando al build completo de React y debe detectarse antes de publicar.

## Pendiente
Validar en servidor que el build termine correctamente y comprobar las pestañas Resumen, Servicio, Facturación, Tickets, Email/SMS, Documentos, Estadísticas y Log después del despliegue.
