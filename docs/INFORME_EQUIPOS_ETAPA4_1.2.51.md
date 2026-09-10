# Z-Hub 1.2.51 — Etapa 4/4: retorno seguro a Almacén

## Objetivo
Cerrar el flujo de Recuperación permitiendo que un equipo físicamente recuperado vuelva a Almacén con trazabilidad y sin incrementar stock por coincidencias aproximadas.

## Backup previo
- Rama: `backup/pre-equipment-stage4-1.2.50-20260910`
- HEAD protegido: `82104975f7ff72186ea802078f386cf39ea5fa00`
- Corresponde a la 1.2.50 validada visualmente en producción antes de iniciar Etapa 4.

## Flujo implementado
1. Un equipo debe estar primero en estado `recovered`.
2. En `Clientes → Recuperación → Ver detalle` aparece `Enviar a Almacén`.
3. El operador selecciona destino: `Disponible para reutilizar`, `En revisión`, `Averiado` o `Baja`.
4. Z-Hub busca coincidencias exactas por Serial/MAC.
5. Si existe una coincidencia exacta, debe usarse ese registro; una selección que no coincida exactamente es rechazada por backend.
6. Si no existe coincidencia exacta, puede crearse un registro nuevo controlado con ese Serial/MAC.
7. El retorno queda registrado en el equipo del caso y en el historial de recuperación.

## Reglas de stock
- `Disponible para reutilizar`: stock disponible = 1 y estado `in_stock`.
- `En revisión`: stock disponible = 0 y estado `inspection`.
- `Averiado`: stock disponible = 0 y estado `damaged`.
- `Baja`: stock disponible = 0 y estado `decommissioned`.
- Si el registro seleccionado ya tiene stock mayor a cero se bloquea la operación para evitar doble ingreso.
- Un equipo con `inventory_returned_at` no puede retornarse una segunda vez.

## Almacén
La tabla de Almacén muestra ahora una columna Estado con `Disponible`, `En revisión`, `Averiado` o `Baja`. También se muestran Serial/MAC y ubicación para comprobar físicamente el retorno.

## Compatibilidad
No se eliminan clientes, facturas, servicios, recuperaciones ni registros de inventario. Los casos Recuperado creados en versiones anteriores pueden usar `Enviar a Almacén` después de actualizar a 1.2.51.

## Seguridad
No se realiza asociación por nombre, marca o modelo. Se exige Serial/MAC para el retorno y la vinculación con un artículo existente debe ser exacta. Esto evita sumar existencias a un artículo parecido pero incorrecto.

## Archivos funcionales
- `backend/app/routers/clientes/equipment_recoveries.py`
- `frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx`
- `frontend/src/modules/almacen/Inventory.jsx`
- `backend/tests/test_maintenance_contracts.py`
- `frontend/src/modules/system-update/version.js`

## Pruebas
Se agregaron contratos de regresión para exigir asociación exacta, protección contra doble retorno, creación controlada sin coincidencia y presencia de los cuatro destinos. GitHub Actions debe confirmar compilación Python, pytest y build React antes de recomendar la instalación.

## Prueba pendiente en producción
Usar el caso Recuperado ya validado: `Ver detalle → Enviar a Almacén`, elegir un destino, confirmar el retorno y comprobar el registro resultante en `Almacén`. Para la primera prueba se recomienda `Disponible para reutilizar` si el equipo está físicamente apto.
