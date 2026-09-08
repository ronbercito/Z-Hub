# Continuidad MikroHub — 2026-09-08 — Fecha de instalación preseleccionada

## 1. Versión actual
La versión funcional queda en **1.0.88**.

## 2. Solicitud
El usuario solicitó que, al abrir **Nuevo Abonado**, el campo **Fecha de instalación** muestre por defecto la fecha actual del momento del registro.

La selección manual debe conservarse: el usuario puede abrir el calendario y cambiar la fecha por otra si lo necesita.

## 3. Evidencia y diagnóstico
La interfaz ya disponía de un calendario funcional en `ClientRegistrationWizard.jsx`. El problema era que `emptyForm()` en `Clients.jsx` inicializaba `installation_date` como cadena vacía (`""`). Por ello el calendario no recibía una fecha seleccionada al iniciar un nuevo registro.

El calendario ya usa `formData.installation_date` como valor seleccionado, por lo que la corrección se realizó en el punto central de inicialización del formulario.

## 4. Cambio realizado
Se modificó:

`frontend/src/modules/clientes/Clients.jsx`

La función `emptyForm()` ahora inicializa `installation_date` con la fecha local actual en formato ISO `YYYY-MM-DD`.

Esto hace que al ejecutar **Nuevo Abonado**:

- el campo muestre inmediatamente la fecha actual;
- el calendario abra sobre el mes actual;
- el día actual aparezca como seleccionado;
- el usuario pueda modificar la fecha normalmente desde el calendario;
- el flujo de edición de clientes existentes conserve la fecha almacenada, porque `startEdit()` sobrescribe `installation_date` con el valor del cliente.

Commit funcional:
`89339f2e85eaabcba7e7b71883e9debe6bb1a6d7`

## 5. Backup previo
Antes de modificar el código se creó una rama de recuperación exacta del estado anterior:

`backup/pre-1.0.88-installation-date`

La rama apunta al estado previo a la modificación:

`189932ca10d5e3f0cdfd994ecc6e43d763a225a0`

Esta rama funciona como respaldo completo del proyecto antes del cambio y permite recuperar el estado anterior sin depender de una copia parcial.

## 6. Versionado
Se actualizó la única fuente de versión:

`frontend/src/modules/system-update/version.js`

Nueva versión:
`1.0.88`

El `CHANGELOG` registra la fecha automática, la posibilidad de modificarla y la existencia del backup previo.

Commit:
`4714c5961aca38749f9fbf479835419526fac721`

## 7. Regla arquitectónica conservada
La versión continúa administrándose únicamente desde:

`frontend/src/modules/system-update/version.js`

No se agregó ningún número de versión duplicado en `Clients.jsx` ni en otros módulos.

## 8. Archivos modificados
- `frontend/src/modules/clientes/Clients.jsx`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08_15.md`

## 9. Pruebas obligatorias antes de producción
1. Ejecutar build aislado del frontend.
2. Abrir **Nuevo Abonado**.
3. Confirmar que **Fecha de instalación** aparece con la fecha del día.
4. Abrir el calendario y confirmar que el día actual aparece seleccionado.
5. Cambiar manualmente a otra fecha.
6. Confirmar que la nueva fecha seleccionada se muestra correctamente.
7. Confirmar que registrar un nuevo cliente conserva la fecha seleccionada.
8. Abrir la edición de un cliente existente y confirmar que conserva su fecha almacenada, sin reemplazarla por la fecha actual.
9. Confirmar que no se alteró el funcionamiento de coordenadas, facturación, NAP, MikroTik ni demás campos del asistente.
10. Confirmar que el panel reconoce la versión **1.0.88** después del build y actualización.

## 10. Estado
El cambio funcional y la versión fueron publicados en `main`.

La compilación aislada y la prueba final en producción siguen pendientes antes de considerar cerrada la entrega.

## 11. Historial inmediato
- **1.0.83** — consolidación de restauración del aviso de eliminación.
- **1.0.85** — alerta roja modular de eliminación.
- **1.0.86** — centralización de administración de versión en `version.js` y backup previo.
- **1.0.87** — feedback visual durante la comprobación manual de actualizaciones y backup previo de `UpdateCenter.jsx`.
- **1.0.88** — fecha de instalación preseleccionada automáticamente al iniciar un Nuevo Abonado, manteniendo edición manual y backup previo mediante rama.
