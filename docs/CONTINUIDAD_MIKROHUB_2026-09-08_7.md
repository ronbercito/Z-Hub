# Continuidad MikroHub — 2026-09-08 — Alerta prioritaria de eliminación

## Versión
- PANEL_VERSION: 1.0.70
- Cambio funcional registrado en `frontend/src/constants/clientDeleteGuard.js`.

## Solicitud
El usuario pidió que la alerta mostrada antes de eliminar definitivamente un cliente con más de un servicio y facturación pendiente sea más amigable y coherente con el tema visual del panel, pero con una señal de advertencia prioritaria en tonos rojos.

## Implementación
Se reemplazó el `window.prompt()` nativo por un modal HTML propio de MikroHub.

Características:
- fondo oscuro con desenfoque;
- tarjeta integrada al estilo oscuro del panel;
- borde y acentos rojos para advertencia prioritaria;
- encabezado con icono de advertencia, título y cierre;
- resumen visual del cliente, servicios, facturas y saldo;
- bloque de observaciones;
- campo de confirmación `SI`;
- botón “Eliminar definitivamente” deshabilitado hasta escribir `SI`;
- Cancelar, cerrar, clic fuera o `NO` cancelan;
- Enter confirma cuando el texto es `SI`;
- no se modifica el flujo de eliminación normal para clientes que no cumplen la condición reforzada.

## Archivos afectados
- `frontend/src/constants/clientDeleteGuard.js`
- `frontend/src/modules/system-update/version.js`

## Seguridad
La validación previa de servicios y facturas permanece. Si la consulta de información falla, la eliminación se cancela por seguridad.

## Prueba recomendada
En producción, después de actualizar a 1.0.70, usar un cliente con 2 servicios y facturas pendientes. Verificar que el modal rojo aparezca y que solo `SI` permita ejecutar la eliminación definitiva.
