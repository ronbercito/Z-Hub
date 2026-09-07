<!--
Archivo: docs/CONTINUIDAD_PARA_COPILOT_2026-09-07.md
Actualización: 2026-09-07 — agrega configuración local, checklist de despliegue e incidencias recientes para Copilot.
Función: entrega a Copilot el contexto técnico para localizar errores en su módulo propietario y aplicar correcciones verificables.
Recibe de: estructura actual del repositorio, cambios publicados en main y evidencias de la interfaz del panel.
Entrega a: mantenedores/IA de GitHub una guía de intervención; no ejecuta ni modifica el despliegue.
-->

# MikroHub — continuidad detallada para GitHub Copilot

## 1. Regla central de mantenimiento

Repositorio: `ronbercito/mirkohub`  
Rama de publicación: `main`

MikroHub está separado en **contenedores funcionales** (carpetas/módulos). Cada función, error y solución debe localizarse primero en el contenedor dueño del comportamiento. No se deben hacer cambios globales “a ciegas” en Layout, App, backend o despliegue si el defecto pertenece a Clientes, Red, Facturación, etc.

Un error puede aparecer en pantalla en un módulo y tener su causa en otro; por ello Copilot debe seguir esta cadena antes de modificar:

```
Vista React → llamada API → router FastAPI → modelo/base de datos o integración → compilación/despliegue
```

Ejemplos:

- Una pantalla React en blanco suele ser error de importación, JSX, estado o datos no controlados en el componente de esa pestaña.
- Un guardado que falla puede ser formulario frontend, validación del router o tabla/modelo.
- Una actualización que dice una versión y el pie del panel otra corresponde a la separación entre backend/Git y los archivos estáticos React publicados por Nginx.
- Un cambio de router, IP, plan, NAP u ONU no debe alterarse solo visualmente: debe validar y aplicar la lógica del módulo Clientes y la integración técnica correspondiente.

## 2. Contenedores del frontend

Ruta base: `frontend/src/`

| Contenedor | Responsabilidad | Origen de datos / destino | Límites de modificación |
|---|---|---|---|
| `modules/auth/` | Inicio/cierre de sesión, token y acceso inicial. | Consume autenticación backend; entrega sesión a contexto/layout. | No mezclar aquí permisos de negocio de cada módulo. |
| `modules/inicio/` | Dashboard y resumen inicial. | Consume indicadores API; entrega lectura al administrador. | No debe alterar clientes, facturas ni red. |
| `modules/clientes/` | Registro, listado, ficha y edición de abonados. | Consume `/api/clients`; entrega operaciones de cliente, servicio, facturas/tickets relacionados. | No duplicar validaciones técnicas solo en React; el backend debe ser fuente de verdad. |
| `modules/planes/` | Catálogo de planes/tarifas. | Planes usados por Clientes y Facturación. | Cambiar un plan no debe modificar automáticamente clientes existentes sin regla explícita. |
| `modules/facturacion/` | Facturas, cobros y deuda. | Consume rutas de facturas/pagos; muestra resultado a Cobros/Admin. | No guardar pagos desde componentes ajenos sin usar API de facturación. |
| `modules/tickets/` | Soporte e incidencias. | Consume API de tickets; entrega seguimiento. | No mezclar con el log técnico del router. |
| `modules/mensajeria/` | Mensajes y notificaciones. | Datos de clientes y configuración SMTP/proveedores. | Debe manejar errores de proveedor sin derribar la aplicación. |
| `modules/red/` | Routers, OLT, IPv4, NAP, zonas y monitoreo. | Consume API/red e integraciones. | Operaciones de red requieren permisos y validación backend. |
| `modules/hotspot/` | Fichas/operación Hotspot. | Consume API específica de hotspot. | Aislar sus estados y efectos; no afectar dashboard global. |
| `modules/almacen/` | Inventario/almacén. | Consume API de inventario. | No modificar facturación salvo flujo explícito. |
| `modules/tareas/` | Tareas operativas. | Consume API de tareas. | Mantener independiente de tickets aunque ambos tengan responsables. |
| `modules/ajustes/` | Configuración de empresa, logo, SMTP, Google Maps y restricciones. | Consume API de ajustes; entrega configuración compartida. | Debe validar y guardar por sección, sin sobrescribir configuración no relacionada. |
| `modules/system-update/` | Centro de actualizaciones y versión visible. | Habla con `/api/system-update`; entrega estado al Layout. | No expone hashes Git, logs o errores técnicos al usuario final. |

