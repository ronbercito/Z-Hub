# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.1.0**

## Registro 1.0.98 — Navegación de Facturación

Se aplicó la mejora visual de las pestañas internas de Facturación del cliente: Facturas, Transacciones, Saldos y Configuración, con pestaña activa destacada, iconos, borde y glow. Se creó el backup `backup/pre-facturacion-tabs-resaltadas-2026-09-08`.

## Registro 1.0.99 — Editar saldo

**Tipo:** Funcionalidad / corrección operativa de Facturación → Saldos.

Se añadió el botón **Editar** en cada fila y el endpoint `PUT /api/clients/{client_id}/balances/{balance_id}`. Los movimientos ya aplicados conservan su importe para proteger la trazabilidad; los disponibles permiten editar monto y descripción.

## Registro 1.0.100 — Límite seguro al editar un saldo nuevo

**Tipo:** Corrección / protección de saldo.

### Objetivo

Resolver el caso en que el cliente ya tiene un saldo anterior y se agrega otro movimiento. Ejemplo: saldo anterior S/. 30.00 + nuevo saldo S/. 100.00 = S/. 130.00. El administrador debe poder editar únicamente el movimiento nuevo, sin alterar los S/. 30.00 anteriores.

### Regla implementada

Para un movimiento nuevo o completamente disponible:

- se puede reducir el monto hasta S/. 0.00;
- no se puede aumentar por encima del monto original;
- no se puede cambiar saldo a favor por deuda ni deuda por saldo a favor;
- si el original fue S/. 100.00 y se intenta guardar S/. 101.00, el sistema rechaza la operación y muestra: **“No es posible. El monto máximo a editar es S/. 100.00.”**;
- si se guarda S/. 0.00, ese movimiento deja de aportar al saldo neto, pero permanece en el historial para conservar el registro de la corrección.

Los movimientos ya aplicados o parcialmente consumidos mantienen el monto bloqueado.

### Archivos modificados

- `frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx` — validación visual, límites `min/max`, advertencia y edición a cero para movimientos disponibles.
- `backend/app/routers/facturacion/client_balances.py` — validación servidor del importe máximo, signo del movimiento y edición a cero.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.0.100 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — esta entrada.

### Flujo

```text
Saldo anterior 30
  +
Nuevo movimiento 100
  ↓
Saldo mostrado 130
  ↓
Editar movimiento nuevo
  ├─ 0 a 100 → permitido
  ├─ 101 → rechazado con advertencia
  └─ -100 → rechazado por cambio de tipo
```

### Base de datos

No se crean tablas nuevas ni se eliminan datos. Se reutilizan `amount` y `remaining_amount` de `client_balances`.

### Backup

Antes de esta corrección se creó:

`backup/pre-editar-saldos-2026-09-08`

Debe conservarse hasta validar la actualización en el panel.

### Pruebas

- [x] backup creado;
- [x] validación frontend del máximo original;
- [x] validación backend del máximo original;
- [x] protección contra cambio de signo;
- [x] edición a S/. 0.00 para retirar el aporte del movimiento nuevo;
- [x] movimientos aplicados permanecen bloqueados;
- [x] versión 1.0.100 y CHANGELOG actualizados;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] prueba real: 30 + 100 = 130;
- [ ] editar 100 → 0 y confirmar saldo 30;
- [ ] intentar 100 → 101 y confirmar advertencia;
- [ ] validar que el movimiento anterior de 30 no cambia;
- [ ] validar Factura libre y aplicación automática de saldos.

### Resultado

La corrección está publicada en `main`. Falta validación de build y del flujo real en el panel antes de declarar 1.0.100 completamente validada.

## Registro de continuidad — 2026-09-08 — Panel 1.1.0

**Tipo:** Gestión de versiones / transición de ciclo.

### Regla solicitada

Al alcanzar **1.0.99**, el siguiente ciclo de versión debe pasar a **1.1.0**, en lugar de continuar con 1.0.100.

### Aplicación

Se actualizó `frontend/src/modules/system-update/version.js` para que la versión funcional vigente sea **1.1.0** y se añadió el cambio al CHANGELOG visible del panel.

La transición mantiene intactas las funciones de Saldos y edición implementadas previamente; únicamente se corrige el esquema de numeración para iniciar el ciclo 1.1.x.

### Backup

Se creó:

`backup/pre-version-1.1.0-2026-09-08`

Este backup conserva el estado anterior a la transición de numeración.

### Archivos

- `frontend/src/modules/system-update/version.js` — nueva versión 1.1.0 y regla de transición.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — registro de esta transición.
- `docs/BACKUP_VERSION_1.0.100_TO_1.1.0.md` — referencia documental de la transición.

### Pruebas

- [x] backup creado antes de la modificación de versión;
- [x] `PANEL_VERSION` actualizado a 1.1.0;
- [x] CHANGELOG actualizado;
- [x] continuidad diaria actualizada;
- [ ] `yarn build`;
- [ ] instalación mediante Centro de Actualizaciones;
- [ ] confirmar versión visible 1.1.0 después de iniciar sesión.

### Resultado

**1.1.0 está publicada en `main`.** La numeración queda establecida para que después de 1.0.99 el ciclo continúe como 1.1.x.

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
