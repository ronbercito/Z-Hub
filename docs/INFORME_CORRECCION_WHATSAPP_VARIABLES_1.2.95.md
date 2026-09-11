# Informe — Z-Hub 1.2.95

## Corrección de variables en WhatsApp AutomatizadoVIP

### Problema observado

Al enviar una automatización de WhatsApp, los valores dinámicos podían llegar con llaves visibles, por ejemplo:

`{Jaime Leyton Pardo}`

`{Fibra Z}`

`{10 de este mes}`

`{941932971}`

Esto ocurría porque el editor admite plantillas heredadas con `{variable}`, mientras que el renderer WispHub principal resolvía únicamente `{{variable}}`.

### Corrección

Se modificó `backend/app/services/whatsapp_template_renderer.py` para que el punto común de renderizado resuelva ambas formas:

- `{{variable}}` — sintaxis WispHub actual.
- `{variable}` — sintaxis heredada de Z-Hub y plantillas ya guardadas.

Ambas formas producen el mismo valor final y no dejan llaves alrededor del resultado.

`render_legacy_template()` también delega ahora en el mismo renderer común, evitando dos comportamientos distintos.

### Flujo afectado

La corrección se aplica al flujo común utilizado por:

- prueba manual de `automation_test.py`;
- worker de AutomatizadoVIP;
- recordatorio de pago;
- aviso de corte;
- confirmación de pago.

No se modificó la plantilla del usuario ni el contrato de envío de AutomatizadoVIP.

### Versión

**Z-Hub 1.2.95**

### Respaldo

Antes del cambio se creó la rama:

`backup/pre-whatsapp-variable-render-20260911`

basada en `main` versión 1.2.94.

### Pendiente de validación operacional

La corrección está publicada en `main`, pero la prueba final debe ejecutarse en la instalación donde se realiza el envío real: generar una vista previa/prueba forzada y confirmar que WhatsApp recibe el texto sin `{...}` alrededor de los valores.

No se declara una prueba real de envío como realizada hasta observar el mensaje final en WhatsApp.