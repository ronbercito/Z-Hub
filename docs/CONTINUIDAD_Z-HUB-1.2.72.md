# Z-Hub 1.2.72

Fecha: 2026-09-11

## Objetivo

Alinear la pantalla **Ajustes → Licencia Z-Hub** con el estado real del motor de licencias después de la Etapa 6 y de la corrección TRIAL 1.2.71, sin activar ni reemplazar automáticamente la licencia instalada.

## Causa

La interfaz todavía mostraba textos antiguos que indicaban que el TRIAL no tenía límite de abonados. Desde 1.2.71 el backend local y el License Server aplican un máximo de **20 abonados** al TRIAL. Además, el endpoint `/api/license/info` ya entregaba `installation_id`, `validation_source`, `license_server_enabled`, `license_server_online` y `grace_until`, pero la pantalla no los mostraba.

## Solución

- La pantalla de licencia informa que el TRIAL dura 30 días y admite hasta 20 abonados.
- TRIAL muestra las mismas métricas de consumo que una licencia limitada: usados, capacidad, disponibles y barra de uso.
- Se agrega una tarjeta de **License Server** con estados modo local, configurado, conectado o temporalmente sin conexión.
- Se muestra la fuente de validación: `remote`, `cache`, `local-transition` o `local` con etiquetas amigables.
- Se muestra `installation_id` en la ficha de licencia.
- Si existe `grace_until`, se informa la fecha/hora de gracia.
- No se introduce una activación automática de la licencia remota ni se sustituye la licencia local existente durante la actualización.

## Archivos modificados

- `frontend/src/modules/ajustes/LicenseSettings.jsx`
  - corrige texto TRIAL;
  - agrega métricas para TRIAL;
  - agrega estado de License Server, fuente de validación, installation ID y gracia.
- `frontend/src/modules/ajustes/license-settings.css`
  - estilos de la tarjeta de License Server y del identificador de instalación.
- `frontend/src/modules/system-update/version.js`
  - versión visible `1.2.72` y CHANGELOG.
- `backend/tests/test_license_stage4_contract.py`
  - contrato actualizado para exigir límite TRIAL de 20 y campos de validación remota.

## Backup

Antes de modificar `main` se creó:

`backup/pre-license-panel-1.2.72-20260911`

Base del backup:

`9c849166275015414b3d6f353ea24d1b9703cd32`

## Pruebas y verificación

- Revisión estática del contrato visual de licencia.
- Se conserva `GET /api/license/info` como fuente de estado.
- La vista no agrega `PUT`, `PATCH` ni `DELETE` para modificar metadatos internos.
- La activación continúa usando únicamente el endpoint explícito `POST /api/license/activate` para administradores.
- Debe verificarse GitHub Actions después de publicar en `main`; no declarar CI exitoso hasta observar el resultado real.

## Estado de infraestructura relacionado

El License Server de laboratorio quedó operativo antes de esta actualización:

- Uvicorn administrado por `systemd` en `127.0.0.1:8090`.
- Nginx termina HTTPS en `192.168.10.240`.
- `/health` responde `{"ok":true,"service":"zhub-license-server","version":"1.2.1"}`.
- HTTP redirige a HTTPS.

La instalación cliente Z-Hub todavía debe confiar en la CA del laboratorio y disponer de la clave pública RSA para habilitar efectivamente la validación remota. Esos secretos/materiales de confianza no se incrustan en el frontend ni se publica la clave privada del License Server.

## Riesgos y pendientes

- Mientras `ZHUB_LICENSE_SERVER_URL` no esté configurado y la clave pública no sea accesible, el panel mostrará **Modo local**.
- Para el laboratorio con CA propia, el host Z-Hub debe confiar en la CA antes de que `urllib` pueda validar HTTPS.
- `private.pem` nunca debe copiarse al panel Z-Hub ni al repositorio.
- Después de habilitar el remoto, comprobar que `/api/license/info` muestre `license_server_enabled: true` y una fuente `remote` o `cache` según corresponda.
- No activar la licencia TRIAL remota sobre una instalación productiva con licencia PAID local hasta completar la prueba controlada.
