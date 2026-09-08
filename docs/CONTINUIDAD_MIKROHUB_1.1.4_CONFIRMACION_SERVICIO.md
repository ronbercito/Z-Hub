# MikroHub — Continuidad 1.1.4 — Confirmación de eliminación de servicio

Fecha: 2026-09-08

## Causa

En la pestaña Servicio, el botón de eliminar de un servicio adicional podía iniciar directamente la petición de eliminación. Se solicitó una advertencia visible y una confirmación explícita para evitar eliminaciones accidentales.

## Backup

Antes del cambio se creó:

`backup/pre-confirmacion-eliminar-servicio-2026-09-08`

Base del backup: `54bb0d863f069c15f1143bc37824f50472192a45`.

## Solución implementada

En `ClientServiceEditor.jsx`, antes de llamar al endpoint DELETE de un servicio adicional:

1. Se verifica que no sea el servicio principal.
2. Se muestra una primera advertencia con confirmación explícita.
3. La advertencia identifica el servicio y, cuando están disponibles, plan, precio, IP, usuario PPPoE, MikroTik y tecnología.
4. Si el usuario cancela, no se realiza ninguna petición de eliminación.
5. Si el backend informa que existen facturas pendientes, se muestra una segunda advertencia con cantidad y monto total.
6. Solo una segunda confirmación permite continuar con la eliminación de esas facturas pendientes.
7. Las facturas pagadas o parcialmente pagadas permanecen protegidas por el flujo existente.
8. La operación confirmada continúa enviándose al Log detallado como `delete` y no genera un evento genérico `Servicio editado`.

## Archivos modificados

- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`
- `frontend/src/modules/system-update/version.js`

## Versión

`PANEL_VERSION = 1.1.4`.

Este incremento mantiene la regla establecida de que después de 1.0.99 el ciclo continúa como 1.1.x.

## Resultado esperado

Al pulsar eliminar en un servicio adicional aparecerá una advertencia similar a:

`⚠️ ADVERTENCIA: ELIMINACIÓN DE SERVICIO`

`Vas a eliminar este servicio adicional...`

`Esta acción es permanente y no se puede deshacer.`

`¿Estás seguro de que deseas continuar?`

Si existen facturas pendientes, aparece una segunda advertencia específica antes de eliminarlas.

## Validación

- [x] Backup creado antes del cambio.
- [x] Servicio principal no puede eliminarse desde este botón.
- [x] Confirmación previa obligatoria para servicios adicionales.
- [x] Segunda confirmación cuando existen facturas pendientes.
- [x] Cancelar evita la petición DELETE.
- [x] Log detallado de eliminación se conserva.
- [ ] Ejecutar build en servidor.
- [ ] Probar en panel con servicio adicional sin deuda.
- [ ] Probar en panel con servicio adicional con factura pendiente.

## Riesgo / pendiente

La validación de build y la prueba funcional en el servidor aún deben ejecutarse antes de cerrar definitivamente la entrega.
