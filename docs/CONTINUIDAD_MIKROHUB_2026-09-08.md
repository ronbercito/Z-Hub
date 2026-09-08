# MikroHub — Continuidad 2026-09-08

> **Documento interno de continuidad.** No forma parte del panel, no se importa desde React/FastAPI y no debe copiarse al build público.

## Versión funcional

**1.0.98**

## Resumen de la entrega

Se aplicó una mejora visual a la navegación interna de **Facturación dentro de la ficha del cliente**, tomando como referencia el diseño aprobado: pestañas amplias, visibles, con iconos y un estado activo luminoso para facilitar la ubicación del administrador.

## Backup previo

Antes de modificar `main` se creó la rama:

`backup/pre-facturacion-tabs-resaltadas-2026-09-08`

La rama conserva el estado anterior al cambio visual y debe mantenerse hasta validar el build y el panel real.

## Cambio visual 1.0.98

### Archivo principal

`frontend/src/modules/clientes/editor/billing/ClientBilling.jsx`

### Navegación

La barra interna ahora muestra claramente:

- **Facturas** — icono de documento.
- **Transacciones** — icono de intercambio.
- **Saldos** — icono de saldo/cartera.
- **Configuración** — icono de configuración.

La pestaña activa utiliza:

- fondo cian translúcido;
- borde resaltado;
- icono cian ampliado;
- línea inferior luminosa;
- sombra/glow suave.

Las pestañas inactivas conservan contraste y efecto hover. La distribución es responsive: dos columnas en pantallas pequeñas y cuatro en pantallas grandes.

### Encabezado

Se añadió una identificación visual de **Facturación** y una descripción indicando que las pestañas permiten administrar facturas, transacciones, saldos y configuración.

Se conservaron las tarjetas de resumen:

- Facturado.
- Pagado.
- Por cobrar.

## Compatibilidad

No se cambiaron endpoints, tablas ni reglas de negocio.

Se conserva el flujo existente de:

- Factura libre.
- Factura de servicios.
- Facturas.
- Transacciones.
- Saldos.
- Configuración.
- Pagos.
- Aplicación automática de saldos.

## Saldos 1.0.96–1.0.97

El módulo mantiene el libro mayor de saldos:

- positivo = saldo a favor;
- negativo = deuda;
- crédito positivo se aplica automáticamente a facturas futuras;
- excedente permanece disponible;
- deuda negativa se suma completa a la siguiente factura, incluso si supera el monto base;
- las aplicaciones conservan trazabilidad de factura origen/destino.

Ejemplos de validación:

```text
500 → factura base 50 → factura final 50 → pagada → saldo restante 450
-100 → factura base 50 → factura final 150 → deuda consumida 100
```

## Archivos de 1.0.98

- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — navegación y composición visual.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.0.98 y changelog.
- `docs/CONTINUIDAD_MIKROHUB.md` — bitácora maestra pendiente de consolidación por el mecanismo de reemplazo completo del archivo.
- `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md` — continuidad específica de Saldos actualizada a 1.0.98.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — esta continuidad diaria consolidada.

## Commits

- Cambio visual: `7ddae5b12235f5b9dce43a0ce6154ffefb3a5590`
- Versión 1.0.98: `f2d098facf6aea953df195eb768e3dc56ad1ae3d`
- Continuidad Saldos actualizada: `2a76212a080c52b6814dbffc74a4014ca67d4bdd`

## Pruebas

- [x] backup creado antes de modificar `main`;
- [x] revisión del propietario real del comportamiento;
- [x] cambio visual limitado a Facturación del cliente;
- [x] versión 1.0.98 registrada;
- [x] endpoints y base de datos sin cambios deliberados;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] validación visual en navegador/servidor;
- [ ] prueba de las cuatro pestañas después de instalar 1.0.98;
- [ ] prueba de Factura libre y aplicación de Saldos después del despliegue.

## Resultado

La mejora visual está publicada en `main`. La validación de build y producción queda pendiente; no se debe afirmar que 1.0.98 está completamente validada hasta ejecutar esas comprobaciones.

## Regla de despliegue

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

No borrar la base de datos ni datos existentes para solucionar un problema visual. Si el build falla, revisar el error real y usar el backup/rollback antes de realizar cambios adicionales.

## Regla para futuras sesiones

Antes de continuar con Facturación o Actualizaciones, leer:

1. `README.md`
2. `docs/CONTINUIDAD_MIKROHUB.md`
3. `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md`
4. `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md`

Este documento es documentación interna y no debe entrar en el build público.
