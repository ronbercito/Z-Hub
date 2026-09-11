# Z-Hub 1.2.62 — Trial vencido, activación y compra

## Objetivo
Cuando el Trial llegue a 0 días, el usuario autenticado debe ser llevado automáticamente a la pantalla de licencia para poder activar una clave pagada o iniciar el proceso comercial.

## Implementación
- Al entrar al panel se consulta `/api/license/info`.
- Si el estado es `trial_expired` o la instalación está en modo solo lectura, el panel abre automáticamente `Ajustes → Licencia Z-Hub`.
- Se mantiene el modo consulta y no se elimina ningún dato.
- El administrador puede ingresar una clave pagada en la misma pantalla.
- Se agregan dos acciones comerciales: `Pagar licencia` y `Contactar por WhatsApp`.
- El botón de WhatsApp prepara un mensaje indicando que el Trial finalizó y que se desea adquirir una licencia.
- Las URLs/números comerciales no quedan hardcodeados en React; se leen del backend desde variables de entorno.

## Variables de entorno
- `ZHUB_LICENSE_WHATSAPP`: número internacional solo para ventas/licencias, por ejemplo `519XXXXXXXX`.
- `ZHUB_LICENSE_PAYMENT_URL`: enlace HTTPS de checkout/pago.

Si una de estas variables no está configurada, su botón se muestra deshabilitado para evitar enviar al usuario a un destino incorrecto.

## Backup
`backup/pre-license-expired-redirect-1.2.61-20260910`

## Estado
Ajuste publicado como Z-Hub 1.2.62. Este flujo queda preparado para que en la Etapa 6 el License Server remoto entregue también la información comercial sin cambiar la interfaz.