### Componentes compartidos frontend

- `components/layout/`: navegación, barra superior, menú, contenedor principal y pie de versión. Es consumidor de los módulos; no es el lugar para implementar la lógica interna de Clientes/Red/Facturación.
- `components/ui/`: controles visuales reutilizables. Solo deben contener comportamiento genérico, no reglas de negocio.
- `context/`: estado transversal, por ejemplo autenticación y configuración compartida.

## 3. Contenedores del backend

Ruta base: `backend/app/`

| Contenedor | Responsabilidad | Origen / destino |
|---|---|---|
| `core/` | Configuración, seguridad, JWT, dependencias y conexión transversal. | Recibe variables de entorno; entrega autenticación/configuración a routers. |
| `models/` | Modelos ORM y relaciones de base de datos. | Representa tablas de clientes, usuarios, routers, facturas, tickets, etc. |
| `routers/` | API principal por dominio: clientes, red, facturación, tickets, ajustes, autenticación, etc. | Recibe HTTP del frontend; valida, consulta modelos e invoca servicios. |
| `modules/` | Funciones aisladas que no encajan en un router general. | Actualmente incluye, entre otros, `system_update/` y espacio de trabajo de cliente. |
| `integrations/` | Comunicación con sistemas externos: MikroTik, OLT VSOL/ZTE y servicios técnicos. | Recibe acción validada de routers; entrega datos/resultado normalizado. |

Punto de arranque: `backend/server.py`. Registra routers y módulos. Un router nuevo no funcionará si no se importa/registra aquí.

## 4. Módulo Clientes: estado y precauciones

### Archivos de interés

- `frontend/src/modules/clientes/Clients.jsx`: listado y acción para abrir ficha.
- `frontend/src/modules/clientes/ClientDetail.jsx`: ficha por pestañas.
- `backend/app/routers/clientes/router.py`: API de clientes; `GET /api/clients/{id}` entrega la ficha y `PUT /api/clients/{id}` aplica validaciones/actualización.
- `backend/app/models/`: datos persistentes de cliente, plan, red/NAP, facturas, tickets y actividades.

### Pestañas de ficha

- Resumen: datos personales y estado de cuenta.
- Servicio: plan, router, red/IP, PPPoE, fibra/NAP/ONU o inalámbrico.
- Facturación: facturas, pagos y deuda.
- Tickets: incidencias del cliente.
- Email y SMS: en revisión.
- Documentos: en revisión.
- Estadísticas y Log: lectura de indicadores y actividades.

### Error previo y corrección aplicada

Los componentes experimentales de **Email y SMS** y **Documentos** podían dejar toda la aplicación React en negro al abrirlos. La causa fue un error de codificación dentro de esa ruta visual (importaciones/componentes nuevos no suficientemente validados).

Como recuperación estable se modificó `ClientDetail.jsx`:

1. Se retiraron temporalmente las importaciones y renderizado de `ClientCommunications` y `ClientDocuments`.
2. Ambas pestañas quedaron visibles, pero muestran un estado seguro “módulo en revisión”.
3. No se eliminó información de clientes ni se alteraron las demás pestañas.
4. No reactivar esos componentes sin compilar el frontend y probar abrir/cerrar cada pestaña con datos reales.

La persistencia futura se inició en:

- `backend/app/models/client_communication.py`
- `backend/app/models/client_document.py`
- `backend/app/modules/client_workspace/router.py`
- `frontend/src/modules/clientes/editor/ClientCommunications.jsx`
- `frontend/src/modules/clientes/editor/ClientDocuments.jsx`

