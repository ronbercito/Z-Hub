# Backup — Integración WhatsApp AutomatizadoVIP

Fecha: 2026-09-11

## Motivo

Respaldo documental previo a la implementación de la integración de envío automático de WhatsApp mediante AutomatizadoVIP.

## Alcance protegido

Antes de incorporar la integración se conserva como referencia el estado funcional de los módulos existentes relacionados con mensajería, ajustes y configuración del sistema.

Archivos existentes que se tomarán como referencia antes de cualquier modificación:

- `frontend/src/modules/mensajeria/Messaging.jsx`
- `backend/app/routers/mensajeria/router.py`
- `backend/app/models/setting.py`
- archivos de registro de routers/configuración necesarios para integrar el nuevo módulo.

## Regla de implementación

La integración nueva se añadirá preferentemente mediante archivos separados y endpoints nuevos. No se reemplazará el flujo actual de WhatsApp Web hasta validar el nuevo flujo.

La API Key de AutomatizadoVIP no se almacena en este respaldo ni en GitHub.

## Estado anterior

- Mensajería existente: plantillas y envío mediante enlace `wa.me`.
- AutomatizadoVIP: no integrado todavía en Z-Hub.
- Automatizaciones de cobranza/corte/pago: no conectadas todavía al gateway.
