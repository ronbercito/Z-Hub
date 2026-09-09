# CONTINUIDAD Z-HUB — 13

## Fecha
2026-09-09

## Cambio
La ventana **Actualizaciones** debe mostrar únicamente los cambios correspondientes a la versión que se está ofreciendo para instalar, no el historial acumulado de versiones anteriores.

## Diagnóstico
`UpdateCenter.jsx` ya consume `status.remote.changelog`, por lo que el origen del problema estaba en `frontend/src/modules/system-update/version.js`: `CHANGELOG` contenía entradas acumuladas de varias versiones. El backend (`backend/app/modules/system_update/router.py`) entrega ese arreglo como `remote.changelog`.

## Solución
Se cambió `version.js` para que `CHANGELOG` sea exclusivamente el changelog de la versión actual. La ventana existente sigue mostrando `status.remote.changelog`, por lo que al consultar una nueva versión recibe solamente sus cambios.

## Versión
- Nueva versión: **1.1.94**
- Commit: `98fecda16bbc33fbf1810652b24d89ac80862219`
- Blob `version.js`: `503c52dc3602a32ab2e773b73dd1ee7ff6658c15`

## Funcionalidad preservada
No se modificó la lógica de comprobación, descarga, instalación, progreso, cierre de sesión ni rollback. El cambio afecta únicamente al contenido informativo mostrado en la ventana de actualización.

## Regla para futuras versiones
Cada nueva versión debe reemplazar `CHANGELOG` por las entradas de esa versión únicamente. El historial puede conservarse en los documentos de continuidad/commits, pero no debe acumularse dentro de `version.js`.
