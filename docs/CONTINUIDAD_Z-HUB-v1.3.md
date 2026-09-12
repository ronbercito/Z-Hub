# Z-Hub — Bitácora de continuidad v1.3

## REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR

Esta es la fuente activa de continuidad para **Z-Hub 1.3.x**. La serie 1.2.x queda cerrada en `docs/CONTINUIDAD_Z-HUB-v1.2.md` como histórico.

1. Revisar `main` y esta bitácora antes de modificar.
2. Crear backup antes de cambios críticos.
3. Todo cambio funcional incrementa `PANEL_VERSION`; las nuevas versiones se agregan primero.
4. Mantener Web-Licence separado de Z-Hub y no versionar secretos.
5. Probar CI y declarar por separado código integrado y despliegue real.
6. No borrar datos para resolver problemas de licencia o UI.

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.0 — Etapa 4/7: Setup Wizard con Auto-TRIAL

**Objetivo:** retirar la introducción manual de claves del proceso normal de primera instalación y conectar el Wizard con el Auto-TRIAL construido en las etapas 2/7 y 3/7.

### Flujo

`registro cliente -> instalación Z-Hub -> correo registrado -> HW-ID local -> Web-Licence -> activar/recuperar TRIAL -> validar licencia firmada -> crear admin -> finalizar`.

### Backend

- Nuevo `POST /api/setup/auto-trial`.
- El endpoint obtiene/persiste `license_installation_id`, invoca `activate_auto_trial()` y Web-Licence 1.4.3 decide por HW-ID si activa o recupera el TRIAL.
- Después de recibir la asignación, Z-Hub valida la licencia por el contrato remoto existente antes de persistir metadata.
- Rechazos comerciales se separan de indisponibilidad temporal del License Server.
- `/api/setup/license` se conserva como compatibilidad/recuperación administrativa, pero deja de ser el flujo normal del Wizard.
- `/api/setup/complete` ya no recibe la clave desde el navegador: utiliza y vuelve a validar la licencia almacenada por el backend.

### Frontend

- El primer paso del Wizard solicita el correo registrado, no una serie de licencia.
- Informa que el servidor será identificado para impedir múltiples Trials.
- Si el HW-ID ya tuvo Trial, se recupera el mismo registro sin reiniciar el período.
- El segundo paso crea el administrador y el tercero confirma la configuración.

### Versionado

- Primera versión de la nueva serie: **1.3.0**.
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` queda como histórico de 1.2.x.
- Las siguientes 1.3.x se documentarán en este archivo, más nuevas primero.

### Rollback

- Backup previo: `backup/pre-wizard-auto-trial-1.3.0-20260911`.
- Rama de trabajo: `work/wizard-auto-trial-1.3.0-20260911`.

### Pendiente de cierre

- CI verde del PR.
- Merge a `main` solo después de CI verde.
- Despliegue y prueba real del Wizard se validan por separado después del merge.
