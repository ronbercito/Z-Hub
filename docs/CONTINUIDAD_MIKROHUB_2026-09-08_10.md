# Continuidad MikroHub — 2026-09-08 — Historial consolidado hasta 1.0.78

## 1. Objetivo de este documento
Registrar de forma continua las correcciones funcionales realizadas durante esta etapa de MikroHub, incluyendo facturación, potencia óptica y, especialmente, la protección previa a la eliminación definitiva de clientes.

Este documento es interno de continuidad y no forma parte del build del panel.

## 2. Corrección de saldos de facturación
Se detectó que al eliminar una factura desde Facturación de Cliente, la factura desaparecía pero el resumen del cliente podía conservar el contador de facturas impagas y el saldo anterior.

### Causa
`delete_invoice()` eliminaba el registro sin recalcular `Client.unpaid_invoices_count` y `Client.balance_due`, mientras que la anulación de factura sí realizaba esa actualización.

### Corrección
Se incorporó el recálculo de facturas pendientes y saldo después de eliminar una factura, manteniendo la actualización del resumen del cliente.

Versión funcional registrada: **1.0.68**.

## 3. Potencia óptica de fibra
Se corrigió el campo **Potencia óptica DBM** de Nuevo Servicio para que valores introducidos como `14` o `11` se normalicen a `-14` y `-11` dBm al guardar.

### Rangos visuales solicitados
- `-24 dBm` o mejor: verde.
- `-25` a `-27 dBm`: amarillo/naranja.
- `-28 dBm` o menor: rojo.

La normalización se implementó en frontend y backend para evitar depender solamente de la presentación del formulario.

Versión funcional registrada: **1.0.69**.

## 4. Problema de eliminación definitiva de clientes
Se solicitó impedir una eliminación irreversible sin advertencia cuando el cliente tiene más de un servicio y facturas pendientes.

La protección requerida es:
- modal propio de MikroHub;
- sin diálogo nativo del navegador;
- nombre real del cliente;
- cantidad y detalle de servicios;
- cantidad de facturas pendientes;
- saldo pendiente total;
- advertencia prioritaria si existen múltiples servicios y deuda;
- confirmación escribiendo exactamente `SI`;
- `NO`, cancelar, `X`, clic exterior o `ESC` cancelan;
- si no se puede verificar la información, bloquear la eliminación por seguridad.

## 5. Primera implementación y problema detectado
La primera protección utilizaba `window.confirm()`. Esto provocó el diálogo nativo del navegador con el texto del servidor, incluyendo `192.168.10.250 dice`.

Se sustituyó el comportamiento visual por un modal propio de MikroHub y se interceptó únicamente la confirmación específica de eliminación de clientes.

Posteriormente se comprobó que el modal podía mostrar:
- cliente correcto;
- servicios `0`;
- facturas `0`;
- saldo `S/.0.00`;

aunque las pestañas del cliente demostraban datos reales.

## 6. Resumen autoritativo 1.0.76
Se creó el endpoint backend:
- `backend/app/routers/clientes/deletion_summary.py`

y se registró en `backend/server.py`.

El endpoint consulta el cliente, construye el servicio principal desde los datos del cliente, incorpora los servicios adicionales de `ClientService` y calcula las facturas pendientes desde `Invoice`.

La versión **1.0.76** hizo que el modal consumiera este resumen autoritativo.

### Evidencia que originó la siguiente revisión
Para el cliente `prueba`, las capturas mostraron simultáneamente:
- `Principal` + `Servicio 1`;
- dos facturas pendientes de `S/.50.00` cada una;
- total pendiente `S/.100.00`;
- modal de eliminación mostrando `0` servicios y `0` facturas.

Esto demostró que todavía existía una discrepancia entre el flujo del modal y las fuentes funcionales del panel.

## 7. Verificación cruzada 1.0.77
Se comparó el flujo de eliminación con las fuentes que ya entregan correctamente los datos en las pestañas del cliente.

Se estableció que las fuentes funcionales existentes son:
- `GET /api/clients/{client_id}` — nombre y detalle real del cliente.
- `GET /api/clients/{client_id}/services` — servicio principal y servicios adicionales.
- `GET /api/clients/{client_id}/invoices` — facturas del cliente.

Se creó `frontend/src/constants/clientDeleteSummaryFix.js` y se cargó desde `frontend/src/constants/testIds.js` para cruzar esas fuentes.

La versión **1.0.77** quedó registrada como corrección de verificación cruzada.

## 8. Corrección definitiva del punto de entrada 1.0.78
Las pruebas posteriores con `prueba` y `prueba2` mostraron que el modal continuaba en cero. La revisión del código confirmó que el guardia principal todavía dependía indirectamente de `deletion-summary`.

Se reestructuró `frontend/src/constants/clientDeleteGuard.js` para que, al detectar el DELETE de un cliente, consulte directamente las fuentes que ya funcionan en el panel:

1. `/clients/{id}` para obtener el nombre real.
2. `/clients/{id}/services` para obtener los servicios reales.
3. `/clients/{id}/invoices` para obtener las facturas reales.

