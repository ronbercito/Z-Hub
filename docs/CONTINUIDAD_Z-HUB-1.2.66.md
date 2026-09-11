# Continuidad Z-Hub 1.2.66

Estado: Etapa 6/7 implementada a nivel de código y preparada para despliegue real en VPS.

## Último punto estable
- Versión anterior validada visualmente: 1.2.65.
- Backup previo: `backup/pre-license-stage6-1.2.65-20260910`.

## Cambios 1.2.66
- Cliente remoto de License Server con HTTPS.
- Autorizaciones RS256 verificadas con clave pública.
- Caché firmada para continuidad temporal.
- `license_installation_id` persistente por instalación.
- License Server independiente bajo `license_server/` con SQLite, historial, licencias e instalaciones autorizadas.
- Plantillas de systemd/Nginx y generación de claves.
- Setup y cambio de licencia usan la fuente unificada de Etapa 6.

## Regla de transición
No retirar todavía `license_fallback.txt` ni el registro privado local. Solo deben dejar de ser mecanismo productivo después de desplegar y validar el VPS real.

## Próximo paso
Desplegar `license_server/` en el VPS, definir dominio/subdominio, habilitar HTTPS, generar claves, copiar `public.pem` a Z-Hub, configurar `ZHUB_LICENSE_SERVER_URL`, registrar la licencia e instalación actual y validar online + caída simulada dentro del período de gracia.

Documento detallado: `docs/INFORME_LICENCIAS_ETAPA6_1.2.66.md`.
