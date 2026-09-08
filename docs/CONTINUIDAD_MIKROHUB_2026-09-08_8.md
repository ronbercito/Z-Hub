# Continuidad MikroHub — 2026-09-08 — Corrección del nombre en eliminación definitiva

## Versión
- PANEL_VERSION: 1.0.75
- Cambio funcional publicado en `main`.

## Problema observado
En la ventana de confirmación de eliminación definitiva se mostraba el UUID interno del cliente en lugar de su nombre. El usuario indicó que debía mostrarse el nombre real del cliente y que nunca debía aparecer la IP del servidor ni el texto nativo del navegador.

## Causa
`Clients.jsx` ejecuta una confirmación nativa con el nombre del cliente antes de enviar el DELETE. El guard de eliminación interceptaba posteriormente la solicitud, pero intentaba obtener nuevamente el nombre desde el endpoint del cliente; en algunos casos esa respuesta no contenía `full_name` y el fallback terminaba mostrando el ID.

## Corrección
Se actualizó `frontend/src/constants/clientDeleteGuard.js` para capturar el nombre que ya viene en el mensaje de confirmación que genera `Clients.jsx` y utilizarlo como primera fuente al construir el modal propio de MikroHub.

También se mantiene la sustitución del diálogo nativo por el modal propio: el `window.confirm()` interceptado devuelve `true` únicamente para permitir que el flujo llegue al interceptor de la petición DELETE; la confirmación real continúa siendo la ventana HTML de MikroHub, donde el operador debe escribir `SI`.

## Resultado esperado
- Cliente: muestra el nombre real, por ejemplo `prueba`.
- Servicios: muestra la cantidad y el detalle de los servicios registrados.
- Facturas pendientes: muestra la cantidad.
- Saldo pendiente: muestra el monto total pendiente.
- No aparece `192.168.10.250 dice`.
- No aparece el UUID del cliente cuando el nombre está disponible en el listado.
- La eliminación requiere escribir `SI`.

## Archivos afectados
- `frontend/src/constants/clientDeleteGuard.js`
- `frontend/src/modules/system-update/version.js`

## Historial de commits
- `28534fd` — corrección de captura del nombre real en la confirmación.
- `472359c` — actualización de versión a 1.0.75.

## Prueba requerida antes de producción
1. Compilar en worktree aislado con `DISABLE_ESLINT_PLUGIN=true CI= yarn build`.
2. Probar un cliente con 2 servicios y facturas pendientes.
3. Probar un cliente sin deuda.
4. Verificar que ambos flujos usen el modal propio de MikroHub.
5. Verificar que el nombre mostrado sea el nombre del cliente y no el UUID.

## Política aplicada
Se siguió la política prioritaria de errores de actualización: revisar primero el código modificado y el flujo de llamadas antes de repetir una actualización en producción.
