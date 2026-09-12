# Z-Hub 1.3.29 — Configuración de zona horaria

## Motivo

El servidor `z2` utiliza Debian 13 con `Etc/UTC` y MariaDB con `SYSTEM`, por lo que los timestamps generados por `NOW()` quedan en UTC. Para una instalación operada desde Perú esto producía una diferencia visible de cinco horas en el historial de AutomatizadoVIP.

## Respaldo previo

Antes de modificar el código se creó la rama:

`backup/pre-timezone-settings-20260912`

Apuntando al estado de `main` correspondiente a Z-Hub 1.3.28:

`1d39f3dd15777de940066bf1333ed4ac411cce87`

## Cambio implementado

- Se agrega `app_timezone` a `DEFAULT_SETTINGS`, con valor seguro `America/Lima`.
- `PUT /api/settings` valida la zona mediante `zoneinfo.ZoneInfo` antes de persistirla.
- Ajustes > Sistema ahora permite seleccionar una zona horaria por país y muestra la hora actual en esa zona.
- El selector incluye Perú, Colombia, Ecuador, Venezuela, Chile, Argentina, Brasil, México, Estados Unidos, España, Reino Unido y UTC.
- AutomatizadoVIP History interpreta un timestamp sin offset como UTC y lo presenta en la zona configurada.
- No se cambia la hora del servidor Debian ni la zona horaria global de MariaDB.
- No se realiza ninguna migración destructiva de la tabla `settings`; la preferencia se guarda en el JSON existente.

## Pruebas/validaciones previstas

- Contrato estático en `backend/tests/test_timezone_settings_contract.py`.
- Verificación del selector y persistencia desde Ajustes > Sistema.
- Verificación visual del historial AutomatizadoVIP con `America/Lima`: un registro generado a las 19:01 UTC debe mostrarse aproximadamente como 14:01.
- Verificación de cambio a otra zona y posterior regreso a `America/Lima`.

La prueba funcional del panel y el build de producción deben ejecutarse en el entorno de Z-Hub antes de declarar el despliegue productivo completado.
