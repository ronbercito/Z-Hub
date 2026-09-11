# Continuidad Z-Hub 1.2.67

Estado: License Server Etapa 6/7 operativo a nivel de código y ampliado con una primera interfaz web de administración central.

## Base estable previa
- Z-Hub 1.2.66.
- Backup creado antes de modificar: `backup/pre-license-center-web-1.2.67-20260910`.
- El contenedor de laboratorio Debian 13 usa IP `192.168.10.240` y ya respondió `GET /health` con HTTP 200 antes de esta ampliación.

## Cambios 1.2.67
- Nuevo `/admin-ui` en el License Server.
- Dashboard: clientes/ISP, licencias activas, instalaciones activas y validaciones de 24 h.
- Gestión de clientes/ISP: empresa, contacto, correo, teléfono, RUC/DNI y estado.
- Gestión de licencias: crear/editar/eliminar, cliente asociado, tipo, plan, `max_clients`, activar/suspender.
- Gestión de instalaciones: autorizar/editar/eliminar, nombre descriptivo y estado.
- Historial de validaciones visible desde la web.
- Migración SQLite no destructiva: crea `customers` y agrega columnas faltantes a bases 1.0 existentes.
- License Server `APP_VERSION=1.1.0`.
- Z-Hub `PANEL_VERSION=1.2.67`.

## Seguridad
- El License Center usa `ZHUB_LICENSE_ADMIN_TOKEN` para `/admin/*`.
- El navegador conserva el token únicamente en `sessionStorage` durante la sesión.
- Para Internet se debe habilitar HTTPS antes de usar la interfaz administrativa remotamente.
- `private.pem` permanece exclusivamente en el servidor de licencias.
- Z-Hub local seguirá recibiendo únicamente `public.pem`.
- No se envían datos MikroTik/OLT ni la base operativa de abonados al License Server.

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/index.html`
- `license_server/static/styles.css`
- `license_server/static/app.js`
- `license_server/README.md`
- `backend/tests/test_license_center_web_contract.py`
- `.github/workflows/quality.yml`
- `frontend/src/modules/system-update/version.js`
- `docs/INFORME_LICENSE_CENTER_WEB_1.2.67.md`

## Prueba siguiente en laboratorio
En `web-licencia`:
1. detener el Uvicorn manual actual si sigue corriendo;
2. `cd /opt/zhub-license-src && git pull origin main`;
3. arrancar otra vez Uvicorn con `server.env` cargado;
4. comprobar `GET /health` y versión `1.1.0`;
5. abrir `http://192.168.10.240:8090/admin-ui` temporalmente para prueba LAN;
6. ingresar con el token administrativo rotado;
7. crear Cliente/ISP → Licencia → Instalación;
8. probar `/v1/licenses/validate` y comprobar autorización RS256;
9. suspender/reactivar desde la web y verificar el comportamiento.

## Pendiente antes de producción
- convertir Uvicorn a servicio systemd;
- colocar Nginx delante del backend;
- asignar dominio/subdominio;
- habilitar HTTPS válido;
- copiar solo `public.pem` a Z-Hub;
- configurar Z-Hub 1.2.67 con la URL HTTPS final;
- retirar el fallback local solo después de validar el flujo remoto completo.

## Próximo punto
No iniciar todavía funciones adicionales de Etapa 7 avanzada. Primero validar visual y funcionalmente este License Center inicial en el contenedor Debian 13 y cerrar la Etapa 6 con HTTPS + conexión real de Z-Hub.
