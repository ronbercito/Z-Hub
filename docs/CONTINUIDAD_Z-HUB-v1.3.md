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

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.19 — Botón Eliminar router realmente visible

**Incidencia real:** en 1.3.18 la lógica de borrado estaba presente, pero en tarjetas MikroTik compactas el icono de papelera compartía la cabecera con coordenadas y estado ONLINE/OFFLINE. En anchos estrechos podía quedar visualmente recortado o pasar inadvertido.

### Corrección
- `RouterCard.jsx` mueve la acción de borrado fuera del grupo superior estrecho.
- Cada MikroTik con permiso `network.delete` muestra ahora un botón rotulado **Eliminar router** dentro de la propia tarjeta.
- El botón conserva confirmación previa y usa `DELETE /api/routers/{id}`.
- Se mantiene manejo seguro de errores y se agrega timeout de 8 s a la eliminación.
- El ancho de tarjeta MikroTik pasa de 290 px a 310 px para mejorar legibilidad sin volver a generar grandes separaciones.
- No cambia la acción de borrado de OLTs.

### Pruebas / rollback
- Nuevo contrato: `backend/tests/test_router_delete_visible_1319_contract.py`.
- `PANEL_VERSION = "1.3.19"`.
- Backup previo: `backup/pre-router-delete-visible-1.3.19-20260912`.
- Rama: `work/router-delete-visible-1.3.19-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.18 — Hotfix de carga no bloqueante en Gestión de Red
- Las tarjetas se muestran inmediatamente después de `GET /api/routers`.
- Estado/CPU/RAM/ping se refrescan luego en segundo plano.
- Routers offline o lentos ya no bloquean la vista en `Cargando equipos...`.
- Timeout en snapshots automáticos y acciones manuales.
- Backup: `backup/pre-router-loading-hotfix-1.3.18-20260912`.

## 1.3.17 — Orden compacto de tarjetas MikroTik + eliminar por tarjeta
- Distribución compacta desde la izquierda mediante `router-card-layout.css`.
- Primera incorporación de borrado desde tarjeta, corregida visualmente en 1.3.19.
- Backup: `backup/pre-router-card-order-delete-1.3.17-20260912`.

## 1.3.16 — Hotfix alta de Router MikroTik
- Coordenadas vacías se normalizan a `0.0` para evitar `422`.
- Evita React error #31 al registrar routers sin ubicación.
- Backup: `backup/pre-router-create-hotfix-1.3.16-20260912`.

## 1.3.15 — Restauración publicada del estado funcional 1.3.9
- Re-publicación con número superior para permitir actualizar desde 1.3.14.
- Base funcional restaurada desde `backup/pre-client-status-cards-1.3.10-20260912`.

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

## Marcadores históricos preservados para regresión
- `1.3.0`.
- `Etapa 4/7`.
- `1.3.4`, regla histórica por abonados activos, supersedida por 1.3.8.
- `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- `1.3.5` con **Ya tengo una cuenta**, Perú +51.
- `Etapa 7/7`.

El detalle íntegro anterior permanece en los archivos de `docs/history/` y en las ramas backup correspondientes.
