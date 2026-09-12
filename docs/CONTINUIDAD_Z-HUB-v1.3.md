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

## 1.3.11 — Cartilla visual enriquecida de Clientes

**Motivo:** la primera presentación 1.3.10 seguía percibiéndose como una fila ancha coloreada. Se rediseña la composición para acercarla a la maqueta visual aprobada, con más jerarquía, contraste y separación interna, sin perder información ni acciones.

### Diseño

- La identidad del abonado ocupa una cabecera visual amplia con avatar mayor, nombre y DNI/RUC.
- Contacto queda separado en la zona superior central.
- Deuda y estado pasan a mostrarse como módulos propios, destacados y fáciles de leer.
- Plan/tarifa y tecnología se agrupan en una ficha inferior **Servicio principal**.
- IP, tipo de conexión y router se agrupan en una ficha inferior **Conexión / red**.
- Se conservan todos los botones existentes de ficha, corte/reactivación, ONU, WhatsApp, pausa, retiro, mapa y eliminación.
- Activo: verde más visible; pausado: ámbar; suspendido/cortado: rojo.
- En **Claro Suave** se usan fondos pastel más intensos y cercanos a la referencia visual aprobada.
- Responsive reorganiza la cartilla sin ocultar contenido.

### Rendimiento

- No se añaden consultas API, polling, workers ni lecturas por abonado.
- Se reutiliza exactamente el mismo `GET /api/clients` y los mismos datos ya cargados en 1.3.10.
- El cambio es únicamente de presentación, por lo que no agrega carga al MikroTik ni multiplica consultas al backend.

### Implementación

- `frontend/src/modules/clientes/client-status-cards.css` se rehace con una composición de cartilla en dos niveles.
- El estado continúa detectándose desde las clases ya renderizadas mediante `:has(...)`; no se altera el valor persistido.
- Se mantiene el contrato visual de 1.3.10 y se agrega regresión para la nueva estructura.
- `PANEL_VERSION = "1.3.11"`.

### Versionado / rollback

- Backup previo: `backup/pre-client-card-visual-1.3.11-20260912`.
- Rama: `work/client-card-visual-1.3.11-20260912`.
- Este cambio no modifica el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.10 — Cartillas visuales de clientes por estado

**Decisión:** adaptar la vista principal de Clientes al estilo visual aprobado: cada abonado se presenta como una cartilla amplia, conservando toda la información y las acciones existentes, con identificación inmediata por color de estado.

### Diseño

- Cliente **activo**: tono y borde verde.
- Cliente **pausado**: tono y borde ámbar.
- Cliente **suspendido / cortado**: tono y borde rojo.
- Se mantiene visible la información existente de abonado, plan, IP/usuario, contacto, deuda, estado y acciones.
- No se elimina ni oculta funcionalidad de la vista actual; el cambio es visual y responsive.
- Tema oscuro usa fondos tintados discretos para conservar contraste.
- Tema **Claro Suave** usa cartillas pastel similares a la referencia aprobada.
- En resoluciones medianas las cartillas se reorganizan en dos filas y en móviles en una columna, sin ocultar datos.

### Rendimiento / datos

- No se agregan nuevas consultas API, polling, workers ni lecturas por abonado.
- Se reutiliza exactamente la información ya cargada por `GET /api/clients`.
- Por ello el nuevo aspecto no multiplica la carga del backend ni del MikroTik.

### Implementación

- Nuevo `frontend/src/modules/clientes/client-status-cards.css`.
- `frontend/src/index.css` carga el estilo global específico de Clientes.
- La selección de color se hace por el estado ya renderizado (`active`, `paused`, `suspended`) y no modifica el dato persistido.
- `PANEL_VERSION = "1.3.10"`.

### Versionado / rollback

- Backup previo: `backup/pre-client-status-cards-1.3.10-20260912`.
- Rama: `work/client-status-cards-1.3.10-20260912`.
- Este cambio no modifica el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.9 — Gestión individual por servicio opcional

**Decisión:** incorporar en **Ajustes → Configuración clientes** una opción para administrar el estado operativo de cada servicio por separado, sin obligar a cambiar el flujo general existente del abonado.

