# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.0.65**

## Historial de 1.0.64

Se igualó la pestaña **Facturación dentro de la ficha del cliente** con las acciones disponibles en la sección global **Facturación → Facturas**.

### Archivo principal

`frontend/src/modules/clientes/editor/ClientBilling.jsx`

### Acciones por factura

- Editar.
- Ver factura/documento.
- Eliminar.
- Anular.
- Enviar.
- Pagar, manteniendo el flujo existente.

### Enviar

La ventana ofrece:

- **Correo** → solicita el correo y abre `mailto:` con el mensaje preparado.
- **WhatsApp** → usa el teléfono disponible o permite introducirlo y abre `wa.me` con el mensaje preparado.

Backend utilizado:

`backend/app/routers/facturacion/invoice_actions.py`

Endpoints:

```text
PUT  /api/invoices/{invoice_id}
DELETE /api/invoices/{invoice_id}/permanent
POST /api/invoices/{invoice_id}/annul
GET  /api/invoices/{invoice_id}/pdf
POST /api/invoices/{invoice_id}/send?channel=email|whatsapp
```

### Protección

- factura pagada → no editar, eliminar ni anular;
- factura con pagos registrados → protegida contra acciones destructivas;
- factura pendiente → puede gestionarse según la acción;
- factura anulada → no se trata como activa.

### Commit funcional

`2cde1d2bcd20b4affc272585ea749e3ad41cb203`

## Incidencia detectada al actualizar a 1.0.64

El servidor recibió la oferta de actualización **1.0.64**, pero el instalador falló durante `setup_debian.sh` y el sistema realizó rollback automático a **1.0.63**.

La interfaz solo mostraba:

```text
error Command failed with exit code 1
```

Esto no permitía saber si el fallo estaba en dependencias, frontend, backend, Supervisor, Nginx u otro paso.

## Corrección 1.0.65

Se mejoró el mecanismo interno de actualización para registrar el motivo real del fallo antes del rollback.

### `backend/app/modules/system_update/run_update.sh`

Ahora registra:

- paso actual;
- comando que falló;
- código de salida;
- últimas 80 líneas del log.

También conserva el rollback sin resincronizar `origin/main` durante la restauración.

### `deploy/setup_debian.sh`

Ahora registra mediante `ERROR_SETUP`:

```text
paso=<paso>
linea=<línea>
comando=<comando>
codigo=<código>
```

Esto permite que una próxima falla pueda identificarse directamente desde el Centro de Actualizaciones.

El build frontend se ejecuta con `CI=` para evitar que advertencias heredadas del entorno conviertan innecesariamente el build en un fallo.

### `backend/app/modules/system_update/router.py`

El endpoint de estado ahora reconoce tanto `ERROR_SETUP` como `ERROR en paso` y devuelve el mensaje exacto al Centro de Actualizaciones, en lugar de mostrar únicamente el último `exit code 1`.

### Versión

`frontend/src/modules/system-update/version.js` → **1.0.65**

### Changelog 1.0.65

- Mejora del diagnóstico del actualizador.
- Registro del paso/comando/código exactos ante errores.
- Mayor detalle para fallos de backend, frontend, dependencias y servicios.

## Verificación pendiente en servidor

La siguiente instalación debe comprobar:

1. que el servidor pase de 1.0.63 a 1.0.65;
2. que el build frontend termine correctamente;
3. que Supervisor y Nginx queden activos;
4. que el Centro de Actualizaciones muestre 1.0.65;
5. que la ficha del cliente muestre las acciones de facturación;
6. que las acciones Editar, Ver, Eliminar, Anular, Enviar y Pagar funcionen;
7. que las facturas pagadas sigan protegidas.

Si vuelve a fallar, **no asumir la causa**: leer primero el detalle `ERROR_SETUP`/`ERROR en paso` generado por el nuevo actualizador.

## Nota técnica de PDF

`/api/invoices/{invoice_id}/pdf` actualmente genera un **HTML imprimible**, no un PDF binario real. Si posteriormente se exige un PDF real, implementar generación `application/pdf` en backend.

## Regla para futuras sesiones

Antes de continuar con Facturación o Actualizaciones, leer:

1. `README.md`
2. `docs/CONTINUIDAD_MIKROHUB.md`
3. este documento para el historial detallado del 08-09-2026.

Este documento es documentación interna y no debe entrar en el build público.
