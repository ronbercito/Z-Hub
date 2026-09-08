# Continuidad MikroHub — 2026-09-08 — Centralización de versión

## 1. Versión actual
La versión funcional publicada queda en **1.0.86**.

## 2. Solicitud
El usuario solicitó que la administración manual de versión quede concentrada en un solo archivo, evitando modificar varios módulos cada vez que se incrementa la versión.

## 3. Fuente única de verdad
Se estableció formalmente como fuente única:

`frontend/src/modules/system-update/version.js`

La variable `PANEL_VERSION` administra el número de versión y `CHANGELOG` administra el historial visible.

Los consumidores frontend deben importar estos valores en lugar de mantener números de versión duplicados.

El backend `backend/app/modules/system_update/router.py` ya consulta este mismo archivo mediante Git para obtener la versión local (`HEAD`) y remota (`origin/main`), por lo que no fue necesario duplicar la versión en otro archivo.

## 4. Cambio realizado
Se actualizó `version.js` a **1.0.86** y se documentó explícitamente la regla de que la versión debe modificarse únicamente allí.

Commit funcional:
`886317ce6fd0b565e70bda88ab7fe98e4bc2a9f2`

## 5. Backup de seguridad
Antes de modificar `version.js` se creó una copia exacta del archivo anterior:

`docs/backups/2026-09-08_1.0.85_version.js.bak`

Commit del backup:
`7839297dd84bb9472417e066bc1075f88eb84ff8`

El backup permite recuperar la versión anterior de forma directa si el cambio produce un problema.

## 6. Regla para futuras versiones
Para incrementar la versión manualmente:

1. Modificar únicamente `frontend/src/modules/system-update/version.js`.
2. Cambiar `PANEL_VERSION`.
3. Actualizar `CHANGELOG` con el cambio funcional.
4. Generar el build correspondiente.
5. Publicar el build mediante el sistema de actualización.
6. Verificar que el panel compare correctamente versión instalada contra `origin/main`.

No se debe introducir una segunda variable de versión en `UpdateCenter.jsx`, `Layout.jsx`, el backend u otros módulos.

## 7. Verificación arquitectónica
`backend/app/modules/system_update/router.py` contiene `VERSION_FILE = "frontend/src/modules/system-update/version.js"` y extrae `PANEL_VERSION` y `CHANGELOG` del archivo solicitado. Esto confirma que backend y frontend pueden trabajar sobre la misma fuente de versión.

## 8. Estado y pruebas pendientes
El cambio fue publicado en `main`. La compilación aislada y la prueba completa del flujo de actualización siguen siendo obligatorias antes de considerar cerrada la prueba de producción.

## 9. Historial inmediato
- **1.0.83** — consolidación de la restauración del aviso de eliminación.
- **1.0.85** — alerta roja modular de eliminación.
- **1.0.86** — centralización formal de la administración de versión en `version.js` y creación de backup previo.
