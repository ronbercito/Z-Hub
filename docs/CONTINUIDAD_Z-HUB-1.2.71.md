# Z-Hub 1.2.71

Fecha: 2026-09-10

Se corrige la coherencia del límite TRIAL entre el License Server y Z-Hub local.

Cambios:
- `TRIAL_MAX_CLIENTS = 20` en `backend/app/core/license_manager.py`.
- La normalización local de TRIAL fija 20 abonados.
- `get_client_limit()` devuelve 20 para TRIAL.
- `apply_license_metadata()` persiste el límite 20.
- `can_create_client()` aplica el mismo control de capacidad a TRIAL.
- Se actualizaron pruebas contractuales.
- Versión visible: 1.2.71.

Backup previo:
`backup/pre-local-trial-limit-1.2.71-20260910`

Pendiente: probar de extremo a extremo con el `installation_id` real de una instalación Z-Hub, autorizarla en License Center y comprobar validación remota, firma RS256, vencimiento y suspensión/reactivación.
