# Z-Hub 1.2.65 — Hotfix real del fallback de licencia en runtime

## Problema confirmado
Después de instalar 1.2.63 y 1.2.64, una instalación podía seguir mostrando simultáneamente `LICENCIA NO VÁLIDA` y datos de una licencia pagada/ilimitada.

La causa estructural estaba en el despliegue: el motor de licencias usaba como fallback `licencia/licencias.txt`, pero `deploy/install.sh` copia ese archivo al registro privado y luego elimina el directorio `licencia` del árbol instalado. Por tanto, después de una instalación o actualización, el fallback esperado por `license_manager.py` ya no existía en runtime.

## Corrección 1.2.65
- Se agrega `backend/app/core/license_fallback.txt` como catálogo de compatibilidad empaquetado con el backend.
- `license_manager.py` deja de depender del directorio `licencia` eliminado por el instalador.
- El fallback empaquetado permanece disponible después de cada actualización.
- El registro privado `/etc/zhub/licencia/licencias.txt` conserva prioridad cuando define la misma clave.
- Estados privados explícitos `INACTIVA`, `SUSPENDIDA` o equivalentes continúan bloqueando la licencia.
- La clave histórica `ZHUB-2026-DEMO-002` está incluida como `ACTIVA` en el fallback de compatibilidad.

## Backup
Antes del cambio funcional se creó la rama:

`backup/pre-license-runtime-fallback-1.2.65-20260910`

apuntando al estado de `main` previo al hotfix funcional.

## Archivos
- `backend/app/core/license_fallback.txt`
- `backend/app/core/license_manager.py`
- `backend/tests/test_license_runtime_fallback_contract.py`
- `frontend/src/modules/system-update/version.js`

## Validación
Se agregó contrato automatizado para comprobar que:
1. El fallback empaquetado existe.
2. Contiene la clave histórica `ZHUB-2026-DEMO-002` activa.
3. `license_manager.py` lee el fallback empaquetado.
4. El motor ya no usa como fallback runtime la ruta eliminada `licencia/licencias.txt`.

La validación final en servidor requiere actualizar a 1.2.65, reiniciar el backend mediante el actualizador y abrir `Ajustes → Licencia Z-Hub`. Una instalación con la clave `...002` que no esté expresamente suspendida/inactiva en el registro privado debe mostrar `LICENCIA ACTIVA`.

## Estado de etapas
Este hotfix no inicia la Etapa 6/7. Continúa cerrando la transición local de la Etapa 5 antes de conectar el License Server.
