# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.1.3**

## Registro 1.0.98 — Navegación de Facturación

Se aplicó la mejora visual de las pestañas internas de Facturación del cliente: Facturas, Transacciones, Saldos y Configuración, con pestaña activa destacada, iconos, borde y glow. Se creó el backup `backup/pre-facturacion-tabs-resaltadas-2026-09-08`.

## Registro 1.0.99 — Editar saldo

**Tipo:** Funcionalidad / corrección operativa de Facturación → Saldos.

Se añadió el botón **Editar** en cada fila y el endpoint `PUT /api/clients/{client_id}/balances/{balance_id}`. Los movimientos ya aplicados conservan su importe para proteger la trazabilidad; los disponibles permiten editar monto y descripción.

## Registro 1.0.100 — Límite seguro al editar un saldo nuevo

**Tipo:** Corrección / protección de saldo.

Se resolvió el caso saldo anterior S/. 30.00 + nuevo movimiento S/. 100.00 = S/. 130.00. El movimiento nuevo puede reducirse hasta cero, no superar su importe original ni cambiar de signo; los movimientos anteriores/aplicados permanecen protegidos. El backend también valida el límite.

### Backup

`backup/pre-editar-saldos-2026-09-08`

### Pruebas pendientes heredadas

- [ ] `yarn build`;
- [ ] 30 + 100 = 130;
- [ ] editar 100 → 0 y confirmar saldo 30;
- [ ] intentar 100 → 101 y confirmar advertencia;
- [ ] validar Factura libre y aplicación automática de saldos.

## Registro 1.1.0 — Transición de versionado

Al alcanzar 1.0.99, el siguiente ciclo pasa a 1.1.0. Se creó `backup/pre-version-1.1.0-2026-09-08` y se dejó la regla explícita en `frontend/src/modules/system-update/version.js`.

## Registro 1.1.1 — Log operativo y auditoría del cliente

**Tipo:** Funcionalidad / auditoría operativa.

La pestaña **Log** de la ficha del cliente presenta el historial persistente de acciones. Cada evento muestra acción, detalle, fecha/hora y la cuenta que ejecutó la operación. El backend obtiene la identidad desde la sesión autenticada.

### Backup

`backup/pre-log-cliente-2026-09-08`

### Estado heredado

El registro anterior cubría Resumen, Servicio, Facturación/Saldos mediante callback, comunicaciones y documentos, pero Facturación/Saldos todavía podía producir el detalle genérico **“Facturación actualizada”**.

## Registro 1.1.2 — Auditoría detallada por operación

**Tipo:** Corrección / mejora de auditoría.

### Causa

Al agregar un saldo, el Log mostraba solamente **“Facturación actualizada”**, sin explicar qué operación concreta se realizó. Esto no permite auditar correctamente una cuenta cuando existen varios movimientos.

### Solución

La auditoría de Facturación ahora registra detalles específicos desde backend:

- **Saldo agregado:** tipo (saldo a favor/deuda), monto, descripción, saldo neto resultante y factura de origen cuando existe.
- **Saldo editado:** ID del movimiento, monto anterior → nuevo, descripción anterior → nueva y saldo neto resultante.
- **Factura creada:** número, tipo (servicio/libre), plan, monto base, período, vencimiento y aplicación automática de saldo/deuda.
- **Factura editada:** únicamente los campos que realmente cambiaron, mostrando valor anterior → nuevo.
- **Factura eliminada:** número, monto y período.
- **Factura anulada:** número, monto, período y estado anterior cuando corresponde.
- **Pago registrado:** monto de la operación, método, referencia, acumulado pagado, total de factura y estado resultante.
- **Factura mensual generada:** número, período, monto base, vencimiento y aplicaciones automáticas de saldo/deuda.
- **Factura vencida:** número, monto pendiente, vencimiento y días de gracia.
- **Factura preparada para envío:** número y canal.

Cada evento incorpora la **cuenta autenticada y el rol**. El frontend no puede indicar manualmente otra cuenta.

### Archivos modificados

- `backend/app/routers/facturacion/client_balances.py` — auditoría detallada de altas y ediciones de saldos.
- `backend/app/routers/facturacion/invoice_actions.py` — auditoría detallada de edición, eliminación, anulación y preparación de envío de facturas.
- `backend/app/routers/facturacion/router.py` — auditoría detallada de creación de facturas, pagos, facturación mensual automática y vencimientos.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.1.2 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — continuidad diaria.

