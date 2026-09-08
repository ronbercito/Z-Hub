# Continuidad MikroHub — 2026-09-08 — Feedback visual de Comprobar

## Versión actual
**1.0.89**

## Solicitud
El usuario pidió que el botón **Comprobar** de la ventana Actualizaciones deje claro visualmente que el clic fue recibido y que el sistema está buscando actualizaciones.

## Cambio aplicado
Se reforzó `frontend/src/modules/system-update/UpdateCenter.jsx` para que durante `checking` muestre `Buscando actualización…`, icono giratorio, pulso, resplandor, cursor de espera, tres puntos animados, mensaje adicional de consulta al servidor, `aria-busy` y bloqueo contra clics repetidos.

La lógica de consulta permanece sin cambios: `GET /system-update/status` con `Cache-Control: no-cache` y `checked_at`.

## Backup
Antes del cambio funcional se creó la copia exacta:
`docs/backups/2026-09-08_1.0.88_UpdateCenter.jsx.bak`

Commit del backup: `3bd7e922bd29ec0c9b48a3af2e10e2735894f501`

## Archivos funcionales
- `frontend/src/modules/system-update/UpdateCenter.jsx`
- `frontend/src/modules/system-update/version.js`

## Versionado
`frontend/src/modules/system-update/version.js` continúa siendo la única fuente de verdad.

`PANEL_VERSION` queda en **1.0.89**.

Commit de versión: `59ca30d33353681494dd85d9ca52092234c1bef5`

Commit de interfaz: `a044cfb1dc2b0c3a3be6cee03605e8a886afdc80`

## Pruebas obligatorias
1. Abrir Actualizaciones.
2. Pulsar Comprobar.
3. Verificar cambio inmediato a `Buscando actualización…`.
4. Verificar giro, pulso, resplandor y puntos animados.
5. Verificar mensaje de consulta al servidor.
6. Verificar bloqueo durante la petición.
7. Verificar retorno a `Comprobar` al terminar.
8. Verificar que Actualizar sigue funcionando con una nueva versión.
9. Ejecutar build aislado antes de producción.

## Estado
El cambio está publicado en `main`. La compilación aislada y la validación en el panel siguen pendientes; no considerar cerrada la prueba hasta completarlas.
