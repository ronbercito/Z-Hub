# Z-Hub 1.2.47 — Equipos, Etapa 2/4

## Objetivo
Integrar el retiro de un abonado con los equipos físicos asignados cuando el módulo opcional de Recuperación está activado, sin tocar Almacén ni alterar el retiro cuando la función está desactivada.

## Implementado
- Vista previa `GET /api/clients/{client_id}/retirement-equipment-preview`.
- El modal `Retirar cliente` consulta y muestra los equipos de propiedad de la empresa que siguen instalados/asignados.
- Si existen equipos pendientes, el botón cambia a `Retirar y crear recuperación`.
- Al confirmar el retiro se crea automáticamente un caso `pending` en `equipment_recoveries` con el detalle de cada equipo.
- Cada `client_equipment` involucrado pasa a `recovery_pending`.
- Se evita crear otro caso si el cliente ya posee una recuperación abierta.
- El Log del cliente registra cuántos equipos quedaron enviados a Recuperación.
- La API de Recuperación respeta `client_equipment_recovery_enabled` y usa los equipos asignados antes de recurrir a la ficha técnica histórica.

## Compatibilidad
- Con `client_equipment_recovery_enabled = false`, el retiro conserva el comportamiento anterior.
- Si el módulo está activo pero el cliente no tiene equipos de la empresa asignados, no se crea caso automático.
- No se mueve stock de Almacén.
- No se marca ningún equipo como recuperado.
- No se elimina información histórica del cliente.

## Backup
- Rama: `backup/pre-equipment-stage2-1.2.46-20260910`
- HEAD respaldado: `5a7199d34ee7c5f268ee9e59e8e1ca8426d62ef4`
- Registro: `docs/backups/1.2.46/EQUIPMENT_STAGE2_BACKUP.md`

## Calidad
Se agregó `backend/tests/test_equipment_stage2_contracts.py` y el workflow de GitHub Actions fue ampliado para ejecutarlo junto con las regresiones de mantenimiento.

## Prueba pendiente en producción
Actualizar a 1.2.47, asignar un equipo de empresa a un cliente de prueba, abrir Retirar cliente sin confirmar para verificar la advertencia y, solo con un cliente de prueba, confirmar el retiro para comprobar la creación del caso en Clientes → Recuperación.
