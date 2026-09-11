# Backup previo — guardado de tema en Ajustes

## Estado protegido

- Versión: Z-Hub 1.2.79
- Fecha: 2026-09-11
- Rama: `main`
- Motivo: corregir el error genérico `Error al guardar ajustes` al cambiar el tema del panel.

## Comportamiento protegido

- `frontend/src/modules/ajustes/Settings.jsx` obtiene `/api/settings` y guarda la configuración general mediante `PUT /api/settings`.
- `panel_theme` es una clave válida de `DEFAULT_SETTINGS` y debe conservarse al guardar.
- El backend mantiene protegidas las claves internas de licencia y SMTP.
- Las claves antiguas/desconocidas que puedan existir en `s.data` no deben impedir que una configuración válida, como `panel_theme`, pueda guardarse.

## Criterio de reversión

Si la corrección produce una regresión, restaurar el estado anterior de `backend/app/routers/ajustes/router.py` desde el commit inmediatamente anterior a esta entrega.
