# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.0.64**

## Cambio realizado

Se igualó la pestaña **Facturación dentro de la ficha del cliente** con las acciones disponibles en la sección global **Facturación → Facturas**.

### Archivo principal modificado

`frontend/src/modules/clientes/editor/ClientBilling.jsx`

### Acciones agregadas por factura

- Editar.
- Ver factura/documento.
- Eliminar.
- Anular.
- Enviar.
- Pagar, manteniendo el flujo que ya existía.

### Enviar

La ventana de envío ofrece las mismas dos alternativas del módulo principal:

- **Correo** → solicita el correo y abre `mailto:` con el mensaje preparado.
- **WhatsApp** → usa el teléfono disponible o permite introducirlo y abre `wa.me` con el mensaje preparado.

El backend utilizado es el mismo:

`backend/app/routers/facturacion/invoice_actions.py`

Endpoints relevantes:

```text
PUT  /api/invoices/{invoice_id}
DELETE /api/invoices/{invoice_id}/permanent
POST /api/invoices/{invoice_id}/annul
GET  /api/invoices/{invoice_id}/pdf
POST /api/invoices/{invoice_id}/send?channel=email|whatsapp
```

## Protección

Se mantiene la regla definida anteriormente:

- factura pagada → no editar, eliminar ni anular;
- factura con pagos registrados → protegida contra acciones destructivas;
- factura pendiente → puede gestionarse según la acción;
- factura anulada → no se trata como factura activa.

## Interfaz

Las acciones se muestran como botones compactos dentro de la columna **Acciones**, para mantener el espacio reducido de la ficha del cliente y conservar la información de servicio, período, monto, vencimiento y estado.

## Archivos relacionados

- `frontend/src/modules/clientes/editor/ClientBilling.jsx`
- `frontend/src/modules/facturacion/Billing.jsx`
- `backend/app/routers/facturacion/invoice_actions.py`
- `backend/server.py`
- `frontend/src/modules/system-update/version.js`

## Versión

`frontend/src/modules/system-update/version.js` → **1.0.64**

## Commit funcional de la ficha del cliente

`2cde1d2bcd20b4affc272585ea749e3ad41cb203`

## Commit de versión

`288e838a2e760d55cd03285316466041ca72a3ce`

## Pruebas / verificación pendiente

El código fue publicado en `main`. Falta realizar en el servidor el build/deploy y probar visualmente las cinco acciones dentro de una ficha real de cliente:

1. Editar una factura pendiente.
2. Abrir documento.
3. Eliminar una factura pendiente.
4. Anular una factura pendiente.
5. Enviar por Correo y WhatsApp.
6. Confirmar que una factura pagada queda protegida.

## Nota técnica existente

La ruta `/api/invoices/{invoice_id}/pdf` actualmente genera un **HTML imprimible**, no un PDF binario real. Si posteriormente se exige un PDF real, debe implementarse generación `application/pdf` en backend.

## Regla para futuras sesiones

Antes de continuar con Facturación, leer:

1. `README.md`
2. `docs/CONTINUIDAD_MIKROHUB.md`
3. este documento de continuidad fechado cuando se necesite conocer el detalle del cambio 1.0.64.

Este documento es documentación interna y no incrementa la versión por sí mismo; la versión 1.0.64 existe porque el cambio sí modifica funcionalidad del panel.
