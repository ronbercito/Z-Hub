# Informe — Integración WhatsApp AutomatizadoVIP

Fecha: 2026-09-11

## Objetivo

Incorporar en Z-Hub una integración servidor-a-servidor con el gateway V2 de AutomatizadoVIP, sin retirar inicialmente el envío existente mediante WhatsApp Web.

## Contrato recibido

- Método: `POST`
- Gateway: `https://api.automatizado.vip/api/whatsapp/send`
- Header de autenticación: `Api-key`
- Body: `{ "contact": [{ "message": "...", "number": "..." }] }`
- Parámetro adicional: `verify=true`
- Código de país inicial: `51` (Perú)
- Límite de mensaje: 1000 caracteres

## Diseño

La API Key se conserva en `Setting.data` bajo una sección propia y nunca se devuelve al frontend. El backend es el único componente que llama a AutomatizadoVIP.

La implementación nueva está separada en:

- `backend/app/services/whatsapp_automatizadovip.py`
- `backend/app/routers/whatsapp_automatizadovip/router.py`
- `backend/app/routers/whatsapp_automatizadovip/logs.py`
- `backend/app/models/whatsapp_automatizadovip_log.py`
- `backend/app/services/whatsapp_automatizadovip_scheduler.py`
- `frontend/src/modules/ajustes/WhatsAppAutomatizadoVIPSettings.jsx`
- `frontend/src/modules/mensajeria/AutomatizadoVIPHistory.jsx`
- `frontend/src/modules/mensajeria/AutomatizadoVIPSendPanel.jsx`

## Seguridad

La API Key no se incluye en el código fuente, documentación ni respuestas públicas. La credencial mostrada en la captura de configuración debe regenerarse en AutomatizadoVIP antes de ponerla en producción.

## Compatibilidad

El módulo existente de Mensajería y el enlace `wa.me` no se eliminan en esta fase. La integración nueva puede activarse de forma independiente.

## Automatizaciones

Se incluyen helpers de renderizado para recordatorios de pago, avisos de corte y confirmaciones. La ejecución automática debe conectarse al scheduler/tareas de Z-Hub después de validar el gateway y el historial en el entorno real; no se deben disparar mensajes automáticos sin una prueba controlada.
