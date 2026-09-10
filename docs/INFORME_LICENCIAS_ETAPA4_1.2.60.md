# Z-Hub 1.2.60 — Licencias Etapa 4/7: interfaz de licencia

## Objetivo
Mostrar dentro de Ajustes el estado real de la licencia de la instalación usando el License Manager local implementado en las etapas anteriores.

## Implementación
- La tarjeta `Licencia Z-Hub` pasa de En desarrollo a Operativo en Ajustes.
- Se crea `frontend/src/modules/ajustes/LicenseSettings.jsx`.
- Se crea `frontend/src/modules/ajustes/license-settings.css` con soporte para tema claro y oscuro.
- `SettingsModal.jsx` abre una ventana dedicada para la sección `license`.
- Se agrega `GET /api/settings/license-info` como vista de solo lectura de la licencia.

## Información mostrada
Para licencias pagadas:
- Estado de licencia.
- Plan contratado.
- Abonados contabilizados.
- Capacidad máxima autorizada.
- Abonados disponibles.
- Barra visual de consumo.
- Titular y correo cuando existen en el registro.
- Clave de licencia enmascarada.

Para licencias ilimitadas:
- Se muestra capacidad `Ilimitada` y `Sin límite` en disponibles.
- No se muestra fecha de vencimiento porque las licencias pagadas no vencen.

Para Trial:
- Se muestran los días restantes de los 30 días de prueba.
- Se informa que el Trial dispone de todas las funciones y no está limitado por cantidad de abonados.

## Seguridad
- La clave completa de licencia no se envía a la interfaz; el endpoint devuelve `license_key_masked`.
- `license_key`, `license_type`, `license_plan`, `license_max_clients` y `license_activated_at` quedan protegidos contra edición mediante `PUT /api/settings`.
- Esos metadatos internos dejan de salir en el `GET /api/settings` genérico.
- La interfaz de licencia es exclusivamente de lectura en esta etapa.

## Compatibilidad
- No modifica clientes existentes.
- No modifica MikroTik ni OLT.
- No modifica facturación.
- No cambia los planes de internet del ISP.
- No cambia la regla `CLIENT_LIMIT_REACHED` implementada en la Etapa 3.
- No aplica todavía el bloqueo posterior al vencimiento del Trial; eso corresponde a la Etapa 5.

## Backup
- Rama: `backup/pre-license-stage4-1.2.59-20260910`
- HEAD protegido: `240d5a6fea6557c21e2b6df459736aa4cd43a8de`
- Registro: `docs/backups/1.2.59/LICENSE_STAGE4_BACKUP.md`

## Calidad
Se agrega `backend/tests/test_license_stage4_contract.py` al workflow `Z-Hub Quality`. El contrato valida la tarjeta operativa, la vista dedicada, la API de solo lectura, el enmascarado de la clave y la protección de metadatos internos.

## Versión
`PANEL_VERSION` pasa de `1.2.59` a `1.2.60`.

## Siguiente etapa
Etapa 5/7 — completar el comportamiento del Trial de 30 días, sus avisos y la política posterior al vencimiento sin eliminar datos.
