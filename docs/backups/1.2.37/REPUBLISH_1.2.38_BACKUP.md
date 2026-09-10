# Backup previo a Z-Hub 1.2.38

Fecha: 2026-09-10

Antes de republicar el saneamiento como 1.2.38 se preservó el estado completo de 1.2.37 en la rama:

`backup/pre-republish-1.2.37-20260910`

Commit exacto respaldado:

`8abd0aaccd422c10ba4d101758ba88a15447936d`

Archivo de versión previo:
- `frontend/src/modules/system-update/version.js`
- blob 1.2.37: `78f597783d6f2d9c933bf388f404ffce7ddbf0b3`

Bitácora previa:
- `docs/CONTINUIDAD_Z-HUB-v1.2.md`
- blob: `78aef4cce526785a4e15128992899a7952866042`

Objetivo de 1.2.38: republicar el mismo saneamiento y correcciones de 1.2.37 con un número de versión nuevo para que el Centro de Actualizaciones lo detecte nuevamente. No se reinicializa ni se borra la base de datos.
