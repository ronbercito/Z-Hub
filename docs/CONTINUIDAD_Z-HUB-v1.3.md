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

## 1.3.17 — Orden compacto de tarjetas MikroTik + eliminar por tarjeta

**Motivo:** en la validación real de Gestión de Red, las tarjetas MikroTik quedaban distribuidas en columnas muy separadas y el cuarto equipo saltaba a una segunda fila aunque existía espacio horizontal. Además, la acción de eliminar no era visible directamente en cada tarjeta.

### Corrección visual

- Nuevo `frontend/src/modules/red/router-card-layout.css`.
- El contenedor de tarjetas usa distribución compacta desde la izquierda, con `flex-wrap` y separación fija de 16 px.
- En pantallas amplias se aprovecha el espacio disponible y se evita la separación excesiva del antiguo `grid-cols-3`.
- En móvil vuelve a una sola columna de ancho completo.
- No cambia la lectura de CPU, memoria, ping, estado ni datos del router.

### Acción eliminar

- Cada tarjeta MikroTik muestra un botón de papelera cuando el usuario tiene permiso `network.delete`.
- La eliminación conserva confirmación previa antes de enviar `DELETE /api/routers/{id}`.
- Los errores estructurados del backend no se renderizan directamente en React; se muestran como mensaje seguro.
- Tras eliminar correctamente se recarga la vista para refrescar el inventario visible.
- Las OLT conservan su flujo de eliminación existente y no reciben un botón duplicado.

### Pruebas / rendimiento

- Nuevo contrato `backend/tests/test_router_cards_1317_contract.py`.
- CI verifica layout compacto, botón de eliminación, permiso, confirmación y marcador de versión.
- No se agregan consultas periódicas, pings ni carga adicional a RouterOS.

### Versionado / rollback

- `PANEL_VERSION = "1.3.17"`.
- Backup previo: `backup/pre-router-card-order-delete-1.3.17-20260912`.
- Rama: `work/router-card-order-delete-1.3.17-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.16 — Hotfix de alta de Router MikroTik

**Incidencia real:** al registrar un MikroTik sin seleccionar coordenadas, el formulario enviaba `latitude: ""` y `longitude: ""`. `RouterIn` exigía `float`, FastAPI devolvía `422 Unprocessable Content` y el frontend terminaba mostrando el detalle estructurado de validación como objeto React, provocando `Minified React error #31` y pantalla en blanco.

### Corrección

- `backend/app/routers/red/schemas.py` normaliza `latitude` y `longitude` vacíos o `None` a `0.0` antes de la validación Pydantic.
- El alta de MikroTik ya no requiere seleccionar coordenadas para ser válida.
- Se agrega `backend/tests/test_router_create_1316_contract.py` para verificar que el payload real del formulario con coordenadas vacías sea aceptado.
- CI incorpora el nuevo contrato de regresión.

### Alcance

- No cambia la API RouterOS, credenciales, provisionamiento, mapas ni lógica de conexión.
- No cambia el contrato Z-Hub ↔ Web-Licence.
- Se conserva la base restaurada de 1.3.15 / 1.3.9.

### Versionado / rollback

- `PANEL_VERSION = "1.3.16"`.
- Backup previo: `backup/pre-router-create-hotfix-1.3.16-20260912`.
- Rama: `work/router-create-hotfix-1.3.16-20260912`.
- Validación real pendiente después de actualizar: registrar un MikroTik dejando latitud/longitud vacías y confirmar que ya no aparece 422 ni pantalla blanca.

---

## 1.3.15 — Restauración publicada del estado funcional 1.3.9

**Motivo:** el panel desplegado ya estaba en 1.3.14 y el actualizador normal no aplica una versión numéricamente menor. Por eso el estado restaurado de 1.3.9 se republica como **1.3.15**, manteniendo exactamente la base funcional de 1.3.9 pero permitiendo que instalaciones en 1.3.14 reciban la restauración como actualización normal.

### Alcance

- El código base restaurado corresponde al commit de `backup/pre-client-status-cards-1.3.10-20260912`.
- Se descartan de la línea activa los cambios visuales de Clientes introducidos entre 1.3.10 y 1.3.14.
- Se conserva la gestión individual por servicio de 1.3.9.
- Se conserva la capacidad de licencia por servicios de 1.3.8.
- No cambia el contrato Z-Hub ↔ Web-Licence.

### Publicación / rollback

- `PANEL_VERSION = "1.3.15"`.
- Backup del estado restaurado antes de republicar: `backup/pre-restored-release-1.3.15-20260912`.
- Backup del estado previo 1.3.14: `backup/pre-restore-to-1.3.9-20260912`.
- Rama: `work/restored-release-1.3.15-20260912`.
- Esta versión existe únicamente para entregar como actualización el estado estable de 1.3.9 a paneles que ya reportaban 1.3.14.

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
