# Continuidad MikroHub — 2026-09-08 — Feedback visual al comprobar actualizaciones

## 1. Versión actual
La versión funcional publicada queda en **1.0.87**.

## 2. Solicitud
El usuario reportó que en la ventana **Actualizaciones**, el botón **Comprobar** se veía estático y, al hacer clic, no había una señal visual clara de que la consulta hubiera sido recibida o estuviera buscando una nueva versión.

## 3. Diagnóstico
`frontend/src/modules/system-update/UpdateCenter.jsx` ejecutaba `check()` directamente al hacer clic, pero el botón solo cambiaba a estado deshabilitado durante la petición y mantenía el texto **Comprobar**. Esto hacía poco evidente que la acción estaba en curso.

## 4. Cambio realizado
Se agregó un estado independiente `checking` para representar visualmente una consulta de actualización en curso.

Durante la comprobación:
- el botón queda temporalmente deshabilitado para evitar clics duplicados;
- el icono `RefreshCw` gira con `animate-spin`;
- el botón cambia visualmente con `animate-pulse`;
- el texto cambia de **Comprobar** a **Buscando actualización…**;
- aparece debajo un mensaje: **Consultando el servidor y verificando si existe una nueva versión…**;
- se agrega transición y reducción visual al pulsar (`active:scale-95`) para confirmar la interacción.

Al terminar la petición, correctamente o con error, `checking` vuelve a `false` y la interfaz recupera su estado normal.

## 5. Archivo funcional modificado
`frontend/src/modules/system-update/UpdateCenter.jsx`

Commit:
`9a2ea9d670f76589b1ed40e1649341dde951fc34`

## 6. Backup previo
Antes de modificar el archivo se creó una copia exacta:

`docs/backups/2026-09-08_1.0.86_UpdateCenter.jsx.bak`

Commit del backup:
`3b2599d91cf6d48c8807009c3a33d3d74375b5c4`

## 7. Versionado
Se incrementó la versión mediante la única fuente de verdad:

`frontend/src/modules/system-update/version.js`

Nueva versión:
`1.0.87`

El changelog registra el feedback visual del botón Comprobar y mantiene la regla de centralización de versión.

Commit de versión:
`3527f3a86752234313aadd7458beb37067b12e14`

## 8. Regla arquitectónica conservada
La versión continúa administrándose únicamente desde `version.js`. No se agregó ningún número de versión duplicado en `UpdateCenter.jsx` ni en otros módulos.

## 9. Estado
Los cambios fueron publicados en `main`.

## 10. Pruebas obligatorias antes de producción
1. Ejecutar build aislado del frontend.
2. Abrir Actualizaciones.
3. Pulsar **Comprobar**.
4. Confirmar que el clic produce feedback inmediato.
5. Confirmar que el icono gira y el texto cambia a **Buscando actualización…**.
6. Confirmar que el mensaje inferior aparece mientras dura la consulta.
7. Confirmar que el botón vuelve a **Comprobar** al finalizar.
8. Confirmar que un error de API también libera el estado `checking`.
9. Confirmar que no se modificó el comportamiento de **Actualizar**.
10. Confirmar que la versión mostrada corresponde a **1.0.87**.

## 11. Historial inmediato
- **1.0.83** — consolidación de restauración del aviso de eliminación.
- **1.0.85** — alerta roja modular de eliminación.
- **1.0.86** — centralización formal de la administración de versión en `version.js` y backup previo.
- **1.0.87** — feedback visual durante la comprobación manual de actualizaciones y backup previo de `UpdateCenter.jsx`.
