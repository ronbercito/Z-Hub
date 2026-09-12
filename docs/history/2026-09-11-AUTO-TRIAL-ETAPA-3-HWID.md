# Etapa 3/7 — HW-ID y cliente Auto-TRIAL Z-Hub

Fecha: 2026-09-11
Versión Z-Hub: 1.2.99

## Objetivo

Preparar Z-Hub para identificarse ante Web-Licence sin pedir una clave de licencia al usuario y sin enviar identificadores de hardware crudos.

## Implementado

- nuevo `backend/app/core/hardware_id.py`;
- combina `/etc/machine-id`, DMI `product_uuid`, DMI `product_serial` y MAC como señal adicional/fallback;
- normaliza y ordena las señales disponibles;
- envía/expone únicamente SHA-256 hexadecimal;
- nuevo `backend/app/core/auto_trial.py`;
- cliente HTTPS hacia `POST /v1/public/trials/activate`;
- envía correo, HW-ID, Installation ID y nombre de instalación;
- distingue rechazo comercial (`AutoTrialRejected`) de indisponibilidad temporal (`AutoTrialUnavailable`);
- no usa `curl -k` ni desactiva validación TLS;
- pruebas de contrato agregadas;
- versión incrementada a 1.2.99.

## Compatibilidad

El Setup Wizard no cambia todavía en esta etapa: la entrada manual de licencia permanece funcionando como en 1.2.98. La conexión visual/operativa del nuevo cliente Auto-TRIAL se realizará en Etapa 4/7.

## Arquitectura

El HW-ID no sustituye el `license_installation_id`. El HW-ID representa la identidad física/virtual estable utilizada para impedir múltiples TRIAL; el Installation ID sigue identificando una instalación concreta de Z-Hub y puede cambiar tras una reinstalación.
