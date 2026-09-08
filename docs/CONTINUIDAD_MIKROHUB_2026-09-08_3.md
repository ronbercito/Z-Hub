# Continuidad MikroHub — 2026-09-08 — corrección 1.0.67

## 1. Problema detectado
Durante la prueba aislada del build de `origin/main` se confirmó que la actualización fallaba en la compilación de React por un error JSX en `frontend/src/modules/clientes/editor/ClientBilling.jsx`.

Error reportado:
`Expected corresponding JSX closing tag for <Field>. (74:3407)`

El campo `Recordatorio #3` abría `<Field>` pero cerraba directamente el contenedor `</div>` sin cerrar primero `</Field>`.

## 2. Corrección realizada
Archivo funcional modificado:
- `frontend/src/modules/clientes/editor/ClientBilling.jsx`

Corrección:
- se añadió el `</Field>` faltante después del input de `Recordatorio #3`.
- se conservaron las acciones de factura agregadas en la ficha del cliente: editar, ver documento, eliminar, anular, enviar y pagar.

## 3. Versión
- Nueva versión funcional: **1.0.67**
- Archivo: `frontend/src/modules/system-update/version.js`
- Changelog actualizado con la corrección del JSX.

## 4. Commits
- Corrección `ClientBilling.jsx`: `00b91d516f656fdd74f6574f93cfa879592cb813`
- Versión 1.0.67: `53ad105aa7662eb59b510451c2b05c64b711eb99`
- Continuidad de la corrección: `51f631e` (commit de documentación)

## 5. Estado de producción
El servidor de producción fue actualizado correctamente desde el Centro de Actualizaciones después de verificar el build de 1.0.67.

## 6. Verificación realizada
En el worktree aislado `/tmp/mikrohub-build-debug` se ejecutó una instalación limpia de dependencias y el build de producción.

Resultado:
- `yarn install --network-timeout 100000` → correcto.
- `DISABLE_ESLINT_PLUGIN=true CI= yarn build` → `Compiled successfully`.
- El mensaje `Cannot find ESLint plugin (ESLintWebpackPlugin).` apareció como aviso no fatal; el build terminó correctamente.

## 7. Nueva política prioritaria
Se agregó el archivo interno:

`docs/POLITICA_PRIORITARIA_ERRORES_ACTUALIZACION.md`

Regla obligatoria para futuras actualizaciones: si un update falla, **primero se debe revisar exactamente lo modificado y buscar un error introducido por el cambio antes de repetir el update**. También se debe seguir la cadena completa de la funcionalidad y comparar el código nuevo con otras implementaciones existentes que hagan la misma llamada, recepción o envío.

No se debe repetir una actualización fallida a ciegas ni asumir de inmediato que el problema es Yarn, Node, ESLint, caché o servidor sin revisar primero el código modificado.

## 8. Regla de continuidad
Esta documentación es interna y no forma parte del build ni debe importarse desde el panel. Las modificaciones funcionales futuras deben incrementar `PANEL_VERSION` y registrar el cambio aquí o en el documento maestro de continuidad.

La nueva política es documental y **no incrementa `PANEL_VERSION`**.
