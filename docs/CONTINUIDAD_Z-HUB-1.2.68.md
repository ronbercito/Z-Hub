# Continuidad Z-Hub 1.2.68

Fecha: 2026-09-10
Estado: mejora funcional del Z-Hub License Center publicada en `main` para prueba en laboratorio.

## Objetivo
Reducir errores al crear licencias desde la web y automatizar clave, datos del cliente, capacidad por plan y vencimiento TRIAL.

## Cambios
- El License Server pasa a `APP_VERSION = 1.2.0`.
- Nueva generación de clave desde servidor con `GET /admin/licenses/generate-key`.
- Formato de clave: `ZHUB-AAAA-XXXXXXXX`, usando aleatoriedad criptográfica y comprobación contra SQLite antes de devolverla.
- La clave queda de solo lectura en el formulario y puede regenerarse antes de guardar.
- Al seleccionar Cliente / ISP se completan Titular y Correo desde la ficha del cliente; siguen siendo editables.
- Planes comerciales normalizados: `PLAN_100`, `PLAN_300`, `PLAN_500`, `PLAN_1000`, `ILIMITADO`.
- La capacidad se deriva en backend del plan: 100, 300, 500, 1000 o `NULL` para ilimitado. La web refleja el mismo valor y bloquea edición manual de capacidad.
- Tipos de licencia: `PAID` y `TRIAL`.
- Una licencia TRIAL nueva recibe `expires_at` automáticamente a 30 días. El número de días es configurable mediante `ZHUB_LICENSE_TRIAL_DAYS`, con 30 por defecto.
- La validación remota rechaza TRIAL vencidas con `TRIAL_EXPIRED`.
- El JWT de una TRIAL no puede extender su `grace_until` más allá de `expires_at`.
- Estados comerciales visibles de licencia: `ACTIVA`, `SUSPENDIDA`, `REVOCADA`.
- El listado de licencias muestra tipo y vencimiento.
- Migración no destructiva: se agrega `licenses.expires_at` si no existe; no se borra ni reinicializa SQLite.

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/app.js`
- `license_server/env.example`
- `backend/tests/test_license_center_web_contract.py`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_Z-HUB-1.2.68.md`

## Backup previo
Rama: `backup/pre-license-center-automation-1.2.68-20260910`.

## Pruebas locales realizadas antes de publicar
- `python3 -m py_compile` sobre la versión preparada de `license_server/app/main.py`: OK.
- `node --check` sobre la versión preparada de `license_server/static/app.js`: OK.

## Pruebas automáticas
GitHub Actions debe validar compilación Python, contratos pytest y build React sobre el HEAD final de esta entrega. No declarar CI aprobada hasta comprobar conclusión `success`.

## Prueba de laboratorio pendiente
En `web-licencia`:
1. `git pull origin main`.
2. Reiniciar Uvicorn/servicio.
3. Confirmar `/health` con License Server `1.2.0`.
4. Abrir `/admin-ui`.
5. Crear una licencia PAID comprobando clave automática, autocompletado del cliente y capacidad por plan.
6. Crear una licencia TRIAL y confirmar `expires_at`.
7. Autorizar una instalación y validar el flujo `/v1/licenses/validate`.
8. Probar suspensión, reactivación y revocación.

## Compatibilidad y seguridad
- No se modifica la clave privada RS256 ni se publica en GitHub.
- El token administrativo sigue fuera del repositorio.
- MikroTik, OLT y operación ISP siguen locales; el VPS administra únicamente licenciamiento.
- La base existente se conserva.
