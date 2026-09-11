# Z-Hub — Bitácora de continuidad WhatsApp 1.2.96

**Fecha:** 2026-09-11  
**Versión:** 1.2.96  
**Área:** Mensajería / AutomatizadoVIP

## Objetivo

Probar una presentación de WhatsApp más amigable, personal y visual para aumentar la atención del cliente sin saturar el mensaje.

## Cambio publicado

Se actualizaron las plantillas predeterminadas de `backend/app/services/whatsapp_automatizadovip_templates.py`:

- `payment_reminder`: saludo personalizado, empresa, total, vencimiento, YAPE/PLIN, transferencia, comprobante y cierre amable.
- `cut_warning`: tono preventivo y de ayuda, evitando un mensaje innecesariamente agresivo.
- `payment_confirmation`: confirmación positiva y clara.
- `maintenance`: aviso estructurado con fecha y horario.

El recordatorio dejó de mostrar `fecha_corte` porque actualmente el worker estaba enviando `invoice.due_date` como `cutoff_date`; no se debe presentar como día de corte un valor que en realidad corresponde al vencimiento.

## Compatibilidad

Se conserva el renderer común y la compatibilidad con `{{variable}}` y `{variable}`. Las nuevas plantillas usan variables que ya existen en `render_automation_template`.

## Backup previo

`docs/backups/1.2.96/whatsapp_automatizadovip_templates.py.before-friendly-message.bak`

La copia contiene exactamente las plantillas anteriores al cambio y permite restaurar el diseño previo.

## Validación

- Se revisó el diff publicado en `608250ea45953c99f9afcf4e208745d18cd5040c`.
- Se confirmó previamente un mensaje real renderizado correctamente con nombre, empresa, monto, vencimiento y YAPE/PLIN.
- Se agregó el informe `docs/INFORME_WHATSAPP_AMIGABLE_1.2.96.md`.
- Se actualizó `frontend/src/modules/system-update/version.js` manteniendo `PANEL_VERSION = 1.2.96` y registrando este cambio en el CHANGELOG.
- Pendiente: enviar un mensaje controlado con las nuevas plantillas y observar el texto final directamente en WhatsApp.

## Estado

**Publicado en `main`.**

Commits relacionados:

- `608250ea45953c99f9afcf4e208745d18cd5040c` — plantillas amigables.
- `ad691c35ef655352787d638c859747ca0eca2196` — informe documental.
- `2371e68072ca4face026ec330601906820abd875` — CHANGELOG 1.2.96.
