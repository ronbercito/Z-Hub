# Z-Hub 1.2.66 — Licencias Etapa 6/7: License Server remoto

## Base funcional
La Etapa 6 se implementa sobre el contrato definido en `Z-Hub — Plan de implementación del sistema de licencias`: Z-Hub sigue Self-Hosted, MikroTik/OLT y datos operativos continúan locales, y el VPS se utiliza únicamente para licenciamiento.

## Implementación en Z-Hub local
- Nuevo `backend/app/core/license_remote.py`.
- Consulta HTTPS a `POST /v1/licenses/validate`.
- Identificador persistente `license_installation_id` por instalación.
- Verificación de autorización JWT RS256 mediante clave pública.
- Caché local en `/var/lib/zhub/license/authorization.jwt`.
- Un rechazo HTTP 4xx explícito del License Server invalida y no usa caché.
- Una caída temporal/5xx puede usar la última autorización firmada aún válida.
- Mientras se completa la migración productiva, si todavía no existe una autorización remota utilizable se conserva el registro local como transición.
- El plan y `max_clients` recibidos remotamente actualizan el snapshot local, permitiendo ampliar capacidad sin reinstalar.

## License Server para VPS
Se agregó `license_server/` con:
- FastAPI privada;
- SQLite como base inicial;
- tabla de licencias;
- tabla de instalaciones autorizadas;
- historial de validaciones;
- emisión RS256;
- período de gracia configurable (72 h por defecto);
- endpoints administrativos temporales protegidos por Bearer token;
- plantillas systemd y Nginx/HTTPS;
- script de generación de claves RSA.

## Seguridad
- La clave privada solo existe en el VPS.
- Las instalaciones Z-Hub reciben únicamente la clave pública.
- Licencia e instalación deben estar activas en el servidor para emitir una autorización.
- No se modifica tráfico ni integración de MikroTik/OLT.
- No se eliminan clientes, facturas ni configuraciones por una caída del License Server.

## Transición
`license_fallback.txt` y `/etc/zhub/licencia/licencias.txt` permanecen temporalmente disponibles. El contrato original indica retirarlos como mecanismo productivo únicamente después de validar el License Server real en VPS.

## Backup
`backup/pre-license-stage6-1.2.65-20260910`

## Pendiente operativo para cerrar completamente la Etapa 6
El código y los artefactos de despliegue están listos, pero falta desplegar el servicio en el VPS real, asignar dominio/subdominio, habilitar HTTPS, instalar la clave pública en la instalación Z-Hub y registrar/autorizar la instalación actual. Hasta completar esa validación real no debe eliminarse el fallback local.

## Versión
Z-Hub 1.2.66.
