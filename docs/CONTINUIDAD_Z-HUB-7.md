# Continuidad Z-Hub 7

**Fecha:** 2026-09-09  
**Versión:** 1.1.88

## Cambio
Se corrigió definitivamente la barra de desplazamiento vertical de la ventana **Actualizaciones**.

## Archivos
- `frontend/src/modules/system-update/UpdateCenter.jsx`
- `frontend/src/App.css`
- `frontend/src/modules/system-update/version.js`

## Implementación
- La ventana usa `overflow-y-scroll` y `scrollbar-gutter: stable`.
- Se agregó estilo explícito de scrollbar para que sea visible y usable en Chromium/Chrome y Firefox.
- El encabezado y los botones de la ventana siguen accesibles mientras se recorre el changelog.
- No se modificó la lógica de instalación, progreso, backup ni rollback del actualizador.

## Commits relacionados
- `a2449856bb179c882c8a4161fa97a4db0f2c9469` — estilo visible de scrollbar en `App.css`.
- `b0ed64f86792eba96925079ddeafadf9694e87ca` — versión 1.1.88.

## Estado
La corrección fue probada por el usuario y confirmó que la barra de desplazamiento quedó funcionando correctamente.

## Siguiente
La siguiente continuidad corresponde a `CONTINUIDAD_Z-HUB-8.md`.
