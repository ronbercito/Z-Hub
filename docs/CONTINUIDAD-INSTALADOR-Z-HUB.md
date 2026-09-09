# Z-Hub — Continuidad del instalador

## Comando oficial de instalación limpia

Este es el comando que se utiliza actualmente para instalar Z-Hub desde cero:

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
8. El instalador raíz lanza `deploy/install.sh` en primer plano para conservar la interfaz visual de terminal.
9. Al finalizar la instalación técnica, muestra la URL del panel e intenta abrirla automáticamente mediante `xdg-open` cuando el servidor dispone de entorno gráfico.

## Configuración inicial web

Una instalación nueva **no crea ni muestra credenciales administrativas automáticas**. El backend tampoco siembra un usuario admin desde `.env`.

El panel detecta el estado `initial_setup_completed` y, mientras sea falso, presenta el asistente web de primera configuración:

1. **Licencia** — se introduce una serie y el backend la compara temporalmente contra `licencia/licenses.json` del checkout.
2. **Administrador** — se crea la cuenta admin real con nombre, correo y contraseña elegidos por el operador. La contraseña debe tener al menos 10 caracteres y se almacena mediante el mecanismo de hash existente.
3. **Finalizar** — muestra licencia activada, administrador configurado y la versión actual `PANEL_VERSION`; el botón `FINALIZADO` marca la configuración como completada y vuelve al panel.

Una vez completada la configuración, el asistente queda bloqueado por estado persistente y la aplicación vuelve al login/panel normal. El archivo `install.sh` **no se elimina**: se conserva para mantenimiento y futuras actualizaciones. Lo que se inutiliza es el asistente de primera configuración, no el instalador técnico.

## Licencia temporal

Archivo actual:

```text
licencia/licenses.json
```

Actualmente contiene una serie de demostración para pruebas del flujo:

```text
ZHUB-2026-DEMO-001
```

Este registro es **temporal** y está pensado para sustituirse posteriormente por un mecanismo de licenciamiento real. La validación se realiza en backend, nunca confiando solamente en el frontend.

## Compatibilidad con instalaciones anteriores

Al arrancar, si ya existe un usuario con rol `admin` y la configuración todavía no tiene `initial_setup_completed`, el seed marca la instalación como completada para no bloquear instalaciones existentes ni reemplazar su administrador actual.

## Seguridad y salida de terminal

- No se muestran contraseñas administrativas en la terminal.
- No existen valores `admin@fibraz.pe / admin123` como credenciales de acceso automático.
- La URL final usa OSC 8 cuando la terminal lo soporta.
- La salida técnica continúa en `/var/log/zhub_install.log` con permisos restringidos.
- La interfaz de terminal mantiene las 7 etapas neutrales y su esquema de colores.

## Advertencia de instalación limpia

Es una **instalación limpia del checkout**: `rm -rf /var/www/z-hub` reemplaza los archivos del checkout local antes de clonar nuevamente. No ejecutar sobre una instalación existente sin confirmar que se desea reemplazar ese checkout y que los datos necesarios están conservados/respaldados.

La contraseña de base de datos no se documenta aquí ni en ningún documento de continuidad. En instalaciones nuevas se genera aleatoriamente; si existe una configuración válida, se conserva.

## Fecha de revisión

2026-09-09
