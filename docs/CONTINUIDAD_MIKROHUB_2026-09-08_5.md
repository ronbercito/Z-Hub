# Continuidad MikroHub — 2026-09-08 — Protección de eliminación definitiva de clientes

## 1. Problema reportado
En `Clientes`, al usar la eliminación definitiva se eliminaba el cliente completo, incluyendo sus servicios adicionales y facturación pendiente. Se solicitó una advertencia específica cuando el cliente tiene más de un servicio y facturas pendientes.

## 2. Comportamiento implementado
Antes de ejecutar `DELETE /api/clients/{id}`, el frontend consulta:
- datos del cliente;
- servicios registrados;
- facturas del cliente.

Si existen más de 1 servicio y al menos una factura `unpaid` o `overdue`, aparece una ventana de alerta con:
- nombre del cliente;
- cantidad de servicios;
- cantidad de facturas pendientes;
- saldo pendiente;
- observaciones sobre el carácter definitivo de la eliminación.

La confirmación reforzada solicita escribir `SI` para continuar o `NO` para cancelar. Cualquier otro texto o cancelar la ventana detiene la eliminación.

Si no se puede consultar la información necesaria, la eliminación se cancela por seguridad.

Para clientes sin múltiples servicios y sin facturación pendiente se conserva la confirmación normal.

## 3. Archivos afectados
- `frontend/src/constants/clientDeleteGuard.js` — nuevo guardia de eliminación.
- `frontend/src/constants/testIds.js` — carga el guardia como efecto global del frontend.
- `frontend/src/modules/system-update/version.js` — versión 1.0.70 y changelog.

## 4. Seguridad y datos
No se modificó ni borró información de la base de datos durante esta corrección. La eliminación continúa siendo una acción explícita del operador; la nueva protección agrega una verificación previa y una confirmación reforzada.

## 5. Versión
- **1.0.70**

## 6. Pruebas previstas
1. Cliente con 1 servicio y sin deuda: confirmación normal.
2. Cliente con varios servicios y sin deuda: confirmación normal.
3. Cliente con varios servicios y facturas pendientes: alerta reforzada y entrada `SI` permite continuar.
4. Misma condición con `NO`, vacío, cancelar o texto diferente: no elimina.
5. Error al consultar dependencias: no elimina.
6. Verificar que el build frontend termine correctamente antes de actualizar producción.

## 7. Regla prioritaria aplicada
Se revisó primero el flujo existente de eliminación y sus llamadas API antes de agregar la protección. La corrección se aisló en un guardia reutilizable para no reemplazar el componente grande `Clients.jsx` ni alterar su lógica de listado, edición o registro de clientes.
