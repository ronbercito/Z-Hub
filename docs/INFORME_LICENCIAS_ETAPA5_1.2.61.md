# Z-Hub 1.2.61 — Licencias Etapa 5/7: Trial de 30 días

## Objetivo
Completar el comportamiento local del Trial antes de conectar Z-Hub con el futuro servidor de licencias.

## Implementación
- Trial real de 30 días desde `license_activated_at`.
- Cálculo de fecha de inicio, fecha de fin, días restantes y nivel de aviso.
- Avisos visuales cuando restan 7, 3 y 1 día.
- Al vencer el Trial, la instalación conserva todos sus datos y pasa a modo consulta.
- GET y autenticación continúan disponibles.
- POST/PUT/PATCH/DELETE de operación quedan bloqueados con `TRIAL_EXPIRED`.
- Se mantienen habilitados login, logout, activación de licencia, setup y actualización del sistema para recuperación.
- El administrador puede convertir Trial a licencia pagada desde Ajustes → Licencia Z-Hub sin reinstalar.
- La activación local solo acepta claves pagadas activas del registro local; la Etapa 6 reemplazará esta fuente por el License Server.

## Corrección incluida de Etapa 4
Se corrigió el falso estado `LICENCIA NO VÁLIDA` observado en una instalación ya activada. Si una clave desaparece del archivo fallback durante una actualización pero Z-Hub conserva un snapshot normalizado (`license_type` + `license_plan`), la instalación permanece activa. Si la clave sí está presente y su `ESTADO` es distinto de `ACTIVA`, continúa invalidándose.

## Seguridad y datos
- No se elimina ningún cliente, factura, equipo, configuración ni historial al vencer el Trial.
- El modo consulta se aplica como dependencia global de `/api` para evitar que una pantalla omita la protección.
- La activación pagada requiere rol `admin`.
- Las licencias pagadas siguen sin fecha de vencimiento.
- Los límites de abonados de Etapa 3 permanecen independientes del vencimiento Trial.

## Backup
Antes de los cambios se creó:

`backup/pre-license-stage5-1.2.60-20260910`

## Archivos principales
- `backend/app/core/license_manager.py`
- `backend/app/core/license_guard.py`
- `backend/app/routers/license/router.py`
- `backend/server.py`
- `frontend/src/modules/ajustes/LicenseSettings.jsx`
- `frontend/src/modules/ajustes/license-settings.css`
- `backend/tests/test_license_stage5_contract.py`
- `.github/workflows/quality.yml`
- `frontend/src/modules/system-update/version.js`

## Estado
Etapa 5/7 implementada localmente. La siguiente etapa es 6/7: License Server remoto por HTTPS, caché/continuidad local y eliminación de GitHub como fuente de licencias de producción.
