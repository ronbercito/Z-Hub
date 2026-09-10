# Z-Hub 1.2.50 — Corrección de acciones en Recuperación

## Causa confirmada
Los casos creados automáticamente durante el retiro en Etapa 2 conservaron dentro de `equipment_data.items[].status` el estado técnico previo del equipo (`installed`, `assigned` o `recovery_pending`). La interfaz de Etapa 3 mostraba visualmente esos valores como `Pendiente`, pero los botones se renderizaban solamente cuando el valor literal era `pending`. Por eso el equipo aparecía como Pendiente sin las acciones `Recuperado` y `No recuperado`.

## Corrección
- `EquipmentRecovery.jsx` normaliza para la interfaz cualquier estado de equipo que no sea final (`recovered` / `not_recovered`) como `pending`.
- Vuelven a mostrarse el campo de observación y los botones `Recuperado` / `No recuperado` para casos existentes creados desde el retiro.
- Se conserva el endpoint individual ya implementado para resolver cada equipo.
- Al resolver el último equipo, el backend mantiene el cierre automático del caso.

## Compatibilidad
La corrección es compatible con los casos ya creados en 1.2.47, 1.2.48 y 1.2.49. No se eliminan ni transforman clientes, facturas, servicios, equipos o casos existentes.

## Almacén
Esta versión no mueve stock ni modifica Almacén. La integración de inventario continúa reservada a la Etapa 4/4.

## Backup
- Rama: `backup/pre-recovery-actions-fix-1.2.49-20260910`
- HEAD protegido: `31d0872b24387e9872e25ef3a10b855eb659ea79`
- Documento: `docs/backups/1.2.49/RECOVERY_ACTIONS_FIX_BACKUP.md`

## Calidad
Se agregó una regresión específica en `backend/tests/test_maintenance_contracts.py` para exigir que los estados heredados no finales mantengan visibles las acciones de resolución.

## Prueba pendiente en producción
Actualizar a 1.2.50, abrir el caso real en `Clientes → Recuperación → Gestionar`, confirmar que aparecen `Recuperado` y `No recuperado`, y resolver el equipo de prueba. No validar Almacén todavía.
