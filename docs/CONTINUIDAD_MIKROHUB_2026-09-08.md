# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.1.1**

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

### Objetivo

La pestaña **Log** de la ficha del cliente deja de mostrar un estado vacío y presenta el historial persistente de acciones realizadas sobre ese cliente. Cada evento muestra acción, detalle, fecha/hora y la cuenta que ejecutó la operación.

### Regla de cuenta

Las nuevas actividades registradas por el editor toman la cuenta autenticada desde el backend (`get_current_user`). El frontend no puede indicar manualmente otro operador. El detalle incluye correo de la cuenta y rol cuando están disponibles, para distinguir administradores y técnicos.

### Acciones cubiertas

- edición de datos de Resumen;
- edición de Servicio;
- operaciones de Facturación y Saldos realizadas desde la ficha;
- comunicaciones Email/SMS ya registradas por el módulo de cliente;
- documentos adjuntados/eliminados ya registrados por el módulo de cliente.

Las pestañas Tickets y Estadísticas continúan sin operaciones persistentes propias en la ficha actual, por lo que no generan eventos hasta que tengan funciones reales.

### Archivos modificados

- `backend/app/modules/client_workspace/router.py` — endpoint `POST /api/clients/{client_id}/activity`, registra la cuenta autenticada y rol sin aceptar operador desde frontend.
- `frontend/src/modules/clientes/ClientActivityLog.jsx` — nueva vista visual del historial.
- `frontend/src/modules/clientes/ClientDetail.jsx` — integración del Log y registro de acciones de Resumen, Servicio y Facturación.
- `frontend/src/modules/system-update/version.js` — versión 1.1.1 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — esta entrada.

### Flujo

```text
Administrador / Técnico
        ↓
realiza una acción en la ficha
        ↓
acción operativa exitosa
        ↓
POST /clients/{id}/activity
        ↓
backend toma usuario autenticado
        ↓
ClientActivity(operator_name, acción, detalle, fecha)
        ↓
GET /clients/{id}
        ↓
pestaña Log muestra historial
```

### Protección

No se almacenan contraseñas, tokens ni credenciales. El operador se obtiene de la sesión autenticada. El registro de actividad no modifica la operación principal si el endpoint de auditoría falla; en ese caso la acción funcional permanece y se registra el error técnico en consola.

### Backup

Se creó antes de la modificación:

`backup/pre-log-cliente-2026-09-08`

### Pruebas

- [x] backup creado antes del cambio;
- [x] endpoint de actividad protegido por autenticación;
- [x] operador obtenido del usuario autenticado;
- [x] rol/cuenta incluidos en el detalle cuando existe correo;
- [x] Log visual conectado a `client.activities`;
- [x] Resumen registra edición;
- [x] Servicio registra edición;
- [x] Facturación/Saldos registra actividad mediante callback de actualización;
- [x] Comunicaciones y documentos ya tenían auditoría con operador;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] prueba real con cuenta administrador;
- [ ] prueba real con cuenta técnico;
- [ ] editar Resumen y confirmar cuenta, fecha, hora y detalle;
- [ ] editar Servicio y confirmar cuenta;
- [ ] agregar/editar saldo y confirmar evento en Log;
- [ ] crear factura/pago/anular y confirmar evento en Log.

### Resultado

**1.1.1 está publicada en `main`**, con backup y continuidad diaria actualizada. Falta ejecutar build y validación funcional en el panel antes de declarar la versión completamente validada.

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
