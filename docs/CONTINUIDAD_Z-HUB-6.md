# Z-Hub — Continuidad 6

## Versión actual

**PANEL_VERSION: 1.1.87**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Ventana de Actualizaciones con desplazamiento vertical

Se corrigió la ventana modal de **Actualizaciones** para que pueda mostrar changelogs largos sin obligar al usuario a reducir el zoom del navegador.

### Menú lateral de Ajustes con barra visible

Se corrigió el menú lateral para que, al abrir **Ajustes** y desplegar sus numerosos submenús, exista una barra de desplazamiento vertical visible y utilizable.

El área de navegación usa `overflow-y-scroll`, por lo que la barra queda disponible para recorrer de arriba hacia abajo las opciones que superan la altura de la pantalla. El usuario ya no necesita reducir el zoom para acceder a las opciones inferiores.

El encabezado con logo, la cuenta del usuario y el botón **Cerrar sesión** permanecen fuera del área desplazable.

### Alcance y seguridad

- No se modificaron rutas.
- No se modificaron permisos.
- No se modificó autenticación.
- No se modificó la configuración de Google Maps.
- No se modificó la lógica de Ajustes.
- No se modificó la lógica del backend de actualizaciones.
- Los cambios son exclusivamente de presentación y navegación.

### Archivos actualizados

- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/system-update/version.js`
- `frontend/src/modules/system-update/UpdateCenter.jsx` (cambio anterior de la versión 1.1.86)

### Commits

- `9f12f1e62603c0e22c31473bf00f9275edba193e` — `fix: show sidebar scrollbar for long settings submenu`
- `370da19d36017eb146b601e74e0d8e42b4942066` — `chore: bump panel version to 1.1.87`
- `b5a0ab8b0c09891ef6f1b44952b7aaa87db335c2` — `fix: make update changelog scrollable`
- `791d5f3563ed8d6c4f9dcc469775ef925e5142f2` — `chore: bump panel version to 1.1.86`

### Validación recomendada en el servidor

1. Actualizar Z-Hub a la versión **1.1.87**.
2. Abrir **Ajustes** en el menú lateral y desplegar todas sus opciones.
3. Confirmar que la barra vertical sea visible.
4. Arrastrar la barra desde arriba hasta abajo y comprobar el acceso a Google, Base de datos, Crontab, Logs, Sistema, Servidor, Migrar, FreeRADIUS y Licencia.
5. Confirmar que logo, usuario y Cerrar sesión permanezcan visibles.
6. Abrir **Actualizaciones** y comprobar que un changelog largo también pueda recorrerse verticalmente.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-7.md`, manteniendo la numeración secuencial y registrando versión, modificaciones, seguridad, validaciones y commits correspondientes.