Copilot debe revisar dichos componentes de forma aislada antes de conectarlos otra vez a `ClientDetail.jsx`.

## 5. Módulo de actualizaciones: diseño actual

### Archivos

| Archivo | Responsabilidad |
|---|---|
| `frontend/src/modules/system-update/version.js` | Fuente única de `PANEL_VERSION` y `CHANGELOG`. |
| `frontend/src/modules/system-update/UpdateCenter.jsx` | Ventana de comprobar/instalar, confirmación, progreso y cierre de sesión. |
| `backend/app/modules/system_update/router.py` | `GET /api/system-update/status` y `POST /api/system-update/install`; consulta Git y entrega estado seguro. |
| `backend/app/modules/system_update/run_update.sh` | Ejecuta la actualización, registra `PROGRESS`, permite rollback si falla. |
| `setup_debian.sh` | Sincroniza checkout con `origin/main` y llama al instalador. |
| `deploy/setup_debian.sh` | Instala dependencias, compila frontend, copia build, reinicia backend/Nginx. |
| `deploy/nginx/mikrosmart.conf.template` | Sirve React desde `/var/www/mikrosmart_web` y redirige `/api/` al backend. |

### Flujo

1. El administrador pulsa **Comprobar**.
2. Backend ejecuta `git fetch origin main`, compara `HEAD` y `origin/main`.
3. Backend lee `version.js` desde ambos commits y devuelve versión/changelog.
4. Si existen commits nuevos, frontend muestra actualización disponible.
5. Administrador confirma **Actualizar**.
6. `run_update.sh` guarda commit previo, descarga, aplica `origin/main`, ejecuta `setup_debian.sh` y publica progreso.
7. Si falla, restaura el commit previo e intenta reinstalarlo.
8. Si funciona, el frontend llega a 100% y cierra sesión.
9. Al nuevo ingreso, el navegador debe descargar el build React nuevo.

### Regla obligatoria de versiones

Toda entrega funcional debe:

1. Cambiar los archivos del módulo dueño.
2. Incluir comentario inicial: actualización, propósito, recibe/de dónde viene, entrega/a dónde va.
3. Incrementar `PANEL_VERSION` en `version.js`.
4. Escribir `CHANGELOG` entendible para el administrador, sin hash Git ni consola.
5. Publicar en `main`.
6. Verificar los archivos publicados.
7. Probar comprobar → actualizar → sesión cerrada → nuevo ingreso → versión visual correcta.

## 6. Última intervención: versión 1.0.15 y discrepancia visual

### Publicación

Se publicó `frontend/src/modules/system-update/version.js` con:

- Versión: **1.0.15**
- Propósito: prueba de detección, instalación y cierre de sesión.
- Commit de publicación: `b0e33827beddc0634737efa8bff87c9b8728937e`.

La versión anterior 1.0.14 contenía la edición de la pestaña Servicio.

### Síntoma observado

El módulo de actualizaciones mostró “Panel MikroHub · versión 1.0.14” y “actualizado”, pero el pie del frontend mostró “Panel MikroHub · v1.0.13”.

El pie se forma en `frontend/src/components/layout/Layout.jsx`, que importa `PANEL_VERSION` desde `modules/system-update/version.js`. Eso significa que el texto del pie procede del **bundle React estático cargado por el navegador**.

Por otra parte, el backend del módulo consulta la fuente versionada mediante:

```python
git show HEAD:frontend/src/modules/system-update/version.js
```

Por tanto, el backend/Git puede informar 1.0.14 o 1.0.15, mientras el navegador aún muestra un bundle 1.0.13. Esta diferencia no debe ocultarse ni llamarse “resuelta” hasta comprobar el frontend publicado.

### Causa probable

Una de estas dos:

