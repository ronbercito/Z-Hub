# MikroHub — Continuidad 1.1.5 — Log claro de servicio adicional

Fecha: 2026-09-08

## Causa

Al crear un servicio adicional, la pestaña Log mostraba información tomada directamente del formulario antes de que los datos descriptivos persistidos estuvieran disponibles. Esto podía producir registros poco coherentes, por ejemplo `Precio: S/. 0.00`, el ID del MikroTik en lugar de su nombre y el ID de la zona en lugar de su nombre.

## Backup

Antes del cambio se creó:

`backup/pre-log-servicio-adicional-claro-2026-09-08`

La rama parte del `main` que contenía la versión 1.1.4.

## Solución implementada

Se corrigió `backend/app/modules/client_workspace/router.py` para que, cuando recibe el evento `Servicio creado`, consulte el último `ClientService` persistido del cliente y reconstruya el detalle usando los valores reales guardados.

El registro ahora tiene una estructura legible:

`Se creó un servicio adicional correctamente. Plan: ... · Precio mensual: ... · Conexión: ... · Tecnología: ... · IP: ... · Usuario PPPoE: ... · MikroTik: ... · Zona: ...`

Para conexiones que no usan PPPoE se muestra `Usuario PPPoE: No aplica`, evitando información engañosa como `sin usuario`.

La cuenta y el rol autenticados continúan agregándose al final del registro.

## Archivos modificados

- `backend/app/modules/client_workspace/router.py`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.5_LOG_SERVICIO_ADICIONAL.md`

## Versión

`PANEL_VERSION = 1.1.5`.

## Commits

- `2b55ccf132ecc38d729e497d18f11ac8332a8ab9` — corrección del Log en backend.
- `242d46bb1f68e1bc69ed7e47f20df08921052063` — versión 1.1.5 y changelog.
- Commit posterior de este documento de continuidad.

## Flujo esperado

1. El operador crea un servicio adicional.
2. El backend guarda el servicio y sus datos descriptivos.
3. `ClientDetail` envía el evento `Servicio creado`.
4. El endpoint de actividad consulta el servicio persistido más reciente.
5. El Log registra nombres y valores reales, no IDs del formulario ni precio cero por falta de resolución.
6. Se conserva la cuenta y el rol del operador.

## Validación

- [x] Backup creado antes del cambio.
- [x] Corrección aplicada en `main`.
- [x] Precio tomado del servicio persistido.
- [x] Nombre de plan, MikroTik y zona tomado del servicio persistido.
- [x] Tecnología y conexión mostradas con etiquetas legibles.
- [x] PPPoE marcado como `No aplica` cuando corresponde.
- [x] Cuenta y rol autenticados conservados.
- [ ] Ejecutar build del frontend.
- [ ] Probar creación real de un servicio adicional en el panel y revisar la pestaña Log.

## Riesgo / pendiente

La corrección está publicada en `main`, pero el build y la prueba funcional en servidor todavía deben ejecutarse antes de considerar cerrada la validación de la versión 1.1.5.
