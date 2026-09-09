# Z-Hub — Continuidad del instalador

## Comando oficial de instalación limpia

```bash
apt-get update && apt-get install -y git && mkdir -p /var/www && rm -rf /var/www/z-hub && git clone https://github.com/ronbercito/Z-Hub.git /var/www/z-hub && cd /var/www/z-hub && chmod +x install.sh deploy/install.sh && ./install.sh
```

## Flujo técnico

1. Actualiza los índices de paquetes.
2. Instala Git.
3. Crea `/var/www` si no existe.
4. Elimina el checkout anterior `/var/www/z-hub`.
5. Clona `ronbercito/Z-Hub` desde `main`.
6. Da permisos de ejecución a `install.sh` y `deploy/install.sh`.
7. Ejecuta `./install.sh`.
8. El instalador raíz lanza `deploy/install.sh` en primer plano.
9. Al terminar intenta abrir el panel mediante `xdg-open` cuando existe entorno gráfico.

## Configuración inicial web

Una instalación nueva no crea ni muestra credenciales administrativas automáticas.

El panel presenta el asistente de primera configuración mientras `initial_setup_completed` sea falso:

1. **Licencia** — introduce una serie y el backend la valida contra el registro privado.
2. **Administrador** — crea la cuenta admin real con nombre, correo y contraseña elegidos por el operador.
3. **Finalizar** — muestra licencia activada, administrador configurado y la versión actual; `FINALIZADO` marca el proceso como terminado y vuelve al panel/login.

El archivo `install.sh` no se elimina. El asistente se desactiva mediante estado persistente.

## Registro interno de licencias

El archivo fuente para preparar nuevas instalaciones está en:

```text
licencia/licenses.json
```

Su formato es deliberadamente sencillo: una lista de objetos. Para agregar otra licencia basta con añadir otro bloque:

```json
{
  "licenses": [
    {
      "key": "ZHUB-2026-DEMO-001",
      "name": "Licencia de demostración",
      "active": true
    },
    {
      "key": "ZHUB-2026-CLIENTE-001",
      "name": "Cliente ejemplo",
      "active": true
    }
  ]
}
```

Para desactivar una licencia sin borrarla:

```json
"active": false
```

### Ubicación privada en el servidor

Durante la instalación, el registro se copia a:

```text
/etc/zhub/licencia/licenses.json
```

El backend prioriza esta copia privada mediante `ZHUB_LICENSE_FILE`. Si ya existe, el instalador no la reemplaza, permitiendo que el administrador del servidor mantenga sus licencias locales.

Después de copiarla, el instalador elimina la carpeta `licencia` del checkout `/var/www/z-hub`. Por tanto:

- no forma parte del frontend;
- no se copia al `webroot`;
- no es descargable desde el panel;
- no queda expuesta por Nginx;
- queda como información interna del servidor/contenedor y del administrador.

La carpeta `licencia` del repositorio funciona solamente como **registro fuente temporal para preparar instalaciones nuevas**. El mecanismo definitivo de licenciamiento se implementará posteriormente sin depender de un archivo JSON distribuido públicamente.

## Compatibilidad con instalaciones anteriores

Si ya existe un usuario con rol `admin`, el seed marca la instalación como completada para no bloquear instalaciones existentes ni reemplazar su administrador actual.

## Seguridad y salida de terminal

- No se muestran contraseñas administrativas.
- No existen credenciales `admin@fibraz.pe / admin123` automáticas.
- La salida técnica continúa en `/var/log/zhub_install.log` con permisos restringidos.
- El registro privado de licencias queda con permisos `root:www-data` y modo `640`.
- La interfaz de terminal mantiene las 7 etapas neutrales y su esquema de colores.

## Advertencia de instalación limpia

`rm -rf /var/www/z-hub` reemplaza los archivos del checkout local antes de clonar nuevamente. No ejecutar sobre una instalación existente sin confirmar que se desea reemplazar ese checkout y que los datos necesarios están conservados/respaldados.

La contraseña de base de datos no se documenta aquí ni en ningún documento de continuidad. En instalaciones nuevas se genera aleatoriamente; si existe una configuración válida, se conserva.

## Fecha de revisión

2026-09-09
