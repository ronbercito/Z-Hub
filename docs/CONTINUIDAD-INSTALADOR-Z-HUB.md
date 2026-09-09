# Z-Hub — Continuidad del instalador

## Comando oficial de instalación limpia

Este es el comando que se utiliza actualmente para instalar Z-Hub desde cero:

```bash
apt-get update && apt-get install -y git && mkdir -p /var/www && rm -rf /var/www/z-hub && git clone https://github.com/ronbercito/Z-Hub.git /var/www/z-hub && cd /var/www/z-hub && chmod +x install.sh deploy/install.sh && ./install.sh
```

## Flujo

1. Actualiza los índices de paquetes.
2. Instala Git.
3. Crea `/var/www` si no existe.
4. Elimina el checkout anterior `/var/www/z-hub`.
5. Clona `ronbercito/Z-Hub` desde `main`.
6. Da permisos de ejecución a `install.sh` y `deploy/install.sh`.
7. Ejecuta `./install.sh`.
8. El instalador raíz lanza `deploy/install.sh` en primer plano para conservar la interfaz visual de terminal.

## Advertencia

Es una **instalación limpia del checkout**: `rm -rf /var/www/z-hub` reemplaza los archivos del checkout local antes de clonar nuevamente. No ejecutar sobre una instalación existente sin confirmar que se desea reemplazar ese checkout y que los datos necesarios están conservados/respaldados.

La contraseña de base de datos no se documenta aquí ni en ningún documento de continuidad. En instalaciones nuevas se genera aleatoriamente; si existe una configuración válida, se conserva.

## Instalador actual

- Raíz: `install.sh`
- Principal: `deploy/install.sh`
- Etapas visuales: 7
- La URL final del panel se muestra mediante enlace OSC 8 cuando la terminal lo soporta; en otras terminales queda como texto copiable.
- La interfaz evita mostrar en el resumen normal rutas internas, nombre/usuario de base de datos y rutas de logs técnicos.

## Fecha de revisión

2026-09-09
