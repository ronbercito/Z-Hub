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

Historial preservado:
- anterior a 1.3.8: `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.8.md`.
- estado completo hasta 1.3.18: `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.19.md`.
- estado completo previo a 1.3.27: `backup/pre-router-identity-panel-1.3.27-20260912`.

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.32 — Registro de Tráfico · Etapa 1/5

**Objetivo:** crear la base persistente y el contrato interno del futuro collector Traffic Flow sin modificar todavía la operación de ningún MikroTik.

### Implementación
- Nuevo modelo `TrafficIdentity`: conserva la vigencia histórica `cliente ↔ servicio ↔ router ↔ IP`, además de tipo de conexión y usuario PPPoE cuando exista. Una IP no se considera identidad permanente del abonado.
- Nuevo modelo `TrafficAggregate`: preparado para descarga, subida, total, cantidad de flujos, período, origen y estado de procesamiento. La intención es guardar agregados y no flujos brutos indefinidamente.
- Ambos modelos se registran en `app.models`, por lo que `init_db()` puede crear las tablas de forma no destructiva mediante `Base.metadata.create_all()`.
- Se agrega `app/services/traffic_registry.py` como contrato mínimo del collector: normaliza IPv4/IPv6 y bytes, pero `collector_enabled()` permanece en `False`.
- No se abren puertos, no se reciben datagramas y no se ejecutan comandos/configuración Traffic Flow sobre RouterOS en esta etapa.
- Prueba de contrato `test_traffic_registry_stage1_1332_contract.py` incluida en CI.

### Continuidad / rollback
- Punto de partida confirmado: `main` 1.3.31, commit `3eb3bc6744dd21ca72652c9b2e5aa8f4e62263d1`.
- Backup inmutable previo: `backup/pre-traffic-registry-stage1-1.3.31-20260912`.
- Rama: `work/traffic-registry-stage1-1.3.32-20260912`.
- `PANEL_VERSION = "1.3.32"`.
- Etapa 2/5 queda bloqueada hasta validar CI y después validar esta base en el entorno correspondiente.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.31 — DHCP en tarjeta MikroTik

**Motivo:** reemplazar la métrica `Tráfico` por un contador operativo de clientes DHCP del MikroTik.

### Implementación
- `snapshot_router()` consulta `dhcp_leases()` dentro de la misma sesión RouterOS usada para CPU, memoria, PPPoE, colas e interfaces.
- Se cuentan únicamente leases cuyo `status` sea `bound`, igual que el contador operativo existente en `/api/routers/{id}/client-counts`.
- El valor se adjunta de forma transitoria como `dhcp_bound_count` al objeto Router; no se agrega columna a la base de datos ni migración.
- La tarjeta reemplaza `Tráfico` por `DHCP`, con icono Wi-Fi y el número de leases `bound`.
- El refresco usa el snapshot en segundo plano que ya existía en Gestión de Red; no se agrega polling continuo.

