# Continuidad Z-Hub 1.2.70

Fecha: 2026-09-10

## Objetivo
Corregir el comportamiento de las licencias TRIAL del License Center para que no hereden la capacidad del plan comercial seleccionado.

## Cambios
- Toda licencia `TRIAL` queda limitada a **20 abonados**.
- El límite se aplica en la interfaz y también en el backend; no depende del valor enviado por el navegador.
- Al seleccionar `TRIAL`, el plan pasa automáticamente a `TRIAL` y el selector comercial queda bloqueado.
- La interfaz muestra el mensaje: `TRIAL: máximo 20 abonados y vencimiento automático a los 30 días.`
- El vencimiento sigue siendo automático a los 30 días mediante `expires_at`.
- Las licencias `PAID` continúan usando `PLAN_100`, `PLAN_300`, `PLAN_500`, `PLAN_1000` e `ILIMITADO`.
- El generador del backend queda alineado con el formato largo de 192 bits usando `secrets.token_hex(24)`.
- License Server pasa a versión interna `1.2.1`.
- Panel Z-Hub pasa a `1.2.70`.

## Seguridad
El servidor fuerza `max_clients=20` para `TRIAL`, por lo que una petición manual a la API no puede elevar la capacidad de prueba indicando otro plan o otro máximo.

## Compatibilidad
No se borra ni reinicializa SQLite. Las licencias existentes permanecen almacenadas. El cambio afecta la creación/edición de licencias TRIAL y las nuevas claves generadas.

## Backup previo
`backup/pre-trial-limit-1.2.70-20260910`

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/app.js`
- `backend/tests/test_license_center_web_contract.py`
- `frontend/src/modules/system-update/version.js`

## Pruebas
Se actualizaron los contratos para verificar:
- `TRIAL_MAX_CLIENTS = 20`;
- servidor fuerza plan/capacidad TRIAL;
- UI contiene `TRIAL:20` y el texto de máximo 20 abonados;
- generador usa 24 bytes aleatorios / 48 caracteres hexadecimales;
- versión `1.2.70`.

La ejecución completa de GitHub Actions debe verificarse antes de considerar cerrada la validación automática.
