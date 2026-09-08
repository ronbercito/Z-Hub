# Continuidad MikroHub — 2026-09-08 — Corrección cruzada de eliminación definitiva

## Versión
- PANEL_VERSION: **1.0.77**
- Cambio funcional publicado en `main`.

## Problema observado
Después de actualizar a 1.0.76, la ventana propia de eliminación continuaba mostrando `Servicios: 0`, `Facturas pendientes: 0` y `S/. 0.00`, aunque la ficha del mismo cliente mostraba 2 servicios y 2 facturas pendientes por S/. 100.00.

## Evidencia
Las capturas del usuario demostraron simultáneamente:
- Cliente `prueba` con `Principal` y `Servicio 1` en la pestaña Servicios.
- Dos facturas pendientes de S/. 50.00 en Facturación.
- La ventana de eliminación mostrando cero en ambos contadores.

## Análisis de causa
El modal dependía de la respuesta de `deletion-summary`. Aunque el endpoint estaba registrado y consultaba `ClientService` e `Invoice`, el resultado consumido por el frontend no coincidía con las fuentes que ya demostraban los datos en la ficha del cliente.

La política prioritaria exige comparar el flujo nuevo con los flujos existentes que ya funcionan. La ficha utiliza `/clients/{id}/services` para servicios y Facturación utiliza `/invoices` para recibos. Por ello se agregó una verificación cruzada usando exactamente esas fuentes antes de construir la alerta.

## Corrección
Se creó `frontend/src/constants/clientDeleteSummaryFix.js`.

Este módulo se carga junto con el guardia de eliminación y, cuando recibe la respuesta de `/clients/{id}/deletion-summary`, consulta:
- `/clients/{id}/services` para obtener los servicios reales, incluyendo principal y adicionales;
- `/invoices` para obtener las facturas y filtrar exactamente por `client_id`.

El módulo reemplaza en el resumen los servicios, cantidad de facturas y saldo con los datos cruzados de esas fuentes. El saldo se calcula como `monto - paid_amount`, sin permitir valores negativos por factura.

Se actualizó `frontend/src/constants/testIds.js` para cargar la verificación cruzada después del guardia.

## Resultado esperado
Para el caso probado:
- Cliente: `prueba`.
- Servicios: **2**.
  - Servicio principal · PLAN50.
  - Servicio 2 · PLAN50 (o etiqueta equivalente devuelta por la ficha).
- Facturas pendientes: **2**.
- Saldo pendiente: **S/. 100.00**.
- Si tiene más de un servicio y deuda, se muestra la advertencia prioritaria.
- La confirmación continúa exigiendo `SI`.
- No aparece `192.168.10.250 dice`.

## Archivos afectados
- `frontend/src/constants/clientDeleteSummaryFix.js` — nuevo cruce de datos.
- `frontend/src/constants/testIds.js` — carga el módulo nuevo.
- `frontend/src/modules/system-update/version.js` — versión 1.0.77.

## Historial
- `83b38f3` — módulo de verificación cruzada.
- `d7938f1` — carga del módulo en el frontend.
- `df14767` — versión 1.0.77.

## Prueba obligatoria antes de producción
1. Compilar en worktree aislado con `DISABLE_ESLINT_PLUGIN=true CI= yarn build`.
2. Cliente con 2 servicios y 2 facturas pendientes por S/. 100.00: comprobar que la ventana muestre exactamente esos datos.
3. Cliente sin servicios adicionales y sin deuda: comprobar 1 servicio principal, 0 facturas y S/. 0.00.
4. Cancelar con `NO`, cancelar con botón, `X`, clic exterior y `ESC`.
5. Confirmar solamente con `SI`.
6. Verificar que no aparezca ningún diálogo nativo del navegador.

## Política aplicada
Se aplicó la política prioritaria de errores de actualización: primero se revisó el código modificado, se comparó con los flujos existentes que ya entregan correctamente servicios y facturación, se aisló la discrepancia y se implementó una corrección específica antes de solicitar otra actualización de producción.
