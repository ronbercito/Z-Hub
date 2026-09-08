# Continuidad MikroHub — 2026-09-08 — Historial consolidado hasta 1.0.82

## 1. Objetivo
Registrar las correcciones funcionales realizadas en esta etapa y dejar una referencia única para continuar el trabajo sin perder el historial, especialmente en facturación, potencia óptica y eliminación definitiva de clientes.

Este documento es interno de continuidad y no forma parte del build del panel.

## 2. Corrección de saldos de facturación — 1.0.68
Se detectó que al eliminar una factura desde Facturación de Cliente, la factura desaparecía pero `Client.unpaid_invoices_count` y `Client.balance_due` podían conservar valores anteriores.

Se incorporó el recálculo de facturas pendientes y saldo después de eliminar una factura.

## 3. Potencia óptica — 1.0.69
El campo Potencia óptica DBM fue corregido para normalizar entradas como `14` y `11` a `-14` y `-11` dBm.

Rangos visuales:
- `-24 dBm` o mejor: verde.
- `-25` a `-27 dBm`: amarillo/naranja.
- `-28 dBm` o menor: rojo.

La normalización se implementó en frontend y backend.

## 4. Protección de eliminación definitiva
Se solicitó que un cliente con múltiples servicios y facturas pendientes no pudiera eliminarse sin una advertencia reforzada.

La protección requerida incluye:
- resumen real del cliente;
- servicios registrados;
- facturas pendientes;
- saldo pendiente;
- observaciones sobre el carácter irreversible;
- confirmación reforzada mediante `SI`;
- cancelación mediante `NO` o Cancelar;
- bloqueo si no se puede verificar la información.

## 5. Primer problema: diálogo nativo
La primera implementación usaba `window.confirm()`/`window.prompt()`, lo que producía el diálogo del navegador identificado como `192.168.10.250 dice`.

Aunque ese flujo tenía un resultado funcional correcto, visualmente no correspondía al panel. Posteriormente se intentó sustituirlo por un modal propio de MikroHub.

## 6. Problema del modal propio
Las pruebas demostraron que el modal propio podía mostrar datos incorrectos:
- cliente correcto;
- servicios `0`;
- facturas `0`;
- saldo `S/.0.00`.

Esto ocurrió incluso cuando la ficha del cliente mostraba datos reales. Para `prueba`, las capturas demostraron dos servicios y dos facturas pendientes por `S/.50.00` cada una, total `S/.100.00`.

## 7. Resumen backend — 1.0.76
Se creó `backend/app/routers/clientes/deletion_summary.py` y se registró en `backend/server.py`.

El endpoint construía un resumen con el servicio principal, servicios adicionales y facturas pendientes.

La discrepancia persistió en determinadas rutas del frontend, por lo que no se tomó el resumen como única fuente del flujo de eliminación.

## 8. Verificación cruzada — 1.0.77
Se comparó el flujo con las fuentes funcionales que ya alimentan correctamente las pestañas del cliente:
- `/clients/{id}` para datos del cliente;
- `/clients/{id}/services` para servicios;
- `/invoices` o `/clients/{id}/invoices` para facturación.

Se incorporó `frontend/src/constants/clientDeleteSummaryFix.js` y su carga desde `frontend/src/constants/testIds.js`.

Las pruebas posteriores demostraron que el modal seguía sin ser la referencia estable.

## 9. Restauración del aviso que sí funcionaba — 1.0.78 → 1.0.82
La evidencia más importante fue la captura del aviso anterior, que aunque aparecía como diálogo nativo del navegador, **sí mostraba correctamente los datos reales**:

- Cliente: `prueba`.
- Servicios registrados: `2`.
- Facturas pendientes: `2`.
- Saldo pendiente: `S/. 100.00`.

Se decidió restaurar ese comportamiento funcional probado en lugar de continuar agregando capas de modales que podían volver a mostrar ceros.

El guardia restaurado en `frontend/src/constants/clientDeleteGuard.js` consulta directamente:

1. `/clients/{id}/services`.
2. `/clients/{id}/invoices`.

Calcula las facturas pendientes en estados `unpaid` y `overdue`, y suma `max(0, amount - paid_amount)` por factura.

Cuando existen más de un servicio y facturas pendientes, presenta el aviso reforzado con:
- nombre del cliente;
- servicios registrados;
- facturas pendientes;
- saldo pendiente;
- observaciones;
- campo de confirmación `SI`.

Si el operador no escribe `SI`, la eliminación se cancela.

El código restaurado neutraliza únicamente la confirmación específica del borrado de clientes para permitir que el guardia ejecute su propio aviso; no modifica globalmente todas las confirmaciones del navegador. fileciteturn1249file0

## 10. Estado de la restauración
La versión actual registrada en el frontend es **1.0.82** y su changelog indica explícitamente la restauración del aviso anterior de eliminación y la retirada del recuadro nuevo que mostraba datos vacíos. fileciteturn1253file0

La versión 1.0.82 es actualmente la referencia funcional para esta corrección.

## 11. Archivos involucrados
- `frontend/src/constants/clientDeleteGuard.js` — guardia principal y aviso restaurado.
- `frontend/src/constants/clientDeleteSummaryFix.js` — verificación cruzada introducida durante 1.0.77.
- `frontend/src/constants/testIds.js` — carga de la protección/verificación.
- `backend/app/routers/clientes/deletion_summary.py` — resumen backend creado durante 1.0.76.
- `backend/server.py` — registro del endpoint de resumen.
- `frontend/src/modules/system-update/version.js` — versión y changelog.

## 12. Historial de versiones de esta etapa
- **1.0.68** — recálculo de saldo/contador al eliminar facturas.
- **1.0.69** — normalización de potencia óptica a dBm negativo y rangos de color.
- **1.0.70+** — evolución de protección de acciones destructivas.
- **1.0.76** — resumen backend autoritativo.
- **1.0.77** — verificación cruzada con fuentes del panel.
- **1.0.78** — consulta directa desde el punto de entrada del DELETE.
- **1.0.82** — restauración del aviso anterior probado, con servicios, facturas y saldo reales.

## 13. Regla de continuidad para futuras correcciones
No reemplazar una funcionalidad que ya entrega datos correctos por otra arquitectura sin comprobar primero que las fuentes nuevas devuelven exactamente los mismos datos.

Ante una discrepancia:
1. revisar el código realmente ejecutado;
2. identificar la fuente que actualmente funciona;
3. reproducir con el mismo cliente y los mismos datos;
4. corregir el punto de entrada real;
5. registrar el cambio aquí;
6. compilar en entorno aislado antes de producción.

## 14. Prueba funcional obligatoria
Con 1.0.82 instalada, comprobar sin ejecutar el borrado definitivo:

Para `prueba`:
- Cliente: `prueba`.
- Servicios registrados: `2`.
- Facturas pendientes: `2`.
- Saldo pendiente: `S/.100.00`.
- Confirmación reforzada visible.
- Escribir `SI` solo como prueba controlada y únicamente después de verificar todos los datos.

También comprobar cancelación con `NO`.

**No eliminar definitivamente ningún cliente durante la validación hasta confirmar visualmente el resumen.**

## 15. Estado actual
**PANEL_VERSION: 1.0.82**.

Esta versión restaura el comportamiento funcional que quedó demostrado mediante captura y que correctamente mostraba las dependencias reales de `prueba`.

La compilación aislada y la validación funcional siguen siendo obligatorias antes de considerar el cambio listo para producción.
