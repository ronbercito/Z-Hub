# Z-Hub 1.2.52 — Ajuste visual de Almacén y Recuperación

## Objetivo
Corregir contraste, fondos, textos, estados y recuadros nuevos de la Etapa 4 en tema claro y oscuro, sin modificar datos ni lógica de inventario.

## Cambios
- `Almacén` recibe hoja local `inventory-theme.css`.
- Tema claro: encabezado azul, tabla blanca/azul suave, textos azul oscuro y bordes visibles.
- Tema oscuro: fondos azul noche, textos claros y bordes definidos.
- Estados diferenciados: Disponible (verde), En revisión (ámbar), Averiado (rojo), Baja (gris).
- Modal `Registrar Equipo en Almacén` adapta inputs, labels y fondo a ambos temas.
- `Recuperación` reconoce tanto `html[data-panel-theme="zhub-light"]` como la clase histórica `html.zhub-light`, evitando que los nuevos recuadros queden oscuros dentro del tema claro.
- Recuadros, inputs, estados y modal de retorno a Almacén tienen contraste explícito en ambos temas.

## Compatibilidad
No se modifica stock, seriales, clientes, facturas, equipos asignados, casos de recuperación ni operaciones de retorno. Cambio visual únicamente.

## Backup
- Rama: `backup/pre-stage4-ui-colors-1.2.51-20260910`
- HEAD protegido: `51d8f2587c11c6c715acaf8de9dc2ee2f6e32388`

## Calidad
Se agrega `backend/tests/test_stage4_theme_contract.py` y se incorpora al workflow de GitHub Actions. Debe validar presencia de tema local, selectores claro/oscuro y estados coloreados, además del build React existente.

## Prueba pendiente en producción
Actualizar a 1.2.52 y revisar visualmente Almacén y Recuperación en tema claro y oscuro.
