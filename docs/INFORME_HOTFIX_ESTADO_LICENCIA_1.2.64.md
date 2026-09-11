# Z-Hub 1.2.64 — Hotfix real de estado de licencia persistida

## Problema observado
Después de instalar 1.2.63, una instalación seguía mostrando simultáneamente `LICENCIA NO VÁLIDA` y los metadatos de una licencia pagada ilimitada ya activada. Esto demostraba que la combinación fallback/registro privado de 1.2.63 no cubría todos los formatos históricos de estado existentes en instalaciones actualizadas.

## Causa
El motor consideraba inválida cualquier fila cuyo `ESTADO` no fuera exactamente `ACTIVA`. Una instalación antigua puede conservar variantes históricas como `ACTIVO`, `ACTIVE`, `VALIDA`/`VÁLIDA` o un valor legado no reconocido, mientras la base de datos conserva correctamente el snapshot de una licencia pagada (`license_key`, `license_type`, `license_plan`). Ese desacuerdo producía el estado visual contradictorio y también podía bloquear operaciones que dependen de `get_status()`.

## Corrección 1.2.64
- Se normalizan como activas las variantes `ACTIVA`, `ACTIVO`, `ACTIVE`, `VALIDA` y `VÁLIDA`.
- Se separan explícitamente los estados bloqueados: `INACTIVA`, `SUSPENDIDA` y equivalentes siguen invalidando la licencia y prevalecen sobre cualquier snapshot anterior.
- Si el registro devuelve un estado legado desconocido, una instalación que ya posee un snapshot válido de licencia pagada/TRIAL permanece activa durante la transición a Etapa 6.
- El mismo estado desconocido NO permite activar una licencia nueva si no existe snapshot persistido.
- `get_license_record()` continúa aceptando únicamente estados reconocidos como activos para nuevas activaciones.
- `can_create_client()` utiliza el mismo `get_status()`, por lo que la corrección no es solo visual: también evita bloquear erróneamente una licencia pagada ya activada.

## Seguridad
Una clave marcada explícitamente como `INACTIVA`, `SUSPENDIDA`, `INACTIVE`, `SUSPENDED`, `REVOCADA` o equivalente continúa bloqueada. El fallback no puede reactivarla.

## Backup
Antes de modificar el motor se creó la rama:

`backup/pre-license-status-hotfix-1.2.64-20260910`

Base protegida: commit `57f0c312e9b84186dea95bb939ff6e61051f543e` (estado 1.2.63 previo al hotfix).

## Archivos modificados
- `backend/app/core/license_manager.py`
- `backend/tests/test_license_status_hotfix_contract.py`
- `frontend/src/modules/system-update/version.js`

## Pruebas incorporadas
El contrato automático verifica:
- combinación fallback + registro privado;
- prioridad de estados bloqueados;
- normalización de variantes activas históricas;
- fallback al snapshot persistido únicamente cuando no existe bloqueo explícito;
- versión 1.2.64 y changelog correspondiente.

## Validación pendiente en servidor real
1. Actualizar desde 1.2.63 a 1.2.64.
2. Abrir Ajustes → Licencia Z-Hub.
3. Confirmar que la instalación pagada ilimitada muestre `LICENCIA ACTIVA`.
4. Confirmar que Capacidad permanezca `Ilimitada` y Disponibles `Sin límite`.
5. Probar alta de un abonado para confirmar que `can_create_client()` ya no queda bloqueado por el falso estado.
6. No continuar a Etapa 6 hasta confirmar este flujo en la instalación real.

## Versión
Z-Hub 1.2.64.
