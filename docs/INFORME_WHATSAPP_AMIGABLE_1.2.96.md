# Informe — Z-Hub 1.2.96

## Plantillas WhatsApp con tono más amigable y visual

### Objetivo

Mejorar la comunicación de WhatsApp para que los mensajes sean más personales, claros y fáciles de leer, reduciendo la posibilidad de que el cliente ignore el aviso.

### Cambios

- El recordatorio de pago ahora comienza con un saludo personalizado usando el nombre del cliente.
- Se identifica inmediatamente a la empresa y el motivo del mensaje.
- El total y la fecha de vencimiento quedan destacados.
- Los medios de pago YAPE/PLIN y transferencia bancaria se presentan en bloques separados.
- Se mantiene una llamada a la acción clara para enviar el comprobante.
- Se incluye una salida amable para clientes que ya realizaron el pago.
- El aviso de deuda vencida utiliza un tono preventivo en lugar de un mensaje excesivamente amenazante.
- La confirmación de pago tiene un cierre positivo.
- El aviso de mantenimiento queda estructurado con fecha y horario destacados.
- Se evita mostrar el día de corte en el recordatorio mientras el sistema no tenga una fuente independiente y confiable para ese dato; anteriormente podía terminar mostrando la misma fecha del vencimiento.

### Compatibilidad

Las plantillas continúan usando `{{variable}}`, `%vip%` y formato WhatsApp. El renderer común mantiene compatibilidad con plantillas heredadas que utilizan `{variable}`.

### Archivos funcionales

- `backend/app/services/whatsapp_automatizadovip_templates.py`
- `backend/app/services/whatsapp_automatizadovip_automation.py`
- `backend/app/services/whatsapp_automatizadovip_worker.py`
- `frontend/src/modules/system-update/version.js`

### Backup

Antes de cambiar las plantillas se conservó:

`docs/backups/1.2.96/whatsapp_automatizadovip_templates.py.before-friendly-message.bak`

La copia contiene las cuatro plantillas anteriores y permite restaurar el diseño previo sin perderlo.

### Pruebas / validación

- Se revisó el diff del cambio publicado.
- Se verificó que las nuevas plantillas usan variables existentes del renderer común.
- Se confirmó previamente un mensaje real con nombre, empresa, monto, vencimiento y YAPE/PLIN correctamente renderizados.
- Queda pendiente validar el mensaje nuevo directamente en WhatsApp con un envío de prueba controlado.

### Resultado esperado

Los mensajes deben verse más humanos y visuales, con la información importante en los primeros bloques y una acción clara para el cliente.

### Estado

Publicado en `main` como parte de Z-Hub **1.2.96**.

Commit funcional de las plantillas:

`608250ea45953c99f9afcf4e208745d18cd5040c`
