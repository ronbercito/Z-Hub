# Backup Z-Hub 1.2.31 — Registro y altas

Respaldo previo a implementar preferencias funcionales en `Ajustes → Configuración clientes → Registro y altas`.

## Blobs 1.2.31
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` → `3f2ccd258e5b370e2e018d4f90f6ca2125a1ca11`
- `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx` → `05ffd642223dcc6eca67f013d5ffc2bc654119b9`
- `backend/app/models/setting.py` → `5c683b8593fe7b719e5ce06a5607c1ee8488f3fe`
- `backend/server.py` → `61e336de5a79ad136f3b350c15e417167e50e664`
- `frontend/src/modules/system-update/version.js` → `33579d95bf13e31778a7c92d9f8ec30e7e339c99`
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → `63d2902ac57521a2ddfe73b76e50d4c9a70b1d27`

## Archivo nuevo en 1.2.32
- `backend/app/routers/clientes/registration_settings.py` no existía en 1.2.31; eliminarlo para un rollback completo.

## Rollback
Restaurar los blobs indicados y eliminar el archivo nuevo para volver al comportamiento 1.2.31. Este cambio no requiere eliminar tablas ni datos.