### Configuración

- Nueva opción **Gestión individual por servicio → Administrar estados por servicio**.
- Queda **desactivada por defecto** para mantener exactamente el comportamiento anterior en instalaciones que no necesiten esta función.
- Activar o desactivar la opción no elimina clientes, servicios, IP, NAP, ONU, facturas ni configuración técnica.
- Si está desactivada, las acciones generales del abonado continúan funcionando como antes.

### Comportamiento cuando está activada

- El servicio principal y cada servicio adicional pueden administrarse individualmente.
- Acciones disponibles: **Pausar**, **Suspender / cortar** y **Reactivar**.
- Pausar o suspender un servicio no modifica los demás servicios del mismo abonado.
- El estado general del cliente se conserva como control global. Si el abonado completo está suspendido o pausado, primero debe reactivarse globalmente antes de habilitar individualmente un servicio.
- Las acciones generales del cliente siguen disponibles y tienen alcance global sobre el abonado.

### MikroTik y persistencia

- PPPoE: el estado individual se aplica habilitando/deshabilitando únicamente el `secret` correspondiente al servicio.
- IP estática/DHCP administrado por IP: se agrega o retira únicamente esa IP de la `address-list` de corte configurada.
- Primero se confirma la operación en MikroTik; si falla, no se confirma el nuevo estado local.
- Nuevo modelo `ClientServiceState` / tabla `client_service_states` para conservar estados independientes, incluido el servicio principal, sin migrar ni romper la estructura histórica de `clients`.
- Los servicios adicionales continúan sincronizando su campo `ClientService.status`.
- Se registra actividad del abonado para los cambios individuales.

### Rendimiento

- No se crean workers nuevos, sondeos permanentes, pings ni consultas periódicas por servicio.
- Las acciones contra MikroTik ocurren únicamente cuando el operador pulsa una acción.
- Al abrir la pestaña Servicios se mantiene la consulta existente de servicios y se añade una sola consulta de resumen de estados para ese abonado mediante `GET /api/clients/{client_id}/service-states`.
- La carga no crece con procesos permanentes por cada servicio.

### Licencia

- Se conserva sin cambios la regla validada en 1.3.8: `active`, `suspended` y `paused` continúan consumiendo cupo.
- Pausar o suspender individualmente un servicio **no libera capacidad de licencia**.
- Solo la baja/eliminación definitiva del servicio libera el cupo correspondiente.
- Este cambio **no modifica el contrato Z-Hub ↔ Web-Licence**, por lo que Web-Licence permanece sin cambios.

### Implementación

- `backend/app/models/client_service_state.py`: persistencia de estado individual.
- `backend/app/routers/clientes/service_operations.py`: política y acciones por servicio.
- `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`: interruptor de activación.
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`: estado y menú compacto de acciones por servicio.
- Contrato automático: `backend/tests/test_individual_service_control_139_contract.py`.

### Versionado / rollback

- `PANEL_VERSION = "1.3.9"`.
- Backup previo: `backup/pre-individual-service-control-1.3.9-20260912`.
- Rama: `work/individual-service-control-1.3.9-20260912`.
- El despliegue real y la prueba con un abonado de varios servicios deben validarse después de CI/merge.

---

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

## Marcadores históricos preservados para regresión

- `1.3.0`: inicio de la serie 1.3.x.
- `Etapa 4/7`: etapa histórica asociada al HW-ID/Auto-TRIAL y continuidad de la serie.
- `1.3.4`: regla histórica de capacidad por abonados activos, **supersedida por 1.3.8**. Backup histórico: `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- `1.3.5`: registro integrado en Setup Wizard y validación histórica del TRIAL; conserva el flujo **Ya tengo una cuenta**, con **Perú** seleccionado por defecto y prefijo +51.
- `Etapa 7/7`: validación integral histórica de registro, Auto-TRIAL, reinstalación y flujo comercial.

## Historial anterior

El detalle íntegro de 1.3.6 hacia atrás se conserva en `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.8.md`. No borrar ese archivo: contiene decisiones, validaciones reales, instalación limpia, Auto-TRIAL, límites históricos y rollback de versiones anteriores.
