# Continuidad MikroHub — 2026-09-08 — Versión 1.0.83

## 1. Estado actual
La versión funcional de referencia queda actualizada a **1.0.83**.

## 2. Motivo de la actualización
El usuario confirmó que el aviso anterior de eliminación definitiva era el comportamiento que funcionaba correctamente y que debía conservarse.

La evidencia visual mostró que ese aviso sí presentaba correctamente:
- Cliente: `prueba`.
- Servicios registrados: `2`.
- Facturas pendientes: `2`.
- Saldo pendiente: `S/. 100.00`.

Por decisión de continuidad, se mantiene la restauración de ese comportamiento en lugar de seguir agregando nuevas capas de resumen que habían provocado datos en cero.

## 3. Versión 1.0.83
Se incrementó `frontend/src/modules/system-update/version.js` de **1.0.82** a **1.0.83**.

El changelog visible registra que se conserva el aviso anterior de eliminación y su comportamiento probado para mostrar las dependencias reales del cliente.

Commit de versión:
`0595959ce6bb8fa932903c5ce767f5db287d4e07`

## 4. Regla de continuidad
No modificar nuevamente el diseño de la confirmación de eliminación sin comprobar primero el comportamiento funcional que ya fue validado por el usuario.

La referencia visual y funcional es el aviso que muestra correctamente servicios, facturas y saldo antes de permitir la eliminación.

## 5. Prueba pendiente
Antes de producción se mantiene la compilación aislada obligatoria y la prueba funcional con un cliente de prueba que tenga múltiples servicios y facturas pendientes.

No eliminar el cliente durante la prueba; primero verificar visualmente el resumen.

## 6. Historial inmediato
- **1.0.76** — resumen backend autoritativo.
- **1.0.77** — verificación cruzada.
- **1.0.78** — consulta directa desde el punto de entrada de eliminación.
- **1.0.82** — restauración del aviso anterior.
- **1.0.83** — consolidación de la restauración confirmada como versión actual.
