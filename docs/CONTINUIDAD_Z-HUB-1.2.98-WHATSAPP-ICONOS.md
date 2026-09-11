# Z-Hub — Bitácora de continuidad 1.2.98 — Iconos / Emojis en plantillas WhatsApp

**Fecha:** 2026-09-11  
**Versión:** 1.2.98  
**Área:** Mensajería / Ajustes / Plantillas WhatsApp / AutomatizadoVIP

## Motivo de la actualización

Se incorpora una herramienta visual para que el administrador pueda agregar y modificar iconos/emojis directamente en cada plantilla de WhatsApp, sin tener que copiarlos manualmente desde otro lugar.

## Cambio publicado

Se actualizó `frontend/src/modules/ajustes/MessageTemplatesSettings.jsx`.

Cada una de las cuatro plantillas dispone ahora de un botón independiente **Iconos / Emojis**:

- `payment_reminder` — Recordatorio de pago.
- `cut_warning` — Aviso de corte.
- `payment_confirmation` — Confirmación de pago.
- `maintenance` — Aviso de mantenimiento.

El selector incluye emojis habituales para saludos, pagos, fechas, vencimientos, alertas, comprobantes, mantenimiento, servicio y llamadas a la acción.

## Comportamiento

- El emoji se inserta exactamente en la posición del cursor o reemplaza el texto seleccionado.
- Después de insertar el emoji, el cursor vuelve a quedar después del icono para continuar editando.
- El emoji forma parte del texto de la plantilla y se guarda mediante el endpoint existente `/settings/message-templates/whatsapp/{template_key}`.
- Restaurar plantilla continúa funcionando mediante el endpoint existente de reset.
- La vista previa refleja los emojis guardados.
- No se modificó el contrato de variables dinámicas.

## Compatibilidad preservada

Se mantiene la compatibilidad con:

- `{{variable}}`
- `{variable}`
- `%vip%`
- Formato WhatsApp existente como `*negrita*`
- Límite actual de 1000 caracteres por plantilla.

## Archivos relacionados

- `frontend/src/modules/ajustes/MessageTemplatesSettings.jsx`
- `frontend/src/modules/system-update/version.js`
- `backend/app/routers/ajustes/message_templates.py`
- `backend/app/services/whatsapp_automatizadovip_templates.py`

## Respaldo

Antes de incorporar el editor de iconos se conservaron copias de seguridad de los archivos modificados, siguiendo la regla de continuidad del proyecto.

## Validación realizada

- Se verificó el código final publicado de `MessageTemplatesSettings.jsx`.
- Se verificó que existe un botón independiente de **Iconos / Emojis** para cada plantilla.
- Se verificó que la inserción usa la posición actual del cursor/selección del textarea.
- Se verificó que el guardado continúa utilizando el endpoint existente de plantillas.
- Se verificó que `version.js` queda en **1.2.98** y que el CHANGELOG contiene únicamente la versión actual.
- No se afirma una prueba de envío real de WhatsApp en esta entrega; esa validación sigue pendiente de un envío controlado.

## Versionado

La funcionalidad se publica como **Z-Hub 1.2.98**.

El cambio funcional anterior de plantillas amigables quedó documentado históricamente como 1.2.96 y la corrección de numeración posterior como 1.2.97. Esta entrega 1.2.98 corresponde al editor visual de iconos/emojis.

## Estado

**Publicado en `main`.**

Commit del cambio funcional de iconos/emojis: `1ef4485686cfd67a61bc7ea86336be5824453938`.

Commit de versionado 1.2.98: `2aafaa5b4b78890a1e5ec5d3ba28c02f5a7e15ba`.

## Pendiente

Realizar un envío controlado por WhatsApp para comprobar visualmente que los emojis seleccionados se reciben correctamente en el dispositivo del cliente y no alteran el renderizado de variables/formato.
