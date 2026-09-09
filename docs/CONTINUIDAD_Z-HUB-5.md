# Z-Hub — Continuidad 5

## Versión actual

**PANEL_VERSION: 1.1.85**

Fuente de verdad de versión: `frontend/src/modules/system-update/version.js`.

## Actualización registrada — 2026-09-09

### Menú lateral con desplazamiento vertical

Se corrigió el menú lateral para que las opciones y submenús que superen la altura visible de la pantalla puedan recorrerse verticalmente mediante una barra de desplazamiento, como una página larga.

El desplazamiento se aplica únicamente al área de navegación. El encabezado con logo, la cuenta del usuario y el botón de cerrar sesión permanecen fijos y visibles.

### Alcance

- Se mantiene la estructura actual de menús y submenús.
- Se mantiene el submenú `Ajustes → Google Maps y APIs`.
- No se modifican rutas ni permisos.
- No se modifica la lógica de autenticación.
- No se modifica la funcionalidad de mapas.
- El cambio es visual y de navegación del Sidebar.

### Archivo actualizado

- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/system-update/version.js`

### Commit

- `697c9400a1e1cdac5afc8f0aa36f2c92a94dfe49` — `fix: add scrollable sidebar menu`
- `e669df59b1d931dfce89259a13288703823d7da0` — `chore: bump panel version to 1.1.85`

### Validación recomendada en el servidor

Después de actualizar:

1. Actualizar Z-Hub a la versión **1.1.85**.
2. Abrir el menú lateral y expandir **Ajustes**.
3. Confirmar que aparezca la barra de desplazamiento vertical cuando el contenido no quepa en pantalla.
4. Desplazarse hasta las opciones inferiores, incluyendo Google Maps, Base de datos, Sistema y Licencia.
5. Confirmar que el encabezado y el botón de cerrar sesión permanezcan visibles.

## Regla para la siguiente continuidad

Los siguientes cambios deberán continuar en `CONTINUIDAD_Z-HUB-6.md`, manteniendo la numeración secuencial y registrando la versión actual, modificaciones, seguridad, validaciones y commits correspondientes.
