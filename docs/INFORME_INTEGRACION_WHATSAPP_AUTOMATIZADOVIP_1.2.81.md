# Informe — Integración WhatsApp AutomatizadoVIP 1.2.81

Fecha: 2026-09-11

## Implementación

Z-Hub incorpora una integración V2 con `https://api.automatizado.vip/api/whatsapp/send` usando `POST`, header `Api-key`, cuerpo `contact[]` y `verify` como parámetro JSON, según la configuración proporcionada desde WispHub.

## Componentes

### Backend

- Cliente aislado `backend/app/services/whatsapp_automatizadovip.py`.
- Router protegido `backend/app/routers/whatsapp_automatizadovip/router.py`.
- Historial SQL `backend/app/models/whatsapp_automatizadovip_log.py`.
- API de historial `backend/app/routers/whatsapp_automatizadovip/logs.py`.
- Worker `backend/app/services/whatsapp_automatizadovip_worker.py`.
- Helpers de automatización separados.
- `httpx` agregado a dependencias.

### Frontend

- Configuración separada de AutomatizadoVIP en Ajustes.
- Prueba de envío real.
- Envío automático desde Mensajería sin retirar el botón existente de WhatsApp Web/Móvil.
- Historial de envíos.
- Activación independiente de automatizaciones.

## Automatizaciones incluidas

- Recordatorio antes del vencimiento.
- Aviso de deuda vencida/corte.
- Confirmación automática de pago.
- Intervalo configurable del worker.
- Límite de mensajes por ciclo.
- Dedupe diario del mismo mensaje por cliente.

Todas las automatizaciones quedan **desactivadas por defecto**. La pasarela también queda desactivada hasta que el administrador la configure.

## Seguridad

- La API Key nunca se devuelve al navegador.
- Los endpoints requieren autenticación y permiso de Mensajería.
- La credencial real mostrada en la captura de configuración no se copió a GitHub.
- Se recomienda regenerar esa API Key en AutomatizadoVIP antes de utilizarla en producción, porque apareció visible en una captura compartida.

## Compatibilidad

El flujo anterior mediante `wa.me` permanece disponible. La integración nueva es adicional y puede probarse de forma controlada.

## Backups

Se guardaron respaldos antes de modificar archivos existentes, incluyendo `backend/server.py`, `backend/app/models/__init__.py`, `frontend/src/modules/ajustes/SettingsHome.jsx`, `SettingsModal.jsx`, `settingsSections.js`, `Messaging.jsx`, `backend/requirements.txt` y `frontend/src/modules/system-update/version.js`.

## Validación

Se agregó `backend/tests/test_whatsapp_automatizadovip_contract.py` para el contrato de número, límite de 1000 caracteres y estructura V2. No se realizó todavía un envío real contra AutomatizadoVIP ni una prueba en el servidor de producción; esa validación requiere colocar una API Key válida en Ajustes y usar un número de prueba autorizado.
