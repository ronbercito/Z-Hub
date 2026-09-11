# Backup — Archivos previos a integración AutomatizadoVIP

Este documento registra que los archivos existentes se mantienen sin reemplazo durante la primera fase. La integración se incorpora mediante módulos nuevos y, cuando sea necesario, las modificaciones de integración sobre archivos existentes se harán después de guardar su contenido exacto en un respaldo dedicado.

Archivos base inspeccionados:

- `frontend/src/modules/mensajeria/Messaging.jsx`: mensajería actual con plantillas y apertura de `wa.me`.
- `backend/app/routers/mensajeria/router.py`: endpoint existente de plantillas.
- `backend/app/models/setting.py`: configuración JSON del sistema.

No se copia ninguna API Key real en GitHub.
