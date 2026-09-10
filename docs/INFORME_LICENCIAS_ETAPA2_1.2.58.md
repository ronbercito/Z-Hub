# Z-Hub 1.2.58 — Licencias Etapa 2/7: License Manager local

## Objetivo
Crear una única capa interna de licencias para Z-Hub Self-Hosted antes de aplicar límites de abonados y antes de conectar el futuro License Server.

## Implementación
- Nuevo `backend/app/core/license_manager.py`.
- El Install Wizard deja de mantener un parser propio de licencias y consulta el License Manager.
- Se agregan metadatos normalizados en `system_config`: `license_type`, `license_plan`, `license_max_clients` y `license_activated_at`.
- Se definen capacidades `PLAN_100`, `PLAN_200`, `PLAN_800`, `PLAN_1000` y `UNLIMITED`.
- Trial queda definido a 30 días, acceso completo y sin límite de abonados.
- Las licencias históricas sin PLAN/MAX_CLIENTS se interpretan como pagadas e ilimitadas para no reducir capacidad al actualizar.

## Conteo de abonados
El motor incorpora `get_client_usage()` y cuenta todos los registros de Cliente salvo `status=retired`, que representa la baja definitiva actual y libera capacidad.

Esto implica que `active`, `suspended`, `paused` y `pending_install` consumen cupo mientras sigan registrados. Los conceptos comerciales MOROSO/CORTADO no se crean como estados nuevos de base de datos en esta etapa.

## Interfaz interna disponible
- `get_license_record()`
- `get_license()`
- `get_status()`
- `get_client_limit()`
- `get_client_usage()`
- `can_create_client()`
- `is_trial()`
- `trial_days_remaining()`
- `apply_license_metadata()`

## Alcance de esta etapa
La Etapa 2 prepara la decisión `can_create_client()`, pero deliberadamente NO la conecta todavía a `POST /api/clients`.

El error `CLIENT_LIMIT_REACHED`, el bloqueo real de creación y el mensaje visual pertenecen a la Etapa 3/7.

## Compatibilidad
- No se elimina ni modifica ningún cliente existente.
- No se altera MikroTik, OLT, Facturación, NAP, inventario ni recuperación.
- No se requiere migración de columnas porque los metadatos de licencia continúan dentro del JSON `settings.data`.
- El fallback de `licencia/licencias.txt` continúa temporalmente por compatibilidad; su sustitución productiva está prevista para la Etapa 6.

## Backup
- Rama: `backup/pre-license-stage2-1.2.57-20260910`
- HEAD protegido: `dfc79ba15737a8d675f32d9ff02a5b6cb1de2955`
- Registro: `docs/backups/1.2.57/LICENSE_STAGE2_BACKUP.md`

## Calidad
Se agrega `backend/tests/test_license_stage2_contract.py` al workflow `Z-Hub Quality` para validar contrato de planes, compatibilidad de licencias heredadas, integración del Setup y separación explícita respecto de la Etapa 3.

## Versión
`PANEL_VERSION` pasa de `1.2.57` a `1.2.58` por tratarse de un cambio funcional de backend.

## Siguiente etapa
Etapa 3/7 — aplicar el límite real en todos los flujos capaces de crear abonados, devolver `CLIENT_LIMIT_REACHED` y conservar operación normal de los clientes existentes.
