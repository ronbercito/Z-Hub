# MikroHub — Continuidad específica 1.1.1 — Log del cliente

**Fecha:** 2026-09-08

## Objetivo

Hacer funcional la pestaña **Log** de la ficha del cliente para que muestre el historial persistente de acciones realizadas sobre el cliente y quién las ejecutó.

## Cuenta ejecutora

Las nuevas actividades del editor se registran mediante `POST /api/clients/{client_id}/activity`. El backend obtiene la cuenta directamente de `get_current_user`; el frontend no puede seleccionar ni falsificar el operador. Se muestra nombre, fecha/hora y en el detalle se conserva correo y rol cuando están disponibles.

## Cobertura

- Resumen: edición de datos personales.
- Servicio: edición de configuración del servicio.
- Facturación: acciones que disparan la actualización del módulo, incluyendo Saldos.
- Email/SMS: ya registraba operador en el workspace de cliente.
- Documentos: ya registraba operador en el workspace de cliente.

## Archivos

- `backend/app/modules/client_workspace/router.py`
- `frontend/src/modules/clientes/ClientActivityLog.jsx`
- `frontend/src/modules/clientes/ClientDetail.jsx`
- `frontend/src/modules/system-update/version.js`

## Backup

`backup/pre-log-cliente-2026-09-08`

## Versión

`PANEL_VERSION = 1.1.1`

## Pruebas pendientes

- Build React.
- Editar como administrador y confirmar nombre/cuenta/fecha/hora.
- Editar como técnico y confirmar nombre/cuenta/fecha/hora.
- Agregar/editar saldo y confirmar actividad.
- Crear/editar/anular/pagar factura y confirmar actividad.

## Riesgo conocido

Algunas rutas históricas de `backend/app/routers/clientes/router.py` ya generan `ClientActivity` sin pasar explícitamente la cuenta y pueden dejar eventos antiguos con `operator_name=Sistema`. Las nuevas acciones del editor usan el endpoint autenticado y muestran la cuenta real. La normalización de todos los eventos históricos debe hacerse como tarea separada para no alterar el historial existente.
