# Z-Hub — Continuidad 2

## Versión actual

**PANEL_VERSION: 1.1.82**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Registro de licencias
- El registro de licencias utiliza `licencia/licencias.txt` en formato de texto plano y amigable.
- Cada bloque contiene `LICENCIA`, `NOMBRE`, `CORREO` y `ESTADO`.
- Las licencias pueden activarse o desactivarse editando el bloque correspondiente.
- Durante la instalación, el archivo se copia al almacenamiento privado `/etc/zhub/licencia/licencias.txt`.
- El registro privado no se expone desde el panel ni desde el directorio público web.

### Asistente inicial
- La instalación nueva muestra el asistente web de configuración inicial.
- Primero valida la serie/licencia.
- Luego permite crear el administrador con el correo y contraseña elegidos por el instalador.
- La contraseña requiere confirmación y mínimo 10 caracteres.
- Al finalizar, el estado de instalación queda persistido y el asistente no vuelve a mostrarse.
- Las instalaciones nuevas ya no crean credenciales administrativas predeterminadas.

### Login — Recordar mi cuenta
- Se agregó el checkbox opcional **Recordar mi cuenta** en el formulario de acceso.
- Si está activado, se recuerda únicamente el correo de la cuenta.
- Si está desactivado, se eliminan los datos recordados.
- La contraseña nunca se guarda mediante esta función.
- Las claves utilizadas son `zhub_remember_account` y `zhub_remembered_email`.
- El token de autenticación existente (`fibraz_token`) mantiene su comportamiento independiente.

### Commit funcional
`51d1318b5cc4b0a7adb2df5303aee8e2fbdc1eb6` — `feat: add optional remember account on login`

## Regla para la siguiente continuidad

Los nuevos cambios de esta etapa deberán continuar en `CONTINUIDAD_Z-HUB-3.md`, manteniendo este esquema de numeración secuencial y registrando siempre la versión actual de `PANEL_VERSION` y las modificaciones realizadas.
