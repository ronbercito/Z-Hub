# Z-Hub 1.2.59 — Licencias Etapa 3/7: límite real de abonados

## Objetivo
Conectar el License Manager local de la Etapa 2 al flujo real de alta de abonados para que una licencia con capacidad finita no pueda superar el máximo contratado.

## Implementación
- Nuevo `backend/app/core/license_guard.py`.
- El CRUD principal de Clientes recibe la dependencia `enforce_client_capacity` desde `backend/server.py`.
- `POST /api/clients` verifica capacidad antes de iniciar el aprovisionamiento del abonado.
- La reactivación de un cliente con estado `retired` también verifica capacidad porque ese registro vuelve a consumir un cupo.
- Los `PUT` de clientes que ya consumen cupo continúan permitidos y no quedan bloqueados por haber alcanzado el máximo.

## Comportamiento al alcanzar el límite
Ejemplo: licencia 200 con consumo 200/200.

- Se rechaza un nuevo `POST /api/clients` con HTTP 409.
- Código: `CLIENT_LIMIT_REACHED`.
- El mensaje informa límite contratado y consumo actual.
- Se mantienen disponibles edición, cobros, facturación, suspensión, reconexión, MikroTik, OLT y demás operaciones de abonados existentes.
- No se elimina ni modifica ningún dato.
- Si posteriormente la licencia aumenta su `max_clients`, el alta vuelve a quedar disponible sin reinstalar Z-Hub.

## Respuesta de error
El backend entrega el texto amigable en `detail` para conservar compatibilidad con la pantalla actual de Clientes y agrega cabeceras:

- `X-ZHub-Error-Code: CLIENT_LIMIT_REACHED`
- `X-ZHub-Client-Usage`
- `X-ZHub-Client-Limit`

La pantalla existente de Clientes ya muestra los errores `detail` de tipo string mediante `toast.error`, por lo que el usuario recibe el aviso sin necesidad de cambiar el formulario en esta etapa.

## Trial
La Etapa 3 no aplica la política de expiración del Trial. Esa política permanece reservada para la Etapa 5/7. El control actual se limita a licencias activas con `max_clients` finito.

## Seguridad de datos
- No se elimina ni modifica ningún cliente existente al alcanzar el límite.
- No se modifica MariaDB con nuevas columnas o tablas.
- No se cambia el aprovisionamiento MikroTik salvo que el guard permita el alta.
- El guard se ejecuta antes del handler de creación, por lo que un alta rechazada por capacidad no llega al aprovisionamiento.

## Backup
- Rama: `backup/pre-license-stage3-1.2.58-20260910`
- Commit protegido: `c5b6ebba9a2e21b563691577fc00847459186ebd`
- Registro: `docs/backups/1.2.58/LICENSE_STAGE3_BACKUP.md`

## Calidad
Se agrega `backend/tests/test_license_stage3_contract.py` al workflow `Z-Hub Quality`. Los contratos comprueban el código de error, el guard de alta, la reactivación de retirados, la integración en `server.py`, la visualización del `detail` existente y la separación de la política Trial.

## Versión
`PANEL_VERSION` pasa de `1.2.58` a `1.2.59`.

## Prueba recomendada en instalación real
1. Actualizar Z-Hub a 1.2.59.
2. Confirmar funcionamiento normal con la licencia heredada actual (ilimitada por compatibilidad).
3. Cuando se prepare una licencia de prueba con capacidad finita, verificar N-1, N/N y rechazo de N+1.
4. Dar de baja un abonado (`retired`) y confirmar que se libera un cupo.
5. Con el límite lleno, intentar reactivar un retirado y confirmar que se rechaza hasta liberar/ampliar capacidad.

## Siguiente etapa
Etapa 4/7 — interfaz de Licencia Z-Hub en Ajustes: plan, estado, uso, disponibles, barra de progreso y presentación específica para Trial/Ilimitado.