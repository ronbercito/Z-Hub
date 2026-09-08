# Continuidad MikroHub — 2026-09-08 — Corrección 1.0.78 de confirmación de eliminación

## 1. Problema confirmado
Se realizaron nuevas pruebas con `prueba` y `prueba2`. La ventana propia de eliminación continuaba mostrando `Servicios: 0`, `Facturas pendientes: 0` y `S/. 0.00`.

La captura de `prueba` vuelve a confirmar que la ficha del cliente contiene información que la ventana no estaba reflejando. En la ficha ya se habían comprobado dos servicios y dos facturas pendientes por S/.100.00.

## 2. Revisión de causa raíz
La versión 1.0.77 seguía usando un flujo indirecto: `Clients.jsx` ejecutaba `window.confirm()` y el guardia esperaba el DELETE para consultar `deletion-summary`.

Aunque `GET /api/clients/{client_id}/deletion-summary` existe y está registrado, esta capa intermedia no era necesaria y no garantizaba que el modal utilizara exactamente las respuestas que ya funcionan en las pestañas del cliente.

Las fuentes funcionales existentes son:
- `GET /api/clients/{client_id}/services` — devuelve el servicio principal y los adicionales.
- `GET /api/clients/{client_id}/invoices` — devuelve las facturas del cliente.
- `GET /api/clients/{client_id}` — devuelve el nombre real del cliente.

## 3. Corrección aplicada en 1.0.78
`frontend/src/constants/clientDeleteGuard.js` fue reestructurado para que, al detectar la solicitud DELETE de un cliente, consulte directamente las tres APIs anteriores antes de permitir el borrado.

La ventana ahora recibe:
- nombre desde el detalle real del cliente;
- lista completa de servicios desde `/services`;
- facturas pendientes filtrando estados `unpaid` y `overdue`;
- saldo pendiente calculado como `amount - paid_amount` por factura;
- advertencia prioritaria cuando hay más de un servicio y al menos una factura pendiente.

Si cualquiera de las consultas necesarias falla, el DELETE se cancela por seguridad.

El `confirm()` nativo solo se neutraliza para la pregunta específica de eliminación de clientes; la decisión real ocurre en el modal de MikroHub y exige escribir `SI`.

## 4. Archivos funcionales modificados
- `frontend/src/constants/clientDeleteGuard.js` — consulta directa y modal crítico.
- `frontend/src/modules/system-update/version.js` — versión `1.0.78` y changelog visible.

## 5. Backend existente
Se conserva `backend/app/routers/clientes/deletion_summary.py` y su registro en `backend/server.py` como endpoint de resumen seguro, pero ya no es la fuente utilizada por la ventana de confirmación.

## 6. Commits
- `38b5a6bfd93d9ff9f1d99a1ad08a4a184acb3676` — consulta directa de servicios y facturas reales antes de eliminar.
- `520325f14d1bbf6d9c006a35e7b7cfe31b5c7de4` — versión 1.0.78.

## 7. Prueba obligatoria antes de producción
En worktree aislado:

```bash
cd /tmp/mikrohub-build-debug
git fetch origin main
git checkout --detach origin/main
cd frontend
rm -rf node_modules
yarn install --network-timeout 100000
DISABLE_ESLINT_PLUGIN=true CI= yarn build 2>&1 | tee /tmp/mikrohub-build-error.log
```

Debe aparecer `Compiled successfully.`.

## 8. Prueba funcional posterior
Con 1.0.78 instalada, abrir eliminación de `prueba` y no confirmar el borrado hasta verificar visualmente:
- Cliente: `prueba`.
- Servicios: `2`.
- Servicio principal · PLAN50.
- Servicio 2 · PLAN50.
- Facturas pendientes: `2`.
- Saldo pendiente: `S/.100.00`.
- Advertencia prioritaria.
- Campo obligatorio `SI`.

También probar un cliente sin servicios adicionales ni facturas pendientes.

**No eliminar ningún cliente durante la prueba hasta verificar visualmente el resumen.**

## 9. Política aplicada
Se revisó el código que seguía ejecutándose, se comparó con las APIs que ya funcionan en las pestañas Servicios y Facturación y se corrigió el flujo en su punto de entrada, evitando otra capa intermedia. La compilación aislada sigue siendo obligatoria antes de producción.
