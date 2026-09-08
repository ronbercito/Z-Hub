# MikroHub — Continuidad 1.1.8 — Modal de eliminación de servicio con campos reales

Fecha: 2026-09-08

## Causa

La versión 1.1.7 corrigió el título de la segunda confirmación y el parser de facturación, pero la prueba visual mostró que el modal seguía presentando `—` y `S/. 0.00`. Además, la segunda ventana había perdido los datos del servicio que sí estaban visibles en el aviso nativo del navegador.

## Fuente real verificada

`backend/app/routers/clientes/service_delete_audit.py` devuelve para un servicio con facturación pendiente un `409 PENDING_INVOICES` con:

- `message` con cantidad y total;
- `count` con la cantidad de facturas pendientes;
- `total` con el importe pendiente.

El aviso previo generado por `ClientServiceEditor.jsx` contiene los campos visibles del servicio:

- Plan;
- Precio;
- IP;
- MikroTik;
- Tecnología.

La captura proporcionada durante la prueba confirma ese contenido.

## Solución 1.1.8

Se modificó `frontend/src/constants/clientDeleteGuard.js` para:

1. Parsear el aviso inicial del servicio y conservar sus campos reales.
2. Guardar ese contexto durante el flujo de eliminación.
3. Reutilizar los datos del primer aviso en la segunda confirmación.
4. Extraer de forma independiente la cantidad de facturas y el importe `S/.` de la segunda advertencia, sin depender de una frase exacta.
5. Mostrar en la segunda ventana tanto los datos del servicio como:
   - Facturas pendientes;
   - Total pendiente.
6. Mantener el diseño oscuro con borde rojo, `Advertencia prioritaria`, campo `SI` y botones de cancelación/confirmación.
7. Mantener intacta la lógica backend de eliminación y auditoría.

## Archivos modificados

- `frontend/src/constants/clientDeleteGuard.js`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.8_MODAL_SERVICIO_CAMPOS_REALES.md`

No se modificó `backend/app/routers/clientes/service_delete_audit.py` porque sus campos `count` y `total` ya son correctos.

## Flujo esperado

1. El operador pulsa eliminar servicio.
2. El modal visual muestra los campos tomados del aviso real: servicio, plan, precio, IP, MikroTik y tecnología.
3. El operador escribe `SI`.
4. Se ejecuta nuevamente el flujo de eliminación.
5. Si el backend responde `PENDING_INVOICES`, se abre la segunda confirmación.
6. La segunda confirmación conserva los datos del servicio y agrega la cantidad real de facturas pendientes y el total real.
7. El operador debe volver a escribir `SI`.
8. Solo entonces se permite la eliminación del servicio y de las facturas pendientes no pagadas que corresponda.
9. Las facturas pagadas o parcialmente pagadas siguen protegidas.

## Backup

Se mantiene como referencia el backup previo de la corrección anterior:

`backup/pre-correccion-facturas-modal-servicio-2026-09-08`

## Validación

- [x] Inspección de las dos capturas proporcionadas.
- [x] Verificación del backend `service_delete_audit.py`.
- [x] Verificación del mensaje real usado por `ClientServiceEditor.jsx`.
- [x] Corrección del parser para cantidad/total.
- [x] Persistencia de los campos del servicio entre primera y segunda confirmación.
- [x] Versión actualizada a 1.1.8.
- [ ] Ejecutar build frontend.
- [ ] Probar en navegador real con servicio que tenga facturas pendientes.
- [ ] Confirmar visualmente los valores reales en segunda ventana.
- [ ] Confirmar flujo final `SI` → DELETE.

## Riesgo / pendiente

La corrección se limita a la capa visual/interceptación. Falta validación real después de desplegar 1.1.8 en el servidor.

## Commits

- Modal/campos reales: `8a865b7072ed508dae8a4c70569b7e326596f6af`.
- Versión 1.1.8: `0218e39b6cbfe301120a80b14d7c059ae037bfd1`.
