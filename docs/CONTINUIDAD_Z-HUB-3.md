# Z-Hub — Continuidad 3

## Versión actual

**PANEL_VERSION: 1.1.83**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Login — recordar credenciales
- Se mejoró el formulario de Login para permitir el autocompletado estándar de credenciales del navegador.
- El formulario usa `autoComplete="on"`.
- El campo de correo usa `name="email"` y `autoComplete="username"`.
- El campo de contraseña usa `name="password"` y `autoComplete="current-password"`.
- Esto permite que Chrome y otros navegadores compatibles ofrezcan guardar y reutilizar las credenciales mediante su propio administrador de contraseñas.
- Z-Hub no guarda la contraseña en `localStorage`.
- La opción existente **Recordar mi cuenta** continúa recordando únicamente el correo mediante `zhub_remembered_email`.
- El token `fibraz_token` mantiene su funcionamiento independiente.

### Seguridad
- No se implementó almacenamiento directo de contraseñas en el panel.
- El recuerdo de contraseña queda delegado al administrador de credenciales del navegador.
- La funcionalidad existente de recordar cuenta no altera el mecanismo JWT.

### Archivos actualizados
- `frontend/src/modules/auth/Login.jsx`
- `frontend/src/modules/system-update/version.js`

### Commits
- `12a90a32b82d29dc0be443b17eec41bc828cb26d` — `fix: enable browser credential remembering on login`
- `9c69258d1cf904602fc1e2edd905df66881f3c6a` — `chore: bump panel version to 1.1.83`

## Validación recomendada

1. Abrir el Login en Chrome u otro navegador compatible.
2. Introducir correo y contraseña válidos.
3. Iniciar sesión y aceptar el aviso del navegador para guardar la contraseña, si aparece.
4. Cerrar sesión.
5. Volver al Login y comprobar que el navegador ofrezca/autocomplete la credencial guardada.
6. Comprobar que **Recordar mi cuenta** siga funcionando para recordar el correo independientemente del administrador de contraseñas.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-4.md`, manteniendo la numeración secuencial y registrando siempre la versión actual de `PANEL_VERSION`, las modificaciones, seguridad y commits correspondientes.
