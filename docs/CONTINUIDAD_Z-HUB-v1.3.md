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

## 1.3.24 — Tarjeta MikroTik completamente clara

**Motivo:** la validación real de 1.3.23 mostró que la composición moderna mejoró, pero el bloque CPU/Memoria/Ping podía verse como una franja azul/oscura incluso con el panel claro. Se alinea toda la tarjeta al estilo claro aprobado.

### Cambios visuales
- Nuevo `frontend/src/modules/red/router-card-light-skin.css` cargado desde `RouterCardMetric.jsx`.
- En tema claro, cabecera, CPU/Memoria/Ping, PPPoE/Colas/Tráfico y pie usan superficies blancas o gris muy suave.
- Se mantienen textos oscuros, separadores claros, iconos pastel y barras de progreso con color.
- Los estados ONLINE/OFFLINE/ALERTA/DESCONOCIDO conservan su contraste.
- Mapa, editar y eliminar permanecen como acciones compactas.
- La tarjeta sigue mostrando los datos de 1.3.23 y conserva selección por toda su superficie.

### Corrección de tema
- La piel clara se aplica por defecto siempre que el documento no declare explícitamente `dark` o `zhub-dark`.
- Esto evita que una ausencia/transición temporal del atributo de tema active por error la apariencia oscura.
- El tema oscuro sigue soportado cuando está seleccionado de forma explícita.

### Rendimiento / rollback
- Solo cambia CSS/presentación; no agrega API, polling ni consultas RouterOS.
- `PANEL_VERSION = "1.3.24"`.
- Backup previo: `backup/pre-router-card-light-1.3.24-20260912`.
- Rama: `work/router-card-light-1.3.24-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.23 — Rediseño moderno de tarjetas MikroTik

**Motivo:** se aprobó una maqueta visual nueva para Gestión de Red con tarjetas más claras, modernas y fáciles de leer, manteniendo intacta la lógica de carga rápida y conexión RouterOS lograda en 1.3.18–1.3.22.

### Diseño implementado
- Nueva composición blanca/clara por tarjeta MikroTik con bordes suaves, sombra y mayor separación visual.
- Cabecera con icono circular, nombre, IP:puerto, modelo/board y estado grande.
- Estados visuales: ONLINE verde, OFFLINE rojo, ALERTA ámbar y DESCONOCIDO gris.
- ALERTA es solo una interpretación visual local cuando el router está online pero presenta CPU/memoria muy alta o latencia elevada; no cambia el estado persistido en backend.
- Bloque superior de métricas: CPU, memoria y ping con barras visuales.
- Bloque secundario: sesiones PPPoE activas, colas activas y tráfico agregado, reutilizando campos ya existentes del snapshot RouterOS.
- Pie con ubicación/coordenadas y acciones compactas de mapa, editar y eliminar.
- `RouterCardMetric.jsx` separa la presentación de métricas del componente principal.
- La vista de OLT conserva su tratamiento existente para no introducir regresiones en esa sección.
- Tema oscuro compatible mediante estilos específicos.

### Rendimiento / interacción
- No agrega polling, workers ni consultas RouterOS nuevas por tarjeta.
- Reutiliza `cpu_usage_pct`, `memory_usage_pct`, `ping_ms`, `active_pppoe_count`, `active_queues_count`, `total_download_mbps`, `total_upload_mbps`, ubicación y coordenadas ya entregadas por `/api/routers` / snapshot.
- Conserva selección por `pointerdown` en toda la superficie de la tarjeta y evita que mapa/editar/eliminar propaguen el evento.
- Conserva carga no bloqueante de 1.3.18.

### Pruebas / rollback
- Nuevo contrato: `backend/tests/test_router_card_modern_1323_contract.py`.
- Se ajustan contratos históricos 1.3.20–1.3.22 para validar semántica en lugar de clases visuales ya supersedidas.
- `PANEL_VERSION = "1.3.23"`.
- Backup previo: `backup/pre-router-card-modern-1.3.23-20260912`.
- Rama: `work/router-card-modern-1.3.23-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.22 — Selección real desde toda la tarjeta + contraste de eliminar

