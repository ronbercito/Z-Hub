# Z-Hub — Continuidad 4

## Versión actual

**PANEL_VERSION: 1.1.84**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualizaciones registradas — 2026-09-09

### Corrección de actualización — `zhub_backend` spawn error

Durante la actualización se confirmó que el frontend terminaba correctamente su build. El error aparecía al intentar reiniciar el proceso Supervisor del backend:

`zhub_backend: stopped`  
`zhub_backend: ERROR (spawn error)`

Se corrigió `deploy/supervisor/zhub_backend.conf.template` para ejecutar Uvicorn mediante el intérprete Python del entorno virtual:

`backend/venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2`

Esto evita depender de la resolución directa del ejecutable `venv/bin/uvicorn` y mantiene el mismo backend, puerto, host y número de workers.

### Recuperación de Google Maps en Ajustes

La configuración de Google Maps ya existía en `Settings.jsx`, incluyendo `google_maps_api_key`, pero el acceso debía quedar disponible de forma explícita dentro del submenú Ajustes.

Se mantiene la sección:

`Google Maps y APIs`

Al seleccionarla, Z-Hub abre la configuración de **Google Maps** para introducir y guardar la clave de **Maps JavaScript API**. El acceso usa el mismo módulo de permisos de Ajustes y el icono del submenú identifica visualmente Google Maps.

No se modificó la lógica de carga de mapas ni la estructura de la clave existente.

### Archivos relacionados

- `frontend/src/modules/ajustes/navigation/settingsSections.js`
- `frontend/src/modules/ajustes/staff/permissions.js`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/ajustes/Settings.jsx` (configuración Google Maps existente, sin cambios funcionales)
- `frontend/src/modules/system-update/version.js`
- `deploy/supervisor/zhub_backend.conf.template`

### Commits de esta continuidad

- `bdb526c8adb8711188cee720a4a46322751017b9` — `fix: prevent supervisor backend spawn error`
- `ef4bd0b17cd3cae384a7f3ade1722649cd0a3262` — `fix: allow Google Maps settings submenu`
- `9d880e128509227c7564d648b630be2d6ab3f4c4` — `ui: show Google Maps icon in settings submenu`
- `ccc7b9a0c30d8d68a2f9f3590633f82bc61801dc` — `chore: bump panel version to 1.1.84`

### Validación recomendada en el servidor

Después de actualizar:

1. Recargar la configuración de Supervisor.
2. Confirmar que `zhub_backend` quede en `RUNNING`.
3. Abrir **Ajustes → Google Maps y APIs**.
4. Introducir la clave de Maps JavaScript API y guardar.
5. Confirmar que el mapa de clientes y el selector de coordenadas continúen cargando correctamente.
6. Revisar `/var/log/zhub_backend.err.log` si vuelve a aparecer un error de backend.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-5.md`, manteniendo la numeración secuencial y registrando la versión actual, modificaciones, seguridad, validaciones y commits correspondientes.