1. Caché del navegador conserva el `index.html` o los archivos iniciales de React.
2. `deploy/setup_debian.sh` no recompiló o no copió el build actualizado a `/var/www/mikrosmart_web`.

### Verificación solicitada a Copilot

Después de actualizar, ejecutar:

```bash
cd /var/www/mikrohub
git rev-parse --short HEAD
grep PANEL_VERSION frontend/src/modules/system-update/version.js
grep -R "PANEL_VERSION" /var/www/mikrosmart_web/static/js 2>/dev/null | head
ls -la /var/www/mikrosmart_web
```

- Si el código fuente y build son 1.0.15 pero la web muestra 1.0.13: recarga forzada del navegador (Ctrl+F5 / Ctrl+Shift+R) y revisar cabeceras de caché.
- Si la fuente es 1.0.15 y el build servido conserva 1.0.13: ejecutar `bash setup_debian.sh` y revisar el resultado de `yarn build` y la copia a `/var/www/mikrosmart_web`.
- Si después persiste: revisar Nginx y eliminar caché de `index.html` mediante encabezado `Cache-Control: no-cache`; mantener caché larga solo para `/static/` con archivos hash.

Propuesta de configuración Nginx que Copilot debe revisar antes de publicar:

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    try_files $uri =404;
}

location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Cualquier corrección de Nginx/despliegue debe ser una nueva versión (por ejemplo 1.0.16) y pasar `nginx -t`.

## 7. Método de corrección que debe seguir Copilot

1. Confirmar qué módulo es dueño del síntoma.
2. Leer primero el componente frontend y su router backend correspondiente.
3. Identificar el error con evidencia: consola React, respuesta API, log backend o log de despliegue.
4. Corregir en el archivo dueño, no en un contenedor no relacionado.
5. Mantener contratos API y datos existentes.
6. Añadir comentarios de actualización, origen y destino a cada archivo tocado.
7. Ejecutar compilación/pruebas relevantes.
8. Liberar con versión y changelog.
9. Verificar la operación real del panel después del despliegue.

## 8. Prohibiciones de mantenimiento

- No eliminar datos ni tablas para resolver un fallo visual.
- No reiniciar/borrar configuración de red para arreglar un formulario.
- No usar el Layout como reemplazo de la lógica del módulo afectado.
- No reactivar Email/SMS o Documentos sin pruebas de compilación y navegación.
- No decir que una actualización está instalada solo porque Git avanzó: confirmar build React y versión visual.
- No subir cambios funcionales sin versión visible en `version.js`.


## 9. Configuración de desarrollo local

> Esta sección describe el estado actual del repositorio. No se debe subir `backend/.env` ni contraseñas reales a GitHub.

### Requisitos

- Python 3 con `venv`.
- Node.js y Yarn 1.x (el proyecto declara Yarn 1.22.22).
- MariaDB/MySQL para un entorno igual al servidor.
- Git.

### Variables del backend

El ejemplo existente es `deploy/env/backend.env.example`. Copiarlo a `backend/.env` y reemplazar sus valores de ejemplo:

| Variable | Función |
|---|---|
| `DATABASE_URL` | URL de conexión SQLAlchemy a MariaDB/MySQL. |
| `JWT_SECRET` | Clave privada usada para firmar tokens JWT. Debe ser única y no compartirse. |
| `ADMIN_EMAIL` | Cuenta administrativa inicial. |
| `ADMIN_PASSWORD` | Clave de la cuenta administrativa inicial; cambiarla antes de operar. |
| `CORS_ORIGINS` | Orígenes permitidos para el frontend. En desarrollo puede necesitar incluir la URL del dev server. |
| `MIKROTIK_TIMEOUT` y `MIKROTIK_CUT_LIST` | Parámetros de integración MikroTik, cuando correspondan. |

### Arranque backend

```bash
cd backend
cp ../deploy/env/backend.env.example .env
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

La API se sirve bajo el prefijo `/api`; comprobar `http://localhost:8000/api/health`.

### Arranque frontend

