# Continuidad MikroHub — 2026-09-08 — Corrección de eliminación de clientes

## Problema
Al eliminar un cliente desde `Clients.jsx`, el componente todavía ejecutaba `window.confirm(...)`. El guardia existente interceptaba la solicitud Axios, pero el diálogo nativo se ejecutaba antes del DELETE y mostraba `192.168.10.250 dice`.

## Causa raíz
La confirmación nativa ocurría sincrónicamente antes de que el interceptor de Axios pudiera mostrar el modal propio.

## Corrección
- `frontend/src/constants/clientDeleteGuard.js`: intercepta únicamente el mensaje de confirmación de eliminación de cliente y deja pasar el flujo hasta el modal propio de MikroHub.
- El interceptor mantiene la consulta de cliente, servicios y facturas antes del DELETE.
- Se mantiene la alerta roja elegante para más de un servicio con facturas pendientes.
- Se mantiene la confirmación escrita `SI`.
- Cancelar, `NO`, vacío, ESC o cerrar bloquean la eliminación.
- Si no se puede verificar servicios/facturación, se bloquea por seguridad.
- `frontend/src/constants/clientDeleteNativeConfirmBlocker.js`: soporte aislado creado para bloquear el confirm nativo específico de eliminación de clientes.
- `frontend/src/modules/system-update/version.js`: versión `1.0.73`.

## Resultado esperado
Al pulsar eliminar cliente no debe aparecer ningún diálogo que muestre la IP del servidor. Debe aparecer directamente el modal propio de MikroHub. Para múltiples servicios con facturas pendientes debe aparecer `Advertencia prioritaria`.

## Prueba requerida
1. Actualizar a 1.0.73.
2. Abrir Clientes.
3. Pulsar eliminar sobre un cliente con 2 servicios y deuda: debe aparecer la advertencia prioritaria.
4. Cancelar: no elimina.
5. Repetir y escribir `SI`: ejecuta el DELETE.
6. Probar un cliente sin condición prioritaria: también debe aparecer el modal propio, nunca `window.confirm`.

## Política prioritaria aplicada
Se revisó primero el flujo real de eliminación y se identificó que el código modificado no era suficiente porque `Clients.jsx` conservaba una llamada nativa. Se corrigió la causa concreta sin eliminar datos ni modificar manualmente la base de producción.
