# MikroHub — Continuidad 1.1.6 — Modal visual para eliminar servicio

Fecha: 2026-09-08

## Causa

En la pestaña Servicio, la confirmación de eliminación de un servicio adicional todavía utilizaba `window.confirm()`. El navegador mostraba un diálogo nativo con encabezado del servidor, por ejemplo `192.168.10.250 dice`, y no mantenía la experiencia visual del panel.

Se solicitó una ventana similar en estructura a la Advertencia prioritaria existente para eliminación definitiva de clientes: fondo oscuro, borde rojo, icono de alerta, resumen, observaciones, campo de confirmación y acciones claras.

## Backup

Antes del cambio se creó:

`backup/pre-modal-eliminar-servicio-2026-09-08`

Base: `main` en la versión 1.1.5.

## Solución

Se reutilizó `frontend/src/constants/clientDeleteGuard.js`, que ya contiene el diseño visual de las confirmaciones críticas del módulo Clientes.

El módulo ahora intercepta únicamente los `window.confirm()` cuyo mensaje corresponde a:

- `ADVERTENCIA: ELIMINACIÓN DE SERVICIO`
- `SEGUNDA ADVERTENCIA`

El diálogo nativo del navegador no se utiliza para esas dos confirmaciones.

La nueva ventana presenta:

- encabezado `Advertencia prioritaria` o `Confirmación de facturas`;
- subtítulo explicativo;
- bloque rojo de atención prioritaria;
- datos del servicio seleccionado;
- observaciones sobre la permanencia de la operación;
- cantidad y total de facturas pendientes cuando corresponda;
- campo donde el operador debe escribir `SI`;
- botón de eliminación deshabilitado hasta escribir `SI`;
- botón `Cancelar` y cierre por `X` o fuera de la ventana.

La eliminación real no se ejecuta al abrir el modal. Para conservar la lógica existente sin duplicar el endpoint, una confirmación aceptada vuelve a ejecutar el botón original con un bypass interno controlado. En la segunda advertencia se reservan dos confirmaciones internas para atravesar primero la confirmación general y luego la confirmación de facturas pendientes.

## Archivos modificados

- `frontend/src/constants/clientDeleteGuard.js`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.6_MODAL_ELIMINAR_SERVICIO.md`

No se modificó el endpoint de eliminación ni la auditoría backend.

## Versión

`PANEL_VERSION = 1.1.6`.

## Flujo esperado

1. Operador pulsa eliminar en un servicio adicional.
2. El `ClientServiceEditor` conserva su lógica actual y solicita confirmación.
3. El módulo de confirmaciones detecta que se trata de eliminación de servicio y muestra el modal visual.
4. Si el operador cancela, escribe algo distinto de `SI` o cierra la ventana, no se envía DELETE.
5. Si escribe `SI`, el botón se habilita y la operación original continúa.
6. Si el backend responde `PENDING_INVOICES`, se muestra una segunda ventana visual con cantidad y total pendiente.
7. Solo al confirmar esa segunda ventana se envía la eliminación con la confirmación de facturas pendientes.
8. El Log detallado de eliminación existente se conserva.

## Validación

- [x] Backup creado antes del cambio.
- [x] Diálogo nativo identificado como `192.168.10.250 dice` eliminado del flujo de servicio.
- [x] Diseño visual alineado con la Advertencia prioritaria existente.
- [x] Confirmación mediante texto `SI`.
- [x] Cancelar/cerrar evita continuar.
- [x] Segunda advertencia de facturas pendientes también usa modal visual.
- [x] No se modificó la lógica backend de eliminación.
- [ ] Ejecutar build del frontend.
- [ ] Probar eliminación de servicio adicional sin facturas pendientes.
- [ ] Probar eliminación con facturas pendientes.
- [ ] Comprobar que el Log registra la eliminación correctamente.

## Riesgo / pendiente

La interfaz se implementó reutilizando el flujo actual mediante una capa de interceptación específica para esos dos mensajes de confirmación. Debe validarse en navegador real para comprobar que el botón original de eliminación se conserva correctamente después de confirmar y que no existe interacción accidental con otras confirmaciones del panel.
