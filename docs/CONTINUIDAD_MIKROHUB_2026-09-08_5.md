# Continuidad MikroHub — 2026-09-08 — Protección de eliminación definitiva de clientes

## 1. Problema reportado
En `Clientes`, al usar la eliminación definitiva se eliminaba el cliente completo, incluyendo sus servicios adicionales y facturación pendiente. Se solicitó una advertencia específica cuando el cliente tiene más de un servicio y facturas pendientes.

## 2. Corrección adicional 1.0.72
Se detectó que la confirmación normal seguía utilizando `window.confirm()`. El navegador mostraba como encabezado la IP del servidor, por ejemplo `192.168.10.250 dice`.

Se reemplazó esa confirmación nativa por un modal propio de MikroHub. Ahora todas las rutas de confirmación de eliminación utilizan la interfaz del panel y ninguna muestra la IP del servidor.

La variante prioritaria conserva el diseño rojo elegante para clientes con más de un servicio y facturas pendientes. La variante normal utiliza el mismo componente con un diseño neutro integrado al panel.

## 3. Comportamiento implementado
Antes de ejecutar `DELETE /api/clients/{id}`, el frontend consulta:
- datos del cliente;
- servicios registrados;
- facturas del cliente.

Si existen más de 1 servicio y al menos una factura `unpaid`, `overdue` o `pending`, aparece la alerta prioritaria con:
- nombre del cliente;
- cantidad de servicios;
- cantidad de facturas pendientes;
- saldo pendiente;
- observaciones sobre el carácter definitivo de la eliminación.

La confirmación solicita escribir `SI` para continuar o `NO` para cancelar. Cualquier otro texto, cerrar, `ESC`, clic fuera o cancelar detiene la eliminación.

Si no se cumple la condición prioritaria, también aparece un modal propio de MikroHub y se exige `SI`; ya no se utiliza `window.confirm()`.

La comprobación acepta respuestas de servicios/facturas en lista directa o dentro de `services`, `invoices`, `items` o `data`.

Si no se puede consultar la información necesaria, la eliminación se cancela por seguridad.

## 4. Archivos afectados
- `frontend/src/constants/clientDeleteGuard.js` — guardia y modal propio de eliminación.
- `frontend/src/constants/testIds.js` — carga el guardia como efecto global del frontend.
- `frontend/src/modules/system-update/version.js` — versión 1.0.72 y changelog.

## 5. Seguridad y datos
No se modifica ni borra información durante la comprobación previa. La eliminación continúa siendo una acción explícita del operador.

## 6. Versión
- **1.0.72**
- Commit del guardia: `fe1475cb1f6dfc2a81960184788be87adfc6c422`
- Commit de versión: `0673d1c45a5dabfff7c7f6b2b285f4201cb254ef`

## 7. Pruebas previstas
1. Cliente con varios servicios y deuda: alerta roja elegante propia de MikroHub.
2. Cliente sin condición prioritaria: modal normal propio de MikroHub.
3. Confirmar que nunca aparezca `192.168.x.x dice` ni otro encabezado nativo del navegador.
4. `NO`, vacío, cancelar, cerrar o `ESC`: no elimina.
5. `SI`: permite continuar con el DELETE original.
6. Error al consultar dependencias: no elimina.
7. Ejecutar build frontend antes de actualizar producción.

## 8. Regla prioritaria aplicada
Se corrigió primero la causa del comportamiento observado antes de repetir una actualización. El cambio permanece aislado en el guardia reutilizable para no reemplazar el componente grande `Clients.jsx` ni alterar su lógica de listado, edición o registro.
