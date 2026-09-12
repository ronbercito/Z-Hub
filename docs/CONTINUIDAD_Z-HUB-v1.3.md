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

## 1.3.12 — Ajuste visual de cartillas contra referencia aprobada

**Motivo:** la validación real de 1.3.11 mostró una cartilla demasiado plana y fría frente a la maqueta aprobada. Se corrige la presentación tomando como objetivo directo sus tonos, bordes, sombras, avatar, módulos y densidad visual.

### Diseño
- Activo: cartilla verde pastel completa, borde verde y avatar verde sólido.
- Pausado: cartilla ámbar/crema completa, borde ámbar y avatar ámbar sólido.
- Suspendido/cortado: cartilla rojo/rosa pastel completa, borde rojo y avatar rojo sólido.
- Bordes de 2 px, sombra exterior suave y barra lateral del color de estado.
- Los módulos de deuda/estado y la ficha técnica inferior usan superficies blancas translúcidas, borde fino y sombra discreta.
- Se reduce espacio vacío y se mejora jerarquía de nombre, contacto, plan, IP/router, deuda, estado y acciones.
- Se conservan todos los datos y botones existentes; no se cambia la lógica de clientes.

### Rendimiento
- Solo cambia `client-status-cards.css`; no agrega API, polling, workers ni consultas a MikroTik.
- Se reutiliza el mismo DOM y los datos ya cargados por Clientes.

### Versionado / rollback
- `PANEL_VERSION = "1.3.12"`.
- Backup: `backup/pre-client-card-reference-1.3.12-20260912`.
- Rama: `work/client-card-reference-1.3.12-20260912`.
- No modifica el contrato Z-Hub ↔ Web-Licence.

---

## 1.3.11 — Cartilla visual enriquecida de Clientes

- Primer intento de composición enriquecida; la validación real mostró que todavía se percibía plana frente a la referencia.
- Backup: `backup/pre-client-card-visual-1.3.11-20260912`.

---

## 1.3.10 — Cartillas visuales de clientes por estado

- Introduce tonos por estado: activo verde, pausado ámbar, suspendido/cortado rojo.
- Backup: `backup/pre-client-status-cards-1.3.10-20260912`.

---

## 1.3.9 — Gestión individual por servicio opcional

- Ajustes → Configuración clientes permite activar gestión individual por servicio.
- Servicio principal y adicionales pueden pausar, suspender/cortar o reactivar individualmente.
- Activo, suspendido y pausado continúan consumiendo capacidad; solo baja definitiva libera cupo.
- Backup: `backup/pre-individual-service-control-1.3.9-20260912`.

---

## 1.3.8 — Capacidad de licencia por servicios registrados

- La capacidad se contabiliza por servicios, no por abonados activos.
- Servicio principal y adicionales consumen un cupo cada uno en estados `active`, `suspended` o `paused`.
- Suspender/cortar o pausar no libera capacidad; solo baja/retiro definitivo.
- Límites: TRIAL 20; PLAN_100 100; PLAN_300 300; PLAN_500 500; PLAN_1000 1000; ILIMITADO sin límite.
- Backup: `backup/pre-service-capacity-1.3.8-20260912`.

---

## 1.3.7 — Mensaje comercial de WhatsApp
- Mensaje ordenado con Installation ID, plan, capacidad y estado.
- Backup: `backup/pre-whatsapp-message-1.3.7-20260912`.

## 1.3.6 — Licencia compacta y contacto central
- Contacto/WhatsApp sincronizado desde Web-Licence 1.4.7.
- Backup: `backup/pre-license-contact-sync-1.3.6-20260912`.

## Marcadores históricos preservados para regresión
- `1.3.0`: inicio de la serie 1.3.x.
- `Etapa 4/7`: HW-ID/Auto-TRIAL histórico.
- `1.3.4`: regla histórica por abonados activos, **supersedida por 1.3.8**. Backup `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- `1.3.5`: Setup Wizard, **Ya tengo una cuenta**, Perú +51.
- `Etapa 7/7`: validación integral histórica.

## Historial anterior
El detalle íntegro se conserva en `docs/history/CONTINUIDAD_Z-HUB-pre-1.3.8.md`. No borrar.