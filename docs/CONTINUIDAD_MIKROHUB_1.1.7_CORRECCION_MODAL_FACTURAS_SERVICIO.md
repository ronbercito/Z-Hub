# MikroHub — Continuidad 1.1.7 — Corrección del modal de eliminación de servicio

Fecha: 2026-09-08

## Causa

Durante la prueba visual de la versión 1.1.6 se detectó que la segunda confirmación aparecía como `Confirmación de facturas`, aunque la operación que se confirma sigue siendo la **eliminación del servicio**. Además, el bloque `Facturas pendientes` mostraba `—` y `S/. 0.00` aunque el servicio sí tenía facturas pendientes.

## Diagnóstico

El backend `backend/app/routers/clientes/service_delete_audit.py` devuelve actualmente el mensaje:

`Este servicio tiene N factura(s) pendiente(s) por S/. TOTAL.`

El parser del modal de 1.1.6 esperaba solamente el formato anterior `por un total de S/. TOTAL`. Por eso no extraía `count` ni `total` y la interfaz mostraba valores vacíos/por defecto.

## Backup

Antes de esta corrección se creó:

`backup/pre-correccion-facturas-modal-servicio-2026-09-08`

Base: `main` en el commit `4ecd8792df7ddf8fdea0956ed7ba46c76e903f89` (versión 1.1.6).

## Solución

Se corrigió el parser de `clientDeleteGuard.js` para aceptar ambos formatos:

- `por S/. 10.00` — formato actual del backend.
- `por un total de S/. 10.00` — formato anterior compatible.

La segunda ventana ahora usa como título:

`Confirmación de eliminación del servicio`

Y como subtítulo:

`El servicio tiene facturación pendiente asociada`

El bloque de datos conserva:

- Facturas pendientes: cantidad real.
- Total pendiente: importe real.

El botón continúa siendo `Eliminar servicio y pendientes`, porque esa segunda confirmación autoriza específicamente la eliminación del servicio junto con las facturas pendientes no pagadas que detectó el backend.

## Archivos modificados

- `frontend/src/constants/clientDeleteGuard.js` — parser y textos del modal.
- `frontend/src/modules/system-update/version.js` — versión 1.1.7 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_1.1.7_CORRECCION_MODAL_FACTURAS_SERVICIO.md` — esta continuidad.

No se modificó `backend/app/routers/clientes/service_delete_audit.py` porque su respuesta ya contiene correctamente `count` y `total`.

## Flujo esperado

1. Operador pulsa eliminar un servicio adicional.
2. Aparece la primera `Advertencia prioritaria` con los datos del servicio.
3. Si el servicio no tiene facturas pendientes y se confirma `SI`, continúa la eliminación.
4. Si el backend responde `409 PENDING_INVOICES`, aparece una segunda ventana titulada `Confirmación de eliminación del servicio`.
5. La segunda ventana muestra la cantidad real de facturas pendientes y el total real.
6. El operador debe escribir `SI`.
7. Solo entonces continúa la eliminación del servicio y de las facturas pendientes permitidas por el flujo.
8. Las facturas pagadas o parcialmente pagadas siguen protegidas.
9. El Log detallado existente continúa registrando la operación.

## Validación

- [x] Backup creado antes de modificar `main`.
- [x] Confirmado el formato real de respuesta del backend.
- [x] Corregido el parser para `por S/.`.
- [x] Conservada compatibilidad con `por un total de S/.`.
- [x] Corregido el título para hablar de eliminación del servicio.
- [x] Cantidad y total pendientes quedan enlazados a los valores del backend.
- [ ] Ejecutar build del frontend.
- [ ] Probar en navegador real un servicio con facturas pendientes.
- [ ] Confirmar visualmente cantidad/total reales.
- [ ] Confirmar que `SI` continúa hasta el DELETE final.

## Riesgo / pendiente

La corrección se realizó sobre la capa de presentación/interceptación. La lógica de negocio y eliminación del backend no fue alterada. Falta validación funcional en el servidor/navegador después de desplegar la versión 1.1.7.

## Commits

- Corrección modal: `9c48c0aad090652b2a5b61d069cb946930b77a03`.
- Versión 1.1.7: `100ee5a8585e89f0e62ff0062aad6ed0793b49a8`.
