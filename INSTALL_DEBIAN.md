# Guía de Instalación — Z-Hub (Debian 13 / 12 / Ubuntu)

Panel de gestión ISP: **React (frontend) + FastAPI (backend) + MariaDB (base de datos) + API MikroTik RouterOS (v6/v7)**.

---

## Estructura del proyecto

```
backend/
  server.py                     Punto de entrada FastAPI (uvicorn server:app)
  app/core/                     config (.env), database (MariaDB/SQLAlchemy), security (JWT/bcrypt), seed, utils
  app/models/                   Tablas SQL: user, plan, router, client, invoice, ticket, inventory, hotspot, task, setting
  app/routers/<modulo>/         Rutas por módulo
  app/integrations/mikrotik/    client.py (API RouterOS) y service.py (cortes, PPPoE, colas, perfiles)
  app/integrations/olt/         integraciones OLT VSOL
frontend/src/
  modules/<modulo>/             Una carpeta por módulo
  components/layout/            Sidebar, Navbar, Layout
  context/AuthContext.js        Sesión JWT y URL de la API
deploy/
  install.sh                    Instalador automático (idempotente)
  nginx/ supervisor/ mariadb/ env/   Plantillas de cada configuración
```

## Opción 1 — Instalación automática (recomendada)

```bash
# Como root en Debian/Ubuntu
apt-get update && apt-get install -y git
git clone https://github.com/ronbercito/Z-Hub.git /var/www/z-hub
bash /var/www/z-hub/install.sh
```

El instalador crea y utiliza exclusivamente rutas nuevas bajo `/var/www/z-hub` para Z-Hub y publica el frontend en `/var/www/z-hub/web`.

El script:
1. Instala Nginx, Supervisor, Python 3, Node.js 20, Yarn y **MariaDB**.
2. Crea la base `fibraz_isp_db` y el usuario `fibraz` con contraseña aleatoria.
3. Genera `backend/.env` (DATABASE_URL, JWT_SECRET aleatorio, admin inicial).
4. Instala dependencias Python, compila el frontend y lo publica en `/var/www/z-hub/web`.
5. Configura Supervisor (`zhub_backend`, 127.0.0.1:8001) y Nginx (`zhub`, puerto 80, `/api/` → backend).

Al terminar: **http://IP_DEL_SERVIDOR/** — usuario y contraseña se muestran al final del instalador.

### Actualizar a una nueva versión
```bash
cd /var/www/z-hub && git pull && bash install.sh
```

---

## Conectar tu MikroTik (RouterOS v6 / v7)

En el router (Winbox/terminal):
```routeros
/ip service set api disabled=no port=8728
# o mejor, API-SSL:
/ip service set api-ssl disabled=no port=8729
/user group add name=panel policy=read,write,api,test
/user add name=panel group=panel password=CLAVE_SEGURA
```
Luego en el panel → **Gestión de Red → Agregar Router / OLT**.

### Cómo trabaja el panel con el MikroTik
| Acción en el panel | Comando RouterOS |
|---|---|
| Crear/editar plan + *Sincronizar planes* | `/ppp profile add name=<plan> rate-limit=<subida>M/<bajada>M` |
| Crear cliente **PPPoE** | `/ppp secret add name=<usuario> password=... profile=<plan> remote-address=<ip>` |
| Crear cliente **IP Estática / DHCP** | `/queue simple add name=cli-<dni> target=<ip>/32 max-limit=<sub>/<baj>` |
| Corte cliente PPPoE | `/ppp secret set disabled=yes` + `/ppp active remove` |
| Corte cliente IP/DHCP | `/ip firewall address-list add list=morosos address=<ip>` |
| Reactivación / pago registrado | Operación inversa |

## Conectar tu OLT VSOL

Habilita Telnet o SSH en la OLT y registra la OLT desde **Gestión de Red → Agregar Router / OLT**. Las familias y comandos específicos se mantienen en `backend/app/integrations/olt/`.

## Opción 2 — Instalación manual resumida

```bash
apt-get install -y nginx supervisor python3 python3-venv python3-dev build-essential mariadb-server libmariadb-dev gettext-base
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm i -g yarn

mariadb -e "CREATE DATABASE fibraz_isp_db CHARACTER SET utf8mb4; CREATE USER 'fibraz'@'localhost' IDENTIFIED BY 'TU_CLAVE'; GRANT ALL ON fibraz_isp_db.* TO 'fibraz'@'localhost'; FLUSH PRIVILEGES;"

cd /var/www/z-hub/backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt

cd /var/www/z-hub/frontend
printf 'REACT_APP_BACKEND_URL=\n' > .env
yarn install && yarn build
mkdir -p /var/www/z-hub/web && cp -r build/. /var/www/z-hub/web/

export APP_DIR=/var/www/z-hub WEB_ROOT=/var/www/z-hub/web
envsubst < deploy/supervisor/zhub_backend.conf.template > /etc/supervisor/conf.d/zhub_backend.conf
envsubst '$WEB_ROOT' < deploy/nginx/zhub.conf.template > /etc/nginx/sites-available/zhub
ln -sf /etc/nginx/sites-available/zhub /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default
supervisorctl reread && supervisorctl update && nginx -t && systemctl restart nginx
```

---

## Solución de problemas
- **404 Not Found (nginx)**: ejecuta `bash /var/www/z-hub/install.sh`.
- **Backend no arranca**: `tail -n 50 /var/log/zhub_backend.err.log` y verifica `DATABASE_URL` en `backend/.env`.
- **No conecta al MikroTik**: comprueba API/API-SSL, firewall y política `api` del usuario.
- **Respaldo de la base de datos**: `mariadb-dump fibraz_isp_db > respaldo_$(date +%F).sql`
