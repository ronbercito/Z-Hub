# MikroHub — Continuidad 1.1.9 — Facturación por cliente

**Fecha:** 2026-09-08  
**Versión funcional:** 1.1.9  
**Área:** Ficha del cliente → Facturación → Configuración

## Causa

La configuración mostrada en la ficha del cliente estaba leyendo `/settings`, que corresponde a la configuración global del ISP. El registro de abonados, en cambio, guarda reglas específicas en `clients`: tipo de servicio, día de pago, anticipación para crear factura, días de gracia, meses para corte y canales/días de recordatorios. Por eso los valores de la primera imagen no coincidían con los elegidos en el registro de la segunda imagen.

## Verificación realizada

Se verificó en `backend/app/models/client.py` que el abonado ya dispone de los campos:

- `billing_type`
- `billing_day`
- `invoice_lead_days`
- `grace_days`
- `cut_after_months`
- `invoice_notification_channel`
- `payment_reminder_channel`
- `reminder_1_days`
- `reminder_2_days`
- `reminder_3_days`

También se verificó que `ClientRegistrationWizard.jsx` ya escribe esos valores durante el registro.

## Solución

### Frontend

`frontend/src/modules/clientes/editor/billing/ClientBilling.jsx`

- Configuración dejó de consumir `/settings`.
- Ahora carga `/clients/{client_id}/billing-config`.
- La interfaz usa los mismos conceptos y opciones del registro: Prepago/Postpago, día de pago, crear factura X días antes, gracia, corte por meses vencidos y notificaciones.
- Se agregó una vista de próxima emisión/vencimiento calculada con el día de pago y la anticipación del abonado.
- Guardar configuración ya no reprovisiona MikroTik ni modifica reglas globales.
- Al generar una factura manual desde la ficha, se propone la fecha de emisión y vencimiento según la configuración del abonado.

### Backend

`backend/app/routers/facturacion/client_balances.py`

- Se agregó `GET /clients/{client_id}/billing-config`.
- Se agregó `PATCH /clients/{client_id}/billing-config`.
- El cambio queda auditado en el Log del cliente.

`backend/app/routers/facturacion/router.py`

- La facturación mensual calcula la fecha de emisión con `invoice_lead_days` y el vencimiento con `billing_day` de cada abonado.
- `mark-overdue` usa `grace_days` del abonado correspondiente, en lugar de la gracia global.

`backend/app/routers/red/router.py`

- `sync-cuts` usa `cut_after_months` de cada abonado.
- La respuesta informa la regla individual aplicada por cliente.

## Flujo esperado

1. El usuario registra un abonado y elige sus reglas en el paso Facturación.
2. Esas reglas quedan en el registro del abonado.
3. Al abrir Facturación → Configuración, se recuperan esas mismas reglas.
4. Al editar y guardar, solo se actualiza la configuración de ese abonado.
5. La emisión/vencimiento de nuevas facturas usa el día y anticipación del abonado.
6. Una factura pasa a vencida después de su vencimiento más los días de gracia del abonado.
7. El corte masivo evalúa la cantidad de facturas vencidas contra los meses configurados para ese abonado.
8. Los canales de aviso y recordatorio permanecen ligados al abonado y disponibles para el flujo de mensajería.

## Archivos modificados

- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx`
- `backend/app/routers/facturacion/client_balances.py`
- `backend/app/routers/facturacion/router.py`
- `backend/app/routers/red/router.py`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.9_FACTURACION_CLIENTE.md`

## Pruebas

- Revisión estática de modelos, esquema de registro, configuración de ficha y rutas existentes: realizada.
- Verificación de que el registro ya persistía las reglas en `clients`: realizada.
- Build frontend: **pendiente**.
- Prueba funcional real con navegador y servidor: **pendiente**.
- Prueba real de corte contra MikroTik: **pendiente**.
- Prueba real de transporte SMS/WhatsApp/Correo: **pendiente**; el código existente prepara/abre los canales manuales, mientras que la configuración por cliente queda persistida para el flujo de mensajería.

## Riesgos / pendientes

- No se debe afirmar que el envío automático externo está operativo hasta probar las credenciales/proveedor correspondiente.
- Debe probarse con un abonado cuyos valores de registro sean deliberadamente distintos de los globales para confirmar que no existe contaminación entre configuraciones.
- Debe probarse un ciclo con fecha de pago, anticipación, gracia y corte distintos para validar fechas y suspensión real.