El modal se construye con esas respuestas antes de permitir que el DELETE continúe.

### Cálculo de deuda
Las facturas pendientes se consideran en estados `unpaid` y `overdue`.

El saldo pendiente se calcula por factura como:

`max(0, amount - paid_amount)`

y luego se suma el resultado.

### Regla de advertencia
Se muestra **Advertencia prioritaria** cuando:

`cantidad de servicios > 1` y `cantidad de facturas pendientes > 0`.

### Seguridad
Si cualquiera de las consultas necesarias falla, el DELETE se cancela por seguridad.

El `window.confirm()` nativo solamente se neutraliza para la pregunta específica de eliminación de clientes; no se elimina globalmente el comportamiento nativo de otras partes del panel.

La decisión efectiva permanece en el modal de MikroHub y requiere escribir `SI`.

## 9. Archivos funcionales principales involucrados
- `backend/app/routers/clientes/deletion_summary.py` — resumen backend seguro creado durante 1.0.76.
- `backend/server.py` — registro del endpoint de resumen.
- `frontend/src/constants/clientDeleteGuard.js` — guardia y modal de eliminación; corregido nuevamente para 1.0.78.
- `frontend/src/constants/clientDeleteSummaryFix.js` — verificación cruzada introducida durante 1.0.77.
- `frontend/src/constants/testIds.js` — carga de la verificación cruzada.
- `frontend/src/modules/system-update/version.js` — versión y changelog visible.

## 10. Historial de versiones de esta etapa
- **1.0.68** — corrección del recálculo de saldo/contador al eliminar facturas.
- **1.0.69** — normalización de potencia óptica a dBm negativo y rangos de color.
- **1.0.70+** — evolución de la confirmación segura de eliminación y protección de acciones destructivas.
- **1.0.76** — resumen backend autoritativo para eliminación.
- **1.0.77** — verificación cruzada con las fuentes de Servicios y Facturación.
- **1.0.78** — consulta directa desde el guardia de eliminación en el punto de entrada del DELETE.

## 11. Commits relevantes conocidos
- `2c32dd36547c0e471037b7db7947b7a4900b2891` — guardia con resumen autoritativo.
- `2e4cd4d4a5f31a9d878c60cd980c1cdc45743849` — versión 1.0.76.
- `98b32dea3033c95ed120fc76673a26a3a466d36c` — registro del resumen de eliminación.
- `83b38f368a0cd52b242a7d3a3d23acb4f2671b51` — verificación con fuentes del panel.
- `d7938f18bc40f6ac01c4c5a946f105b7679cf521` — carga de la verificación cruzada.
- `df147674aa99bd5e0bf2c6dfaa26e12cd0313836` — versión 1.0.77.
- `38b5a6bfd93d9ff9f1d99a1ad08a4a184acb3676` — corrección directa del flujo de eliminación para 1.0.78.
- `520325f14d1bbf6d9c006a35e7b7cfe31b5c7de4` — versión 1.0.78.

## 12. Estado actual
**PANEL_VERSION: 1.0.78**.

La corrección está publicada en `main` y registrada en este documento.

No se debe considerar la funcionalidad lista para producción solamente por estar publicada: la compilación aislada y la prueba funcional siguen siendo obligatorias.

## 13. Prueba obligatoria antes de producción
En worktree aislado:

```bash
cd /tmp/mikrohub-build-debug
git fetch origin main
git checkout --detach origin/main
cd frontend
rm -rf node_modules
yarn install --network-timeout 100000
DISABLE_ESLINT_PLUGIN=true CI= yarn build 2>&1 | tee /tmp/mikrohub-build-error.log
```

Debe aparecer `Compiled successfully.`.

## 14. Prueba funcional de eliminación
Con 1.0.78 instalada, abrir la eliminación de `prueba` y **no confirmar el borrado** hasta verificar visualmente:

- Cliente: `prueba`.
- Servicios: `2`.
- Servicio principal · PLAN50.
- Servicio 2 · PLAN50.
- Facturas pendientes: `2`.
- Saldo pendiente: `S/.100.00`.
- Advertencia prioritaria.
- Campo obligatorio `SI`.

También probar un cliente sin servicios adicionales ni facturas pendientes.

Verificar las cancelaciones con `NO`, botón Cancelar, `X`, clic exterior y `ESC`.

Verificar que no aparezca ningún diálogo nativo del navegador con `192.168.10.250 dice`.

**No eliminar ningún cliente durante la prueba hasta verificar visualmente el resumen.**

## 15. Política aplicada
Ante cada discrepancia se siguió la política prioritaria de errores de actualización:

1. revisar el código realmente ejecutado;
2. comparar el flujo nuevo con las fuentes existentes que ya funcionan;
3. identificar la discrepancia;
4. corregir la causa en el punto adecuado;
5. registrar el cambio en continuidad;
6. ejecutar la compilación aislada antes de solicitar una actualización de producción.

La versión actual de referencia para continuar el trabajo es **1.0.78**.
