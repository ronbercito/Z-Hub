# Guía de Instalación — Z-Hub (Debian 13 / 12 / Ubuntu)

Panel de gestión ISP: **React + FastAPI + MariaDB + MikroTik RouterOS + integración OLT**.

## Estructura principal

```text
backend/
  server.py                     Entrada FastAPI (uvicorn server:app)
  app/core/                     configuración, base de datos, seguridad, permisos y utilidades
  app/models/                   modelos SQLAlchemy
  app/routers/                  APIs por módulo
  app/integrations/mikrotik/    API RouterOS
  app/integrations/olt/         integración OLT
frontend/src/
  modules/                      módulos React
  components/layout/            Sidebar, Navbar y Layout
  context/AuthContext.js        sesión mediante cookie httpOnly + compatibilidad en memoria
deploy/
  install.sh                    instalador/despliegue real
  nginx/ supervisor/ mariadb/ env/
```

## Instalación automática recomendada

```bash
apt-get update && apt-get install -y git
git clone https://github.com/ronbercito/Z-Hub.git /var/www/z-hub
bash /var/www/z-hub/install.sh
```

El instalador trabaja bajo `/var/www/z-hub` y publica el frontend en `/var/www/z-hub/web`.

Actualmente el instalador:

1. instala Nginx, Supervisor, Python, Node.js 20, Yarn y MariaDB;
2. crea/actualiza la base **`zhub`** y el usuario MariaDB **`zhub`**;
3. genera `backend/.env` con contraseña DB aleatoria, `JWT_SECRET` y una clave separada `APP_ENCRYPTION_KEY`;
4. define `APP_TIMEZONE=America/Lima` por defecto;
5. instala dependencias, compila React y publica el build;
6. configura `zhub_backend` en `127.0.0.1:8001` y Nginx en puerto 80;
7. verifica `/api/health` antes de declarar la instalación terminada;
8. deja `backend/.env` con permisos **600** y no aplica permisos 755 indiscriminadamente a los secretos;
9. deja el asistente web para activar licencia y crear la primera cuenta administradora. **No existen credenciales admin predeterminadas.**

Al terminar abre:

```text
http://IP_DEL_SERVIDOR/
```

## Actualizar

La forma habitual desde el servidor es:

```bash
cd /var/www/z-hub
bash install.sh
```

`install.sh` sincroniza con `origin/main` antes de ejecutar el despliegue, salvo durante un rollback controlado con `ZHUB_SKIP_GIT_SYNC=1`.

El Centro de Actualización del panel utiliza su flujo transaccional y restaura el commit anterior si el instalador falla.

## HTTPS

El despliegue base funciona por HTTP. Cuando Nginx quede publicado correctamente por HTTPS, establece en `backend/.env`:

```env
SESSION_COOKIE_SECURE="true"
```

y reinicia `zhub_backend`. No actives esta opción si todavía accedes al panel únicamente por HTTP, porque el navegador no enviará una cookie `Secure` mediante HTTP.

## MikroTik RouterOS v6/v7

Ejemplo mínimo:

```routeros
/ip service set api disabled=no port=8728
# Preferible cuando esté correctamente configurado:
/ip service set api-ssl disabled=no port=8729
/user group add name=panel policy=read,write,api,test
/user add name=panel group=panel password=CLAVE_SEGURA
```

Luego registra el equipo desde **Gestión de Red**.

Z-Hub 1.2.37 no confirma localmente un corte, reactivación o eliminación si MikroTik devuelve fallo. En pagos, el hecho financiero sí se conserva; si la restauración RouterOS falla el cliente permanece suspendido y se informa la incidencia.

## OLT

Registra la OLT desde **Gestión de Red**. Las familias/comandos soportados están implementados en `backend/app/integrations/olt/` y sus routers asociados.

## Instalación manual resumida

Para una instalación nueva, se recomienda el instalador automático porque además aplica permisos y genera secretos. Si se necesita preparar MariaDB manualmente:

```bash
mariadb -e "CREATE DATABASE zhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'zhub'@'localhost' IDENTIFIED BY 'TU_CLAVE'; GRANT ALL ON zhub.* TO 'zhub'@'localhost'; FLUSH PRIVILEGES;"
```

Después debe crearse `backend/.env` con, como mínimo, `DATABASE_URL`, `JWT_SECRET`, `APP_ENCRYPTION_KEY` y `APP_TIMEZONE`, instalar `backend/requirements.txt`, compilar el frontend y configurar Supervisor/Nginx usando las plantillas de `deploy/`.

## Solución de problemas

- **404 Nginx:** `bash /var/www/z-hub/install.sh` y revisar `/var/log/zhub_install.log`.
- **Backend no arranca:** `tail -n 50 /var/log/zhub_backend.err.log`.
- **MariaDB:** comprobar `DATABASE_URL` sin imprimir contraseñas en registros públicos.
- **MikroTik:** comprobar API/API-SSL, firewall, IP/puerto y permisos del usuario RouterOS.
- **Backup DB:** `mariadb-dump zhub > respaldo_$(date +%F).sql`.
- **Permisos del secreto:** `stat -c '%a %U:%G %n' /var/www/z-hub/backend/.env` debe mostrar modo `600` después del instalador 1.2.37.
