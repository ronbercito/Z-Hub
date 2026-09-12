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
- estado completo previo a 1.3.27 preservado en `backup/pre-router-identity-panel-1.3.27-20260912`.

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.27 — Identidad MikroTik en bloque propio

**Motivo:** la validación real de 1.3.26 mostró que la zona superior seguía prácticamente igual: la estrella y el estado se veían, pero nombre, IP:puerto y modelo continuaban sin resaltar. La corrección por CSS sobre `h3`/`p` no fue suficiente frente a reglas heredadas del tema.

### Corrección aplicada
- La identidad ya no usa `h3` ni `p` en esa zona; se renderiza con spans dedicados: `router-modern-identity-name`, `router-modern-identity-address` y `router-modern-identity-model`.
- Se crea `router-modern-identity-panel`, un bloque visual suave entre el icono circular y ONLINE/OFFLINE.
- Nombre, IP y modelo tienen `color` y `-webkit-text-fill-color` forzados, además de `opacity:1` y `visibility:visible`.
- Se agregan fallbacks visibles para nombre, IP, puerto y modelo si alguno llega vacío.
- Tema oscuro mantiene colores equivalentes de alto contraste.
- No se agregan API, polling ni consultas RouterOS.

### Rollback / ramas
- `PANEL_VERSION = "1.3.27"`.
- Backup previo: `backup/pre-router-identity-panel-1.3.27-20260912`.
- Rama de trabajo: `work/router-identity-panel-1.3.27-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.26 — Cabecera MikroTik con identidad visible
- Intento previo de reforzar por CSS el bloque `router-modern-title-wrap`; la validación real confirmó que no resolvió completamente el problema visual.
- Backup: `backup/pre-router-header-contrast-1.3.26-20260912`.

## 1.3.25 — Contraste reforzado en tarjetas MikroTik
- Etiquetas, valores e iconos de CPU, memoria, ping, PPPoE, colas y tráfico con mayor contraste.
- Backup: `backup/pre-router-card-contrast-1.3.25-20260912`.

## 1.3.24 — Tarjeta MikroTik completamente clara
- Superficies blancas/gris suave y tema oscuro solo cuando se declara explícitamente.
- Backup: `backup/pre-router-card-light-1.3.24-20260912`.

## 1.3.23 — Rediseño moderno de tarjetas MikroTik
- Tarjetas modernas con estado, métricas, ubicación y acciones compactas.
- Backup: `backup/pre-router-card-modern-1.3.23-20260912`.

## 1.3.22 — Selección real desde toda la tarjeta + contraste de eliminar
- Se elimina el contenedor invisible que interceptaba `pointerdown` y se refuerza la papelera.
- Backup: `backup/pre-router-card-center-click-1.3.22-20260912`.

## 1.3.21 — Contraste de estado/acción y selección inmediata de tarjetas
- OFFLINE rojo sólido; eliminación visible; selección por `pointerdown`.
- Backup: `backup/pre-router-card-highlight-select-1.3.21-20260912`.

## 1.3.20 — Acción eliminar compacta mediante icono moderno
- Botón de texto reemplazado por icono `Trash2` compacto.
- Backup: `backup/pre-router-delete-icon-1.3.20-20260912`.

## 1.3.19 — Botón Eliminar router realmente visible
- Acción de borrado movida fuera de la cabecera estrecha.
- Backup: `backup/pre-router-delete-visible-1.3.19-20260912`.

## 1.3.18 — Hotfix de carga no bloqueante en Gestión de Red
- Las tarjetas se muestran inmediatamente después de `GET /api/routers` y las métricas se refrescan en segundo plano.
- Backup: `backup/pre-router-loading-hotfix-1.3.18-20260912`.

## 1.3.17 — Orden compacto de tarjetas MikroTik + eliminar por tarjeta
- Distribución compacta desde la izquierda y eliminación por tarjeta.
- Backup: `backup/pre-router-card-order-delete-1.3.17-20260912`.

## 1.3.16 — Hotfix alta de Router MikroTik
- Coordenadas vacías se normalizan a `0.0` para evitar `422` y React error #31.
- Backup: `backup/pre-router-create-hotfix-1.3.16-20260912`.

## 1.3.15 — Restauración publicada del estado funcional 1.3.9
- Re-publicación con número superior para actualizar desde 1.3.14.

## 1.3.9 — Gestión individual por servicio opcional
- Ajustes → Configuración clientes permite activar gestión individual por servicio.
- Pausar/suspender/reactivar un servicio no afecta los demás.
- Activo, pausado y suspendido continúan consumiendo capacidad.
- Backup: `backup/pre-individual-service-control-1.3.9-20260912`.

## 1.3.8 — Capacidad de licencia por servicios registrados
- La capacidad se contabiliza por servicios, no por abonados activos.
- Servicio principal y adicionales consumen un cupo cada uno en `active`, `suspended` o `paused`.
- Solo baja/retiro definitivo libera capacidad.
- Backup: `backup/pre-service-capacity-1.3.8-20260912`.

## 1.3.7 — Mensaje comercial de WhatsApp
- Mensaje ordenado con Installation ID, plan, capacidad y estado.
- Backup: `backup/pre-whatsapp-message-1.3.7-20260912`.

## 1.3.6 — Licencia compacta y contacto central
- Contacto/WhatsApp sincronizado desde Web-Licence 1.4.7 mediante `GET /v1/public/contact`.
- `ZHUB_LICENSE_WHATSAPP` permanece como fallback.
- Backup: `backup/pre-license-contact-sync-1.3.6-20260912`.

## Marcadores históricos preservados para regresión
- `1.3.0`.
- `Etapa 4/7`.
- `1.3.4`, regla histórica por abonados activos, supersedida por 1.3.8.
- `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- `1.3.5` con **Ya tengo una cuenta**, Perú +51.
- `Etapa 7/7`.

El detalle íntegro anterior permanece en los archivos de `docs/history/` y en las ramas backup correspondientes.
