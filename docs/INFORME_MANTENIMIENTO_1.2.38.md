# Informe de republicación — Z-Hub 1.2.38

**Fecha:** 2026-09-10  
**Repositorio:** `ronbercito/Z-Hub`  
**Rama:** `main`  
**Versión anterior:** 1.2.37  
**Versión publicada:** 1.2.38

## Motivo

Se republica íntegramente la base saneada de Z-Hub 1.2.37 como versión 1.2.38 para que el Centro de Actualizaciones detecte nuevamente una versión superior y vuelva a descargar/aplicar el estado completo actual de `main`.

No se revirtieron ni reescribieron las correcciones funcionales de 1.2.37. El código saneado continúa siendo el mismo; el cambio visible principal es `PANEL_VERSION = "1.2.38"` y su changelog actualizado.

## Contenido incluido

La 1.2.38 conserva las correcciones de 1.2.37 relacionadas con:

- seguridad del instalador y protección de `backend/.env`;
- sesión persistente mediante cookie httpOnly y JWT fuera de `localStorage`;
- consistencia entre Z-Hub y MikroTik para suspensión, reactivación y eliminación;
- conservación del pago aunque RouterOS no pueda reactivar el servicio;
- retiro de clientes sin destruir historial administrativo;
- comunicaciones Email/SMS sin falsa confirmación de envío;
- restricciones del endpoint genérico de Ajustes;
- cifrado de secretos con `APP_ENCRYPTION_KEY` independiente;
- fecha operativa con `America/Lima` por defecto;
- logging de workers;
- estados cerrados de Recuperación de equipos;
- correcciones de permisos;
- saneamiento del arranque de base de datos;
- pruebas de regresión y GitHub Actions.

## Backup previo

Antes de republicar se preservó el estado completo de 1.2.37 en:

`backup/pre-republish-1.2.37-20260910`

Commit respaldado:

`8abd0aaccd422c10ba4d101758ba88a15447936d`

También se creó `docs/backups/1.2.37/REPUBLISH_1.2.38_BACKUP.md`.

## Seguridad de datos

La republicación no borra ni reinicializa MariaDB y no elimina clientes, facturas, historial, ONU, NAP, IP ni configuración MikroTik. El actualizador debe traer el árbol completo vigente de `main` y ejecutar el flujo normal de instalación/actualización.

## Validación

La base de 1.2.37 ya había superado compilación Python, contratos pytest y build React en GitHub Actions. La publicación 1.2.38 vuelve a disparar el mismo workflow para confirmar que el nuevo HEAD mantiene esas validaciones.

## Pruebas que siguen dependiendo del servidor real

Después de instalar 1.2.38 todavía corresponde comprobar en producción: arranque con MariaDB real, login y recarga, listado de clientes, MikroTik, facturación, pausas, retiros, Recuperación de equipos y consultas OLT.

## Resultado esperado

El Centro de Actualizaciones debe presentar Z-Hub 1.2.38 como una versión nueva incluso en un servidor que ya hubiera recibido 1.2.37, permitiendo reaplicar el estado completo saneado del repositorio.
