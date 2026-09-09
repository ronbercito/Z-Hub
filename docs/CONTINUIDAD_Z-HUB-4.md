# Z-Hub — Continuidad 4

## Versión actual

**PANEL_VERSION: 1.1.83**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Corrección de actualización — `zhub_backend` spawn error

Durante la actualización se confirmó que el frontend terminaba correctamente su build. El error aparecía al intentar reiniciar el proceso Supervisor del backend:

`zhub_backend: stopped`  
`zhub_backend: ERROR (spawn error)`

Se corrigió `deploy/supervisor/zhub_backend.conf.template` para ejecutar Uvicorn mediante el intérprete Python del entorno virtual:

`backend/venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2`

Esto evita depender de la resolución directa del ejecutable `venv/bin/uvicorn` y mantiene el mismo backend, puerto, host y número de workers.

### Alcance

- No se modificó la funcionalidad del Login.
- No se modificó la autenticación JWT.
- No se modificó la base de datos.
- No se modificó el frontend ni su proceso de compilación.
- El cambio afecta únicamente al comando de arranque del backend bajo Supervisor.

### Archivo actualizado

- `deploy/supervisor/zhub_backend.conf.template`

### Commit

- `bdb526c8adb8711188cee720a4a46322751017b9` — `fix: prevent supervisor backend spawn error`

### Validación recomendada en el servidor

Después de actualizar:

1. Recargar la configuración de Supervisor.
2. Reiniciar `zhub_backend`.
3. Confirmar que el estado sea `RUNNING`.
4. Revisar `/var/log/zhub_backend.err.log` si vuelve a fallar.
5. Confirmar que el panel pueda comunicarse nuevamente con el backend.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-5.md`, manteniendo la numeración secuencial y registrando la versión actual, modificaciones, seguridad, validaciones y commits correspondientes.