**Incidencia real:** en 1.3.21 la zona inferior CPU/Mem/Ping seleccionaba de inmediato, pero la zona central de algunas tarjetas requería varios clics. La validación mostró que `RouterCard` renderizaba un contenedor de `children` aunque sus hijos condicionales fueran `null/false`; ese contenedor vacío tenía `onPointerDown={stopPointer}` y bloqueaba la selección en el centro.

### Correcciones
- `RouterCard.jsx` normaliza `children` con `React.Children.toArray(children).filter(Boolean)`.
- El bloque interno que detiene propagación solo se renderiza cuando existen controles/hijos reales.
- Las tarjetas no seleccionadas ya no tienen una zona central invisible que intercepte `pointerdown`.
- Se conserva selección inmediata por `pointerdown`, teclado y protección de acciones internas.
- `router-card-layout.css` corrige la regla antigua del tema claro que dejaba la papelera rosada/pálida: ahora usa rojo sólido, icono blanco, borde blanco y halo visible.
- OFFLINE conserva el rojo sólido de 1.3.21.
- No cambia API, consultas RouterOS, métricas ni carga en segundo plano.

### Pruebas / rollback
- Nuevo contrato: `backend/tests/test_router_card_center_click_1322_contract.py`.
- `PANEL_VERSION = "1.3.22"`.
- Backup previo: `backup/pre-router-card-center-click-1.3.22-20260912`.
- Rama: `work/router-card-center-click-1.3.22-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.21 — Contraste de estado/acción y selección inmediata de tarjetas

**Motivo:** validación real de 1.3.20 mostró dos detalles visuales y uno de interacción: el icono de eliminar todavía tenía poco contraste, el estado OFFLINE no resaltaba suficiente y al cambiar entre tarjetas a veces era necesario insistir con varios clics.

### Correcciones
- OFFLINE pasa a rojo sólido con texto blanco, borde claro y sombra para lectura inmediata.
- Eliminar router usa botón rojo sólido de 40 × 40 px, icono blanco más grande, borde blanco y halo rojo.
- La tarjeta seleccionada recibe borde/halo cian o violeta más visible según tipo.
- La selección de tarjeta se dispara en `pointerdown`, evitando depender del `click` tardío y haciendo el cambio perceptible desde la primera pulsación.
- Acciones internas (coordenadas, eliminar, editar/controles hijos) detienen `pointerdown` para no cambiar de tarjeta accidentalmente.
- Se agrega soporte de teclado `Enter`/espacio mediante `role="button"` y `tabIndex=0`.
- No cambia API, carga en segundo plano, métricas ni conexión RouterOS.

### Pruebas / rollback
- Nuevo contrato: `backend/tests/test_router_card_highlight_select_1321_contract.py`.
- `PANEL_VERSION = "1.3.21"`.
- Backup previo: `backup/pre-router-card-highlight-select-1.3.21-20260912`.
- Rama: `work/router-card-highlight-select-1.3.21-20260912`.
- No cambia el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.20 — Acción eliminar compacta mediante icono moderno

- Botón de texto reemplazado por icono `Trash2` compacto.
- Conserva confirmación, permisos y `DELETE /api/routers/{id}`.
- Backup: `backup/pre-router-delete-icon-1.3.20-20260912`.

## 1.3.19 — Botón Eliminar router realmente visible
- Acción de borrado movida fuera de la cabecera estrecha.
- Backup: `backup/pre-router-delete-visible-1.3.19-20260912`.

## 1.3.18 — Hotfix de carga no bloqueante en Gestión de Red
- Las tarjetas se muestran inmediatamente después de `GET /api/routers`.
- Estado/CPU/RAM/ping se refrescan luego en segundo plano.
- Routers offline o lentos ya no bloquean la vista en `Cargando equipos...`.
- Timeout en snapshots automáticos y acciones manuales.
- Backup: `backup/pre-router-loading-hotfix-1.3.18-20260912`.

## 1.3.17 — Orden compacto de tarjetas MikroTik + eliminar por tarjeta
- Distribución compacta desde la izquierda mediante `router-card-layout.css`.
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
