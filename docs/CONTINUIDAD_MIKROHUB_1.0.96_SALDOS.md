# MikroHub — continuidad funcional 1.0.98

**Fecha:** 2026-09-08  
**Versión funcional:** 1.0.98  
**Tema:** Facturación del cliente → navegación visual de pestañas

## Objetivo
Hacer que las pestañas internas de Facturación del cliente sean claramente visibles y fáciles de ubicar, siguiendo el diseño aprobado: navegación amplia, iconos, estado activo luminoso y separación visual entre Facturas, Transacciones, Saldos y Configuración.

## Solución
- Se reemplazó la barra de pestañas pequeña por un contenedor destacado con cuatro botones grandes.
- La pestaña activa usa fondo cian translúcido, borde luminoso, icono resaltado y línea inferior brillante.
- Las pestañas inactivas mantienen contraste suficiente y una respuesta visual al pasar el cursor.
- La navegación pasa a dos columnas en pantallas pequeñas y cuatro columnas en pantallas grandes.
- Se mantiene el contenido y la lógica de cada pestaña sin cambiar endpoints ni base de datos.
- El encabezado de Facturación ahora identifica explícitamente el módulo y explica que las pestañas superiores controlan facturas, pagos/transacciones, saldos y configuración.
- Se conservaron las tarjetas de Facturado, Pagado y Por cobrar.

## Archivos modificados
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — propietario de la navegación interna y composición visual de Facturación.
- `frontend/src/modules/system-update/version.js` — versión 1.0.98 y CHANGELOG visible.
- `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md` — registro de continuidad actualizado.

## Backup
Antes de modificar `main` se creó:

`backup/pre-facturacion-tabs-resaltadas-2026-09-08`

La rama conserva el estado anterior a este cambio visual para permitir rollback si el build o la interfaz presentan regresiones.

## Base de datos
Sin cambios. No se eliminan tablas ni datos.

## API
Sin cambios.

## Flujo
```text
Ficha del cliente
  ↓
Facturación
  ↓
Navegación destacada
  ├── Facturas
  ├── Transacciones
  ├── Saldos
  └── Configuración
```

## Pruebas
- [x] backup creado antes de modificar `main`.
- [x] revisión del propietario real del comportamiento (`billing/ClientBilling.jsx`).
- [x] actualización de la fuente de versión a 1.0.98.
- [x] revisión de que endpoints y estado funcional no fueron cambiados deliberadamente.
- [ ] `yarn build` — no ejecutado desde este entorno.
- [ ] validación visual en navegador/servidor — pendiente de despliegue.
- [ ] prueba de las cuatro pestañas y de Factura libre/Saldos después de instalar 1.0.98.

## Resultado
Código publicado en `main` con la navegación visual resaltada. La validación de build y del panel real queda pendiente y debe realizarse antes de considerar la versión completamente validada.

## Riesgos / pendientes
- Un error de compilación React solo puede descartarse ejecutando el build real.
- La rama de backup debe conservarse hasta validar 1.0.98 en el servidor.
- La bitácora maestra `docs/CONTINUIDAD_MIKROHUB.md` debe incorporar este registro en su próxima actualización consolidada; este archivo conserva el detalle específico de la entrega.

## Commits
- Cambio visual de Facturación: `7ddae5b12235f5b9dce43a0ce6154ffefb3a5590`
- Versión 1.0.98: `f2d098facf6aea953df195eb768e3dc56ad1ae3d`
