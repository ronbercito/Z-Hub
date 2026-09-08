# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.0.99**

## Registro 1.0.98 — Navegación de Facturación

Se aplicó la mejora visual de las pestañas internas de Facturación del cliente: Facturas, Transacciones, Saldos y Configuración, con pestaña activa destacada, iconos, borde y glow. Se creó el backup `backup/pre-facturacion-tabs-resaltadas-2026-09-08`.

## Registro 1.0.99 — Editar saldo

**Tipo:** Funcionalidad / corrección operativa de Facturación → Saldos.

### Objetivo
Permitir que el administrador corrija un saldo registrado por error sin tener que crear un movimiento duplicado.

### Solución
Se añadió un botón **Editar** en cada fila del historial de Saldos.

El formulario permite modificar:

- monto;
- descripción.

### Protección de trazabilidad

Si el movimiento todavía no fue aplicado y mantiene todo su importe disponible, se permite editar el monto y la descripción.

Si el movimiento ya fue aplicado a una factura, el monto queda bloqueado para no alterar retrospectivamente una factura ni romper el libro mayor. En ese caso se puede corregir únicamente la descripción.

### Backend

Nuevo endpoint:

```text
PUT /api/clients/{client_id}/balances/{balance_id}
```

Valida que el movimiento pertenezca al cliente visible y protege los movimientos aplicados/parcialmente consumidos.

### Frontend

Archivo:

`frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx`

Se añadió:

- estado de edición;
- modal reutilizado para crear/editar;
- botón Editar por movimiento;
- bloqueo visual del monto cuando ya fue aplicado;
- recarga del saldo e historial después de guardar.

### Archivos modificados

- `backend/app/routers/facturacion/client_balances.py` — endpoint seguro de edición.
- `frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx` — botón, modal y flujo de edición.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.0.99 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — esta entrada diaria.

### Base de datos

No se crean tablas nuevas ni se eliminan datos. La edición reutiliza los campos existentes de `client_balances`.

### Flujo

```text
Saldos
  ↓
Historial
  ↓
Editar
  ↓
¿Movimiento disponible completo?
  ├─ Sí → editar monto + descripción
  └─ No → monto bloqueado, editar descripción
  ↓
Guardar
  ↓
Recalcular saldo mostrado
```

### Backup

Antes de modificar `main` se creó:

`backup/pre-editar-saldos-2026-09-08`

Este backup conserva el estado anterior a 1.0.99 y debe mantenerse hasta validar el panel.

### Pruebas

- [x] backup creado antes del cambio;
- [x] endpoint revisado para pertenencia al cliente;
- [x] protección de movimientos ya aplicados;
- [x] interfaz de edición integrada al historial;
- [x] versión 1.0.99 y CHANGELOG actualizados;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] prueba en panel de editar saldo disponible;
- [ ] prueba de edición de descripción en saldo aplicado;
- [ ] prueba de Factura libre y aplicación automática después de editar;
- [ ] validación final de Facturas, Transacciones y Configuración.

### Resultado

El cambio está publicado en `main`. La validación de build y producción queda pendiente y no debe declararse completa hasta probar el flujo real.

### Riesgos

No se permite modificar el importe de movimientos que ya participaron en una aplicación a factura. Esto es deliberado para proteger la trazabilidad contable.

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

No borrar la base de datos ni datos existentes para solucionar un problema visual o funcional.

## Referencias

- Bitácora maestra: `docs/CONTINUIDAD_MIKROHUB.md`
- Continuidad específica de Saldos: `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md`
- Backup anterior de navegación: `backup/pre-facturacion-tabs-resaltadas-2026-09-08`
- Backup actual: `backup/pre-editar-saldos-2026-09-08`