### Flujo

```text
Administrador / Técnico
        ↓
realiza operación
        ↓
backend valida y ejecuta
        ↓
ClientActivity
        ├── acción específica
        ├── detalle de valores
        ├── cuenta
        ├── rol
        └── fecha/hora
        ↓
GET /api/clients/{id}
        ↓
Log del cliente
```

### Ejemplo esperado

```text
Saldo agregado
Se agregó saldo a favor por S/. 100.00.
Descripción: pago adelantado.
Saldo neto resultante: S/. 130.00.
Cuenta: admin@ejemplo.pe | Rol: admin
```

Si luego se edita ese movimiento:

```text
Saldo editado
Se modificó el movimiento 7400c0d2.
monto: S/. 100.00 → S/. 0.00.
Saldo neto resultante: S/. 30.00.
Cuenta: admin@ejemplo.pe | Rol: admin
```

### Base de datos

No se crean tablas nuevas ni se eliminan datos. Se reutiliza `client_activities` y los modelos existentes de facturación/saldos.

### Backup

Se creó antes del cambio funcional:

`backup/pre-log-detallado-2026-09-08`

El backup conserva el estado anterior a esta mejora.

### Pruebas

- [x] backup creado;
- [x] auditoría de alta de saldo;
- [x] auditoría de edición de saldo;
- [x] auditoría de creación de factura;
- [x] auditoría de edición de factura;
- [x] auditoría de eliminación/anulación;
- [x] auditoría de pago;
- [x] auditoría de facturación mensual y vencimientos;
- [x] cuenta y rol tomados de sesión autenticada;
- [x] versión 1.1.2 y CHANGELOG actualizados;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] prueba real agregando saldo desde el panel;
- [ ] prueba real editando saldo desde el panel;
- [ ] prueba con administrador y técnico;
- [ ] confirmar que no aparezca nuevamente el mensaje genérico para estas operaciones.

### Riesgos / pendientes

- El build React/backend todavía debe ejecutarse en el servidor.
- Debe verificarse visualmente que los detalles largos se presenten correctamente en la tarjeta del Log.
- Las acciones antiguas ya almacenadas con “Facturación actualizada” no pueden reconstruirse automáticamente si no existe detalle histórico adicional; las nuevas operaciones sí quedan detalladas.

### Resultado

**1.1.2 publicada en `main` con backup y continuidad diaria actualizada.** Falta ejecutar build y validación funcional real antes de declarar la versión completamente validada.

## Registro 1.1.3 — Eliminación detallada de servicios

**Tipo:** Corrección / auditoría operativa.

### Causa

Al eliminar un servicio adicional con varios servicios dentro de la misma ficha, el Log registraba únicamente **“Servicio editado”** o un mensaje genérico de operación. No permitía saber qué servicio concreto desapareció ni si junto con él se eliminaron facturas pendientes/deuda.

### Solución

Se creó un endpoint de eliminación auditada que conserva el flujo existente de confirmación de facturas pendientes y, después de ejecutar correctamente la operación, registra en `client_activities`:

- número del servicio eliminado;
- plan y precio;
- tipo de conexión;
- tecnología;
- MikroTik asociado;
- IP;
- usuario PPPoE;
- zona;
- estado anterior;
- cantidad de facturas pendientes eliminadas;
- monto total de esas facturas;
- número, monto y estado de cada factura eliminada;
- o, si no había deuda pendiente, la indicación explícita de que no se eliminó deuda/factura pendiente;
- cuenta autenticada y rol que ejecutó la eliminación.

Las facturas pagadas o parcialmente pagadas no forman parte de las facturas eliminables por este flujo.

### Archivos modificados

- `backend/app/routers/clientes/service_delete_audit.py` — nuevo endpoint auditado para eliminación de servicios.
- `backend/server.py` — registra el endpoint auditado antes del endpoint histórico para que la operación del panel quede detallada.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.1.3 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — continuidad diaria.

### Flujo