### Rendimiento / rollback
- Solo se añade una lectura DHCP dentro de la conexión de snapshot ya abierta.
- Se conservan CPU, memoria, ping, PPPoE, colas, identidad, estados, mapa, edición y eliminación.
- `PANEL_VERSION = "1.3.31"`.
- Backup previo: `backup/pre-router-dhcp-metric-1.3.31-20260912`.
- Rama: `work/router-dhcp-metric-1.3.31-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.30 — Sistema operativo y tema claro/oscuro
- Ajustes > Sistema quedó marcado como **Operativo**.
- La configuración de zona horaria se adaptó correctamente a tema claro y oscuro.
- Se conserva servidor/MariaDB en UTC y no requiere migración destructiva.
- Informe: `docs/INFORME_ZONA_HORARIA_1.3.30.md`.
- Backup: `backup/pre-system-theme-operativo-20260912`.

## 1.3.29 — Zona horaria configurable
- Ajustes > Sistema incorporó `app_timezone`, con `America/Lima` como valor predeterminado.
- AutomatizadoVIP interpreta timestamps del servidor en UTC y los presenta según la zona configurada.
- Informe: `docs/INFORME_ZONA_HORARIA_1.3.29.md`.
- Backup: `backup/pre-timezone-settings-20260912`.

## 1.3.28 — Iconos MikroTik de alto contraste
- Iconos de CPU, Memoria, Ping, PPPoE, Colas, Tráfico y mapa con fondos sólidos y SVG blanco.
- Backup: `backup/pre-router-icon-contrast-1.3.28-20260912`.

## 1.3.27 — Identidad MikroTik en bloque propio
- Nombre, IP:puerto y modelo usan un bloque independiente y visible.
- Backup: `backup/pre-router-identity-panel-1.3.27-20260912`.

## 1.3.26 — Cabecera MikroTik con identidad visible
- Intento previo de reforzar por CSS la identidad; quedó supersedido por 1.3.27.
- Backup: `backup/pre-router-header-contrast-1.3.26-20260912`.

## 1.3.25 — Contraste reforzado en tarjetas MikroTik
- Etiquetas, valores e iconos con mayor contraste.
- Backup: `backup/pre-router-card-contrast-1.3.25-20260912`.

## 1.3.24 — Tarjeta MikroTik completamente clara
- Superficies blancas/gris suave y tema oscuro solo cuando se declara explícitamente.
- Backup: `backup/pre-router-card-light-1.3.24-20260912`.

## 1.3.23 — Rediseño moderno de tarjetas MikroTik
- Tarjetas modernas con estado, métricas, ubicación y acciones compactas.
- Backup: `backup/pre-router-card-modern-1.3.23-20260912`.

## 1.3.22 — Selección real desde toda la tarjeta + contraste de eliminar
- Eliminado contenedor invisible que interceptaba `pointerdown`.
- Backup: `backup/pre-router-card-center-click-1.3.22-20260912`.

## 1.3.21 — Contraste de estado/acción y selección inmediata
- OFFLINE rojo sólido; eliminación visible; selección por `pointerdown`.
- Backup: `backup/pre-router-card-highlight-select-1.3.21-20260912`.

## 1.3.20 — Acción eliminar compacta
- Botón de texto reemplazado por icono `Trash2`.
- Backup: `backup/pre-router-delete-icon-1.3.20-20260912`.

## 1.3.19 — Eliminar router visible
- Acción de borrado movida fuera de la cabecera estrecha.
- Backup: `backup/pre-router-delete-visible-1.3.19-20260912`.

## 1.3.18 — Carga no bloqueante en Gestión de Red
- Las tarjetas aparecen tras `GET /api/routers`; estado y métricas se refrescan después en segundo plano.
- Backup: `backup/pre-router-loading-hotfix-1.3.18-20260912`.

## 1.3.17 — Orden compacto + eliminar por tarjeta
- Distribución compacta desde la izquierda y eliminación por tarjeta.
- Backup: `backup/pre-router-card-order-delete-1.3.17-20260912`.

## 1.3.16 — Hotfix alta MikroTik
- Coordenadas vacías se normalizan para evitar 422/React error #31.
- Backup: `backup/pre-router-create-hotfix-1.3.16-20260912`.

## 1.3.15 — Restauración publicada del estado funcional 1.3.9
- Re-publicación con número superior para actualizar desde 1.3.14.

## 1.3.9 — Gestión individual por servicio opcional
- Ajustes → Configuración clientes permite pausar/suspender/reactivar un servicio sin afectar los demás.
- Activo, pausado y suspendido continúan consumiendo capacidad.
- Backup: `backup/pre-individual-service-control-1.3.9-20260912`.

## 1.3.8 — Capacidad de licencia por servicios registrados
- La capacidad se contabiliza por servicios; activo, suspendido y pausado consumen cupo.
- Solo baja/retiro definitivo libera capacidad.
- Backup: `backup/pre-service-capacity-1.3.8-20260912`.

## 1.3.7 — Mensaje comercial de WhatsApp
- Mensaje con Installation ID, plan, capacidad y estado.
- Backup: `backup/pre-whatsapp-message-1.3.7-20260912`.

## 1.3.6 — Licencia compacta y contacto central
- Contacto/WhatsApp sincronizado desde Web-Licence 1.4.7 mediante `GET /v1/public/contact`.
- Backup: `backup/pre-license-contact-sync-1.3.6-20260912`.

## Marcadores históricos preservados para regresión
- `1.3.0`.
- `Etapa 4/7`.
- `1.3.4`, regla histórica por abonados activos, supersedida por 1.3.8.
- `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- `1.3.5` con **Ya tengo una cuenta**, Perú +51.
- `Etapa 7/7`.

El detalle íntegro anterior permanece en `docs/history/` y en las ramas backup correspondientes.
