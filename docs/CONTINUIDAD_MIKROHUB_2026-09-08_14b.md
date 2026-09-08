# Continuidad MikroHub — 2026-09-08 — Feedback visual en Comprobar actualizaciones

## Versión objetivo
La corrección funcional se prepara sobre **1.0.88**, incrementando a **1.0.89**.

## Solicitud
El usuario solicitó que el botón **Comprobar** de la ventana Actualizaciones tenga feedback visual inmediato al hacer clic, porque el botón actual no deja claro que la consulta está ocurriendo.

## Diagnóstico
`frontend/src/modules/system-update/UpdateCenter.jsx` ya disponía de `checking`, texto `Buscando actualización…`, icono giratorio y texto auxiliar. Se refuerza el feedback para que el botón se perciba claramente activo durante toda la consulta.

## Cambio
El botón Comprobar incorpora estado activo, texto de búsqueda, icono giratorio, pulso/resplandor, cursor de espera, puntos animados, mensaje separado de consulta y bloqueo durante la comprobación. Se añade `aria-busy`.

La consulta sigue siendo `GET /system-update/status` con `Cache-Control: no-cache` y `checked_at`.

## Backup
Se creó previamente la copia exacta:
`docs/backups/2026-09-08_1.0.88_UpdateCenter.jsx.bak`

Commit: `3bd7e922bd29ec0c9b48a3af2e10e2735894f501`

## Versionado
La fuente única sigue siendo `frontend/src/modules/system-update/version.js`. Se debe incrementar a **1.0.89** y registrar el cambio en CHANGELOG.

## Pruebas
Abrir Actualizaciones, pulsar Comprobar y verificar cambio inmediato, giro, pulso, puntos, mensaje de consulta, bloqueo durante la petición y retorno al estado normal. Ejecutar build aislado antes de producción.

## Estado
No considerar cerrado hasta validar build y comportamiento en el panel.