```text
Administrador / Técnico
        ↓
Eliminar servicio
        ↓
¿Tiene facturas pendientes?
   ├── Sí → confirmación explícita
   └── No → continúa
        ↓
limpiar PPPoE / cola MikroTik
        ↓
eliminar servicio
        ↓
eliminar únicamente facturas pendientes permitidas
        ↓
recalcular deuda pendiente del cliente
        ↓
ClientActivity
        ├── servicio exacto
        ├── configuración relevante
        ├── deuda/facturas eliminadas
        ├── importes
        ├── cuenta
        └── rol
        ↓
Log del cliente
```

### Ejemplo esperado

```text
Servicio eliminado
Servicio 2 eliminado | Plan: PLAN50 | Precio: S/. 50.00 |
Conexión: PPPoE | Tecnología: fiber | MikroTik: RB-01 |
IP: 10.0.0.25 | Usuario PPPoE: cliente002 | Zona: Zona Norte |
Estado anterior: active |
Deuda/facturas pendientes eliminadas: 1 por S/. 50.00 |
Facturas eliminadas: REC-202609-ABCD: S/. 50.00 (unpaid) |
Cuenta: tecnico@ejemplo.pe | Rol: tecnico
```

Si no había deuda:

```text
Deuda/facturas pendientes del servicio: ninguna eliminada.
```

### Protección

La confirmación existente sigue siendo obligatoria cuando hay facturas pendientes. Si la operación falla al limpiar MikroTik, el servicio no se registra como eliminado y no se genera el evento de eliminación completada.

### Backup

Antes de esta modificación se creó:

`backup/pre-log-servicio-detallado-2026-09-08`

Además se conserva el respaldo documental:

`docs/BACKUP_LOG_SERVICIO_ELIMINADO_2026-09-08.md`

### Pruebas

- [x] backup creado antes del cambio;
- [x] endpoint auditado creado;
- [x] registro de servicio, plan, precio, conexión, tecnología, router, IP, PPPoE, zona y estado;
- [x] registro de cantidad y total de facturas pendientes eliminadas;
- [x] registro individual de cada factura eliminada;
- [x] registro explícito cuando no existe deuda pendiente;
- [x] cuenta autenticada y rol incluidos;
- [x] confirmación de facturas pendientes conservada;
- [x] facturas pagadas/parcialmente pagadas protegidas por el flujo existente;
- [x] versión 1.1.3 y CHANGELOG actualizados;
- [ ] `yarn build`;
- [ ] prueba real eliminando servicio sin deuda;
- [ ] prueba real eliminando servicio con factura pendiente;
- [ ] verificar Log con administrador;
- [ ] verificar Log con técnico;
- [ ] confirmar que ya no aparezca el evento genérico para eliminación de servicio.

### Riesgos / pendientes

- El build React/backend y la prueba real en servidor siguen pendientes.
- Debe verificarse que el orden de rutas de FastAPI mantenga el endpoint auditado como primera coincidencia para DELETE del servicio.
- La auditoría de eliminación se genera después de completar la operación; una eliminación histórica anterior no puede reconstruirse automáticamente.

### Resultado

**1.1.3 publicada en `main` con backup y continuidad diaria actualizada.** Falta ejecutar build y validación funcional real antes de declarar la versión completamente validada.

## Despliegue

```bash
cd /var/www/mikrohub
git status --short
git fetch origin main
git checkout main
# revisar status/diff antes de cualquier reset
git reset --hard origin/main
bash setup_debian.sh
grep PANEL_VERSION frontend/src/modules/system-update/version.js
git rev-parse --short HEAD
supervisorctl status mikrosmart_backend
```

No borrar la base de datos ni datos existentes para solucionar problemas visuales o funcionales.

## Referencias

- Bitácora maestra: `docs/CONTINUIDAD_MIKROHUB.md`
- Continuidad específica de Saldos: `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md`
- Backup de navegación: `backup/pre-facturacion-tabs-resaltadas-2026-09-08`
- Backup de edición: `backup/pre-editar-saldos-2026-09-08`
- Backup de transición de versión: `backup/pre-version-1.1.0-2026-09-08`
- Backup de Log: `backup/pre-log-cliente-2026-09-08`
- Backup de Log detallado: `backup/pre-log-detallado-2026-09-08`
- Backup de auditoría de servicio: `backup/pre-log-servicio-detallado-2026-09-08`
