# Z-Hub 1.2.48 — Equipos, Etapa 3/4

## Objetivo
Completar la gestión operativa de los casos creados por la Etapa 2, sin integrar todavía movimientos automáticos con Almacén.

## Implementado
- El botón `Gestionar` abre un detalle operativo del caso.
- Responsable del caso y observaciones generales.
- Estados abiertos: `Pendiente`, `Contactado`, `Visita programada`.
- `Visita programada` exige fecha.
- Cada equipo se controla individualmente como `Pendiente`, `Recuperado` o `No recuperado`.
- Cada resultado individual admite observación.
- El `client_equipment` asociado refleja `recovery_pending`, `recovered` o `not_recovered`.
- Cuando todos los equipos quedan resueltos, el caso se cierra automáticamente: `recovered` solo si todos fueron recuperados; si existe algún no recuperado, el caso cierra `not_recovered`.
- Se conserva un historial operativo dentro del caso con cambios de estado y resolución de equipos.
- Casos cerrados se pueden consultar mediante `Ver detalle`, pero no reabrir silenciosamente.

## Compatibilidad y seguridad
- No se borra información existente.
- Casos creados en 1.2.47 siguen siendo compatibles; los equipos sin estado individual se interpretan como pendientes.
- No se mueve ni incrementa stock de Almacén.
- La integración con inventario queda reservada a Etapa 4/4.

## Backup
- Rama: `backup/pre-equipment-stage3-1.2.47-20260910`
- HEAD: `f343537f363b4af3e72540145680142cf483513e`

## Calidad
- Se agrega `backend/tests/test_equipment_stage3_contracts.py`.
- GitHub Actions ejecuta compilación Python, regresiones de mantenimiento, contratos de Etapas 2/3 y build React.

## Prueba pendiente en producción
Actualizar a 1.2.48 y usar el caso real validado en Etapa 2: asignar responsable, pasar a Contactado, programar visita y resolver el equipo. No se debe comprobar Almacén todavía porque esa integración no forma parte de esta versión.
