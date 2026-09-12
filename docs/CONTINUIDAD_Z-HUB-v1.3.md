# Z-Hub — Bitácora de continuidad v1.3

## REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR

Esta es la fuente activa de continuidad para **Z-Hub 1.3.x**.

1. Revisar `main` y esta bitácora antes de modificar.
2. Crear backup antes de cambios críticos.
3. Todo cambio funcional incrementa `PANEL_VERSION`; las nuevas versiones se agregan primero.
4. Mantener Web-Licence separado de Z-Hub y no versionar secretos.
5. Probar CI y declarar por separado código integrado y despliegue real.
6. No borrar datos para resolver problemas de licencia o UI.
7. Si cambia el contrato Z-Hub ↔ Web-Licence, actualizar ambas bitácoras.

El histórico completo anterior a 1.3.8 queda preservado en `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.8.md` y en el backup `backup/pre-service-capacity-1.3.8-20260912`.

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.8 — Capacidad de licencia por servicios registrados

**Decisión comercial:** la licencia deja de contar únicamente abonados con `status=active`. A partir de 1.3.8 la unidad de capacidad es el **servicio registrado que ocupa recursos de red**.

### Regla definitiva

- El servicio principal de un abonado consume **1 cupo** cuando el abonado está `active`, `suspended` o `paused`.
- Suspender/cortar un abonado **no libera** capacidad.
- Pausar un abonado **no libera** capacidad.
- Cada registro `ClientService` adicional consume **1 cupo independiente** cuando está `active`, `suspended` o `paused`.
- Un abonado con 2 servicios consume 2 cupos; con 3 servicios consume 3 cupos.
- Solo una **baja/retiro definitivo** deja de consumir el cupo correspondiente.
- Registros `pending_install` no consumen hasta convertirse en un servicio registrado/operativo.

### Límites de planes

- `TRIAL`: 30 días, máximo 20 servicios contabilizados.
- `PLAN_100`: sin vencimiento, máximo 100 servicios.
- `PLAN_300`: sin vencimiento, máximo 300 servicios.
- `PLAN_500`: sin vencimiento, máximo 500 servicios.
- `PLAN_1000`: sin vencimiento, máximo 1000 servicios.
- `ILIMITADO`: sin vencimiento y sin límite de servicios.

### Comportamiento al alcanzar capacidad

- El panel **no se bloquea** globalmente.
- Se bloquea el alta de un nuevo abonado porque crea un servicio principal.
- Se bloquea `POST /api/clients/{client_id}/services` porque cada servicio adicional consume otro cupo.
- Reactivar un suspendido o reanudar un pausado sigue permitido, ya que esos estados nunca liberaron el cupo.
- Reactivar un cliente retirado requiere cupo porque el retiro sí dejó de consumir capacidad.
- Edición, facturación, cobranza, suspensión, pausa, monitoreo, mapas, routers, OLTs, reportes, ajustes y demás funciones continúan disponibles.

### Implementación

- Nuevo `backend/app/core/license_usage.py` con `CAPACITY_STATUSES = ("active", "suspended", "paused")`.
- `backend/server.py` conecta el cálculo comercial de servicios al motor de licencia y aplica `enforce_client_capacity` también al router de servicios adicionales.
- `backend/app/core/license_guard.py` agrega el control de capacidad para nuevos servicios y elimina el bloqueo incorrecto al reactivar suspendidos/pausados.
- `frontend/src/modules/ajustes/LicenseSettings.jsx` cambia la terminología de “abonados activos” a “servicios” y explica qué estados consumen cupo.
- El mensaje de WhatsApp informa capacidad utilizada en servicios contabilizados.
- Contrato automático: `backend/tests/test_service_capacity_138_contract.py`.

### Versionado / rollback

- `PANEL_VERSION = "1.3.8"`.
- Backup previo: `backup/pre-service-capacity-1.3.8-20260912`.
- Rama: `work/service-capacity-1.3.8-20260912`.
- Contrato relacionado de Web-Licence: los límites 20/100/300/500/1000 pasan a interpretarse como **servicios**, no abonados activos. Web-Licence no necesita cambiar la estructura de licencia; sí debe documentar el nuevo significado comercial.
- Despliegue real y prueba con activo → suspendido → pausado → servicio adicional deben validarse después de CI/merge.

---

## 1.3.7 — Mensaje comercial de WhatsApp

- Mensaje ordenado con saludo, motivo, Installation ID, plan, capacidad y estado.
- Diferencia solicitudes TRIAL de cambios/ampliaciones PAID.
- Backup: `backup/pre-whatsapp-message-1.3.7-20260912`.
- PR #19 fusionado en `main`.

---

## 1.3.6 — Licencia compacta y contacto central

- Ventana de licencia compacta.
- Contacto/WhatsApp sincronizado desde Web-Licence 1.4.7 mediante `GET /v1/public/contact`.
- `ZHUB_LICENSE_WHATSAPP` queda como fallback.
- Backup: `backup/pre-license-contact-sync-1.3.6-20260912`.

---

## Historial anterior

El detalle íntegro de 1.3.6 hacia atrás se conserva en `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.8.md`. No borrar ese archivo: contiene decisiones, validaciones reales, instalación limpia, Auto-TRIAL, límites históricos y rollback de versiones anteriores.
