# Z-Hub — Continuidad 6

## Versión actual

**PANEL_VERSION: 1.1.86**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Ventana de Actualizaciones con desplazamiento vertical

Se corrigió la ventana modal de **Actualizaciones** para que pueda mostrar changelogs largos sin obligar al usuario a reducir el zoom del navegador.

La ventana conserva un tamaño máximo adaptado a la altura disponible y el propio contenido de la ventana obtiene desplazamiento vertical mediante `overflow-y-auto`. De esta manera, cuando el changelog supera el espacio visible, el usuario puede recorrerlo hasta el final con la barra de desplazamiento.

### Alcance

- El changelog completo continúa cargándose desde `status.remote.changelog`.
- No se limita ni recorta la cantidad de cambios mostrados.
- La ventana se adapta a la altura disponible de la pantalla.
- Se mantiene el funcionamiento de comprobación, instalación, progreso, rollback y cierre de sesión.
- No se modifican rutas, permisos ni autenticación.
- No se modifica la lógica del backend de actualizaciones.

### Archivos actualizados

- `frontend/src/modules/system-update/UpdateCenter.jsx`
- `frontend/src/modules/system-update/version.js`

### Commits

- `b5a0ab8b0c09891ef6f1b44952b7aaa87db335c2` — `fix: make update changelog scrollable`
- `791d5f3563ed8d6c4f9dcc469775ef925e5142f2` — `chore: bump panel version to 1.1.86`

### Validación recomendada en el servidor

Después de actualizar:

1. Actualizar Z-Hub a la versión **1.1.86**.
2. Abrir la ventana **Actualizaciones**.
3. Cuando exista un changelog largo, confirmar que la ventana no obligue a reducir el zoom.
4. Usar la barra de desplazamiento del modal para llegar a los últimos cambios.
5. Confirmar que los botones **Comprobar** y **Actualizar** continúen accesibles.
6. Confirmar que comprobación, instalación y progreso sigan funcionando igual.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-7.md`, manteniendo la numeración secuencial y registrando versión, modificaciones, seguridad, validaciones y commits correspondientes.