```bash
cd frontend
printf 'REACT_APP_BACKEND_URL=http://localhost:8000\n' > .env
yarn install
yarn start
```

`AuthContext.js` arma la URL como `REACT_APP_BACKEND_URL + /api`. El `craco.config.js` actual **no define un proxy API explícito**; por ello, en desarrollo debe usarse `REACT_APP_BACKEND_URL=http://localhost:8000` o configurar un proxy de forma consciente sin afectar producción.

### Pruebas

- Backend: existen pruebas bajo `backend/tests/`; algunas requieren `REACT_APP_BACKEND_URL` porque prueban contra una API accesible. Revisar cada prueba antes de ejecutarla como si fuera un test unitario aislado.
- Frontend: el proyecto tiene `yarn test` (CRACO/Jest). Si se agregan componentes nuevos, crear pruebas de renderizado/navegación o compilar como mínimo antes de publicar.
- Compilación obligatoria antes de una entrega frontend:

```bash
cd frontend
yarn build
```

## 10. Checklist de despliegue posterior a una actualización

Ejecutar y comprobar en orden; no marcar una actualización como correcta solo por ver que Git avanzó.

- [ ] `git log --oneline -n 5` confirma el commit esperado.
- [ ] `grep PANEL_VERSION frontend/src/modules/system-update/version.js` coincide con la intención de la entrega.
- [ ] `yarn build` terminó correctamente. Tratar errores como bloqueantes; revisar warnings relevantes antes de publicar.
- [ ] `/var/www/mikrosmart_web` contiene el build nuevo y sus fechas/tamaños cambiaron.
- [ ] `nginx -t` pasó.
- [ ] Se reinició Nginx sin error: `systemctl restart nginx`.
- [ ] El backend responde: `curl -fs http://127.0.0.1:8001/api/health` en el despliegue actual (Supervisor/Nginx usan 8001).
- [ ] Navegador: cerrar sesión, recarga forzada con **Ctrl+Shift+R** o **Ctrl+F5**, volver a iniciar y verificar la versión del pie.
- [ ] El módulo Actualizaciones muestra versión instalada/pendiente coherente con el pie y con `version.js`.
- [ ] Si hubo cambios de Cliente/Red/Facturación, probar el flujo funcional afectado sin perder datos.

## 11. Incidencias recientes y patrones

| Fecha | Síntoma | Contenedor probable | Estado / acción correcta |
|---|---|---|---|
| 2026-09-07 | Pie del panel mostraba 1.0.13 mientras el centro de actualizaciones reportaba 1.0.14. | Despliegue frontend/Nginx y caché; no el comparador Git del backend. | Pendiente de validación final: recarga forzada; comprobar build copiado y aplicar política no-cache para `index.html` si persiste. No afirmar causa definitiva sin evidencia del servidor. |
| 2026-09-07 | Se publicó 1.0.15 para comprobar detección, instalación y cierre de sesión. | `modules/system-update/`. | Publicado en `main`; después de instalar debe probarse que la versión visual también cambia. |
| 2026-09-07 | Abrir Email/SMS o Documentos dejó React en pantalla negra. | `modules/clientes/editor/` y su integración en `ClientDetail.jsx`. | Recuperado temporalmente: las pestañas muestran “módulo en revisión”. Requiere corregir y probar los componentes antes de reactivarlos. |
| Recurrente | Cambio visual sin efecto real en datos/red. | Frontend con validación backend ausente o API incorrecta. | Seguir vista → API → router → modelo/integración; no resolver solo alterando JSX. |
| Recurrente | Un cambio Git aparece en API pero no en la web. | Proceso de build/copia estática o caché. | Validar `yarn build`, `/var/www/mikrosmart_web`, Nginx y recarga forzada. |

### Patrón de prevención

Cada fallo debe registrarse con: síntoma visible, módulo dueño, evidencia (consola/API/log), corrección aplicada, prueba realizada y versión que lo contiene. Así Copilot no repetirá correcciones visuales que oculten la causa real.
