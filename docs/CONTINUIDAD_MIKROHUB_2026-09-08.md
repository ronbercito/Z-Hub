# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.0.100**

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
