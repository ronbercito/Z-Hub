<!--
Archivo: docs/CONTINUIDAD_ACTUALIZACIONES_2026-09-07.md
Actualización: 2026-09-07 — entrega de continuidad para revisar el módulo de actualizaciones y la discrepancia de versión visual.
Función: describe cambios realizados, evidencia del diagnóstico, origen de los datos y solución pendiente.
Recibe de: código actual de frontend/backend y pruebas visuales del panel MikroHub.
Entrega a: futuros mantenedores y agentes de GitHub un punto de partida verificable; no modifica el despliegue.
-->

# MikroHub — continuidad: módulo de actualizaciones y versiones visuales

## Estado al cierre

- Repositorio: `ronbercito/mirkohub`
- Rama publicada: `main`
- Última versión publicada en el repositorio: **1.0.15**
- El servidor/panel llegó a reportar **1.0.14** desde el módulo de actualizaciones.
- La etiqueta visible en el pie de una pantalla del frontend seguía mostrando **v1.0.13**.

Esta diferencia **no debe considerarse resuelta todavía**. El diagnóstico más probable es que el backend y el checkout Git se actualizaron, pero el navegador sigue usando el paquete React antiguo, o el paso de compilación/copia del frontend no dejó publicado el build nuevo.

## Cambios efectuados previamente

### Módulo de actualización

Se creó/ajustó el módulo de actualización web con estos archivos:

| Archivo | Responsabilidad |
|---|---|
| `frontend/src/modules/system-update/UpdateCenter.jsx` | Modal de actualización: consulta estado, muestra versión/changelog, confirma instalación, muestra progreso y cierra sesión después de una instalación iniciada por el usuario. |
| `frontend/src/modules/system-update/version.js` | Fuente única de `PANEL_VERSION` y `CHANGELOG` para el frontend y el backend. |
| `backend/app/modules/system_update/router.py` | Endpoints administrativos `GET /api/system-update/status` y `POST /api/system-update/install`. Ejecuta `git fetch origin main`, compara HEAD con `origin/main` y obtiene la versión desde `version.js`. |
| `backend/app/modules/system_update/run_update.sh` | Instalación transaccional: registra progreso, ejecuta el instalador y restaura el commit anterior si falla. |
| `setup_debian.sh` | Sincroniza el checkout contra `origin/main` y llama al instalador real. |
| `deploy/setup_debian.sh` | Instala dependencias, ejecuta `yarn build`, copia `frontend/build` a `/var/www/mikrosmart_web`, reinicia Supervisor/Nginx. |
| `deploy/nginx/mikrosmart.conf.template` | Sirve el build React y reenvía `/api/` al backend FastAPI. |

### Comportamiento aplicado

1. El módulo consulta el repositorio remoto y no expone hashes Git al usuario final.
2. Si hay cambios en `origin/main`, muestra una nueva versión y el changelog.
3. Antes de instalar, solicita confirmación y avisa que la sesión se cerrará.
4. Durante una instalación iniciada en esa sesión muestra progreso de 0 a 100%.
5. La consulta automática solo informa disponibilidad; no recarga la página ni cierra sesión por sí misma.
6. Después de una instalación exitosa, se cierra sesión para obligar a cargar nuevamente la aplicación.
7. Toda entrega debe incrementar `PANEL_VERSION` y describirse en `CHANGELOG`.

## Versiones publicadas recientemente

| Versión | Propósito |
|---|---|
| 1.0.14 | Publicó la pestaña Servicio editable: plan, router, conexión, red IPv4, datos de fibra/inalámbrico y validaciones. |
| 1.0.15 | Publicada como verificación del flujo de actualización. Solo modifica `frontend/src/modules/system-update/version.js`; no incluye otra función de negocio. |

La versión 1.0.15 fue publicada en GitHub con el commit `b0e33827beddc0634737efa8bff87c9b8728937e`.

## Diagnóstico de la discrepancia 1.0.13 / 1.0.14

La pantalla de actualizaciones mostró:

- “Panel MikroHub · versión 1.0.14”
- “El panel ya está actualizado: versión 1.0.14”

Pero otra pantalla del frontend mostró en el pie:

- “Panel MikroHub · v1.0.13”

El pie se construye en:

```
frontend/src/components/layout/Layout.jsx
import { PANEL_VERSION } from "../../modules/system-update/version";
...
Panel MikroHub · v{PANEL_VERSION}
```

Por lo tanto, esa etiqueta depende del **bundle React que el navegador descargó**, mientras que el centro de actualizaciones obtiene la versión actual mediante la API del backend leyendo Git con:

```
git show HEAD:frontend/src/modules/system-update/version.js
```

Por eso pueden diferir: API/backend actualizado y frontend estático antiguo.

## Verificación y solución pendiente para Copilot

### Primero: reproducir y separar caché de despliegue

Después de instalar 1.0.15:

1. Cerrar sesión.
2. Abrir el panel con recarga forzada: **Ctrl+F5** o **Ctrl+Shift+R**.
3. Confirmar el texto del pie.
4. Si aparece 1.0.15, el problema era caché del navegador.
5. Si continúa 1.0.13, confirmar en el servidor que el build realmente fue regenerado y copiado.

### Comandos de diagnóstico en el servidor

Ejecutar dentro del servidor, sin modificar archivos:

```bash
cd /var/www/mikrohub
git rev-parse --short HEAD
grep PANEL_VERSION frontend/src/modules/system-update/version.js
grep -R "PANEL_VERSION" /var/www/mikrosmart_web/static/js 2>/dev/null | head
ls -la /var/www/mikrosmart_web
```

El archivo fuente debe indicar 1.0.15. Si el build servido contiene 1.0.13, el despliegue no publicó el frontend actual.

### Si el build no se publicó

Ejecutar la actualización manual estándar:

```bash
cd /var/www/mikrohub
git fetch origin main
git reset --hard origin/main
bash setup_debian.sh
```

Luego realizar una recarga forzada del navegador.

### Mejora permanente recomendada

Modificar `deploy/nginx/mikrosmart.conf.template` para evitar que el navegador conserve `index.html` después de una actualización. Mantener caché larga únicamente para recursos con hash dentro de `/static/`.

Ejemplo conceptual:

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    try_files $uri =404;
}

location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

Después, mantener el fallback SPA:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Copilot debe validar `nginx -t` y que la configuración no rompa las rutas React. Este cambio debe publicarse como una versión nueva (por ejemplo 1.0.16), con comentario inicial de actualización, propósito, origen y destino en cada archivo modificado.

## Reglas obligatorias para próximas entregas

1. Cada archivo creado/modificado debe incluir comentario o docstring inicial con fecha, propósito, entrada/origen y salida/destino.
2. Cada cambio funcional debe incrementar `PANEL_VERSION` y actualizar `CHANGELOG`.
3. No publicar hashes Git, consolas o detalles internos en la ventana visible al administrador.
4. Comprobar los archivos en GitHub `main` antes de anunciar que una entrega está publicada.
5. Probar: detectar actualización → instalar → cierre de sesión → reingreso → versión visual correcta.
6. No afirmar que el problema de caché/despliegue está solucionado hasta que la versión del pie coincida con la versión instalada tras recarga forzada.
