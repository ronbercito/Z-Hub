# Continuidad MikroHub — 2026-09-08 — Feedback visual del botón Comprobar

## 1. Versión actual
La versión funcional publicada queda en **1.0.90**.

## 2. Solicitud
El usuario reportó que en la ventana **Actualizaciones** el botón **Comprobar** se veía estático y no daba una señal suficientemente clara de que el clic había sido recibido ni de que el sistema estaba buscando una actualización.

La captura de producción mostraba el panel instalado en **1.0.86** con el botón Comprobar sin feedback visible.

## 3. Revisión previa
Se revisó `frontend/src/modules/system-update/UpdateCenter.jsx` en `main`. El archivo ya contenía una primera implementación de estado `checking` con spinner, pulso y texto `Buscando actualización…`, correspondiente a 1.0.87/1.0.89. Sin embargo, el feedback podía ser demasiado breve cuando el servidor respondía rápidamente.

Por ello no se reemplazó el flujo de actualización ni la lógica de consulta. Se reforzó exclusivamente la señal visual y se aseguró una duración mínima del estado de comprobación.

## 4. Cambio realizado
Archivo modificado:

`frontend/src/modules/system-update/UpdateCenter.jsx`

Cambios:
- Se registra el instante de inicio de la comprobación.
- El estado `checking` permanece visible al menos **850 ms**, incluso si la respuesta HTTP llega inmediatamente.
- El botón muestra durante la búsqueda:
  - icono `RefreshCw` girando;
  - pulso visual;
  - resplandor cian;
  - ligera elevación visual;
  - texto `Buscando actualización…`;
  - puntos animados.
- Se mantiene el mensaje inferior indicando que MikroHub está consultando el servidor.
- El botón permanece deshabilitado durante la comprobación para impedir clics repetidos.
- No se modificó la lógica del endpoint `/system-update/status`.

Commit funcional:
`ce4ca639b522aeb29d896109aae36d002f574250`

## 5. Backup
Antes de modificar `UpdateCenter.jsx` se creó una copia exacta:

`docs/backups/2026-09-08_1.0.89_UpdateCenter.jsx.bak`

Commit del backup:
`ee8f70ff2c19d2841c32a6fe07e7d0ffdb335277`

También se creó backup del archivo de versión anterior:

`docs/backups/2026-09-08_1.0.89_version.js.bak`

Commit:
`e4131b5c7d263444900417bde9643061836feaeb`

## 6. Versionado
Se incrementó la única fuente de versión:

`frontend/src/modules/system-update/version.js`

De **1.0.89** a **1.0.90**.

Se agregó al changelog la mejora de feedback visual y la duración mínima de la comprobación.

Commit de versión:
`bb7152da22b3647c462ffcf3a0c53af315c9b4be`

## 7. Regla de centralización
Continúa vigente la regla establecida anteriormente:

`frontend/src/modules/system-update/version.js`

es la única fuente de verdad de `PANEL_VERSION` y `CHANGELOG`. No se deben duplicar números de versión en `UpdateCenter.jsx` ni en otros módulos.

## 8. Estado
La implementación quedó publicada en `main` como **1.0.90**.

El panel mostrado en la captura del usuario continúa indicando **1.0.86**, por lo que para visualizar esta mejora será necesario instalar/publicar el build correspondiente a 1.0.90 en el servidor de producción.

## 9. Pruebas obligatorias
Antes de considerar cerrada la prueba:
1. Ejecutar build aislado del frontend.
2. Instalar/publicar 1.0.90 mediante el flujo de actualización.
3. Abrir Actualizaciones.
4. Pulsar `Comprobar`.
5. Verificar que durante la consulta se vea claramente el giro del icono, pulso, brillo, elevación y puntos animados.
6. Verificar que aparezca el texto de consulta al servidor.
7. Verificar que no se puedan lanzar comprobaciones simultáneas.
8. Confirmar que después de la consulta el botón vuelva a `Comprobar` y que el resultado de versión disponible/no disponible siga siendo correcto.

## 10. Historial inmediato
- **1.0.83** — consolidación de la restauración del aviso de eliminación.
- **1.0.85** — alerta roja modular de eliminación.
- **1.0.86** — centralización de administración de versión y backup previo.
- **1.0.87** — primera implementación de feedback visual durante la comprobación manual.
- **1.0.89** — refuerzo inicial del feedback visual.
- **1.0.90** — feedback visual reforzado y duración mínima para que el clic sea perceptible.
