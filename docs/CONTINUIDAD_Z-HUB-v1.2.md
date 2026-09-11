# Z-Hub — Bitácora de continuidad v1.2

## REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR

**Antes de modificar Z-Hub, leer esta bitácora y revisar el estado real de `main` en `ronbercito/Z-Hub`.** El repositorio MikroHub es legado y no se usa para desarrollo nuevo.

1. Identificar el propietario real del comportamiento y modificar solo lo necesario.
2. Crear respaldo antes de cambios críticos o delicados.
3. Probar razonablemente y declarar exactamente qué se probó y qué queda pendiente.
4. Todo cambio funcional incrementa `frontend/src/modules/system-update/version.js`; el CHANGELOG contiene solo la versión actual.
5. Actualizar esta bitácora en la misma entrega.
6. Verificar código, versión y bitácora en `main` antes de declarar la actualización publicada.
7. Nunca borrar la base de datos para corregir UI, subir secretos, ocultar errores de backend ni afirmar pruebas no realizadas.
8. Conservar datos reales y compatibilidad operacional. Seguir Vista React → API → FastAPI → modelo/DB/integración → resultado → build/despliegue.
9. La versión nueva siempre se inserta PRIMERA; las versiones inferiores permanecen debajo.
10. Cambio solo documental no incrementa `PANEL_VERSION`.

---

# HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO

## 2026-09-11 — Web-Licence separado a repositorio privado

- El servidor central de licencias y su License Center fueron migrados a `ronbercito/web-licence` (repositorio privado).
- Z-Hub ya no contiene el código del servidor (`license_server/`) ni sus pruebas/UI específicas.
- Z-Hub conserva únicamente el cliente de licenciamiento remoto, cache/JWT, activación y enforcement necesarios para comunicarse con Web-Licence.
- Los informes históricos `INFORME_LICENSE*` / `INFORME_LICENCIAS*` se migraron al nuevo repositorio antes de retirarlos de Z-Hub.
- No se movieron ni versionaron secretos, Admin Token, claves privadas, certificados privados ni SQLite productivo.
- Repo Web-Licence: `ronbercito/web-licence`.
- Backup previo de Z-Hub: `backup/pre-separate-web-licence-20260911`.
- Este cambio es estructural/documental; no altera el contrato remoto `/v1/licenses/validate` usado por el panel.



## PUNTO DE CONTINUIDAD ACTUAL — 2026-09-11 — Z-Hub 1.2.79 / Licencias 7/7

> **Este bloque es el punto de entrada recomendado para una conversación nueva.** Resume el estado real conocido de código, despliegues y licenciamiento. Antes de modificar, volver a verificar `main`, la versión instalada en `z2` y la versión desplegada en `web-licencia`.

### 1. Estado general del proyecto

- Repositorio activo: `ronbercito/Z-Hub`, rama productiva `main`. El repositorio MikroHub es legado y no se usa para desarrollo nuevo.
- Versión de código más reciente en `main`: **Z-Hub 1.2.79**.
- La 1.2.79 cerró el hardening visual de la Etapa 7/7 del License Center: claves de licencia e Installation ID se muestran enmascarados por defecto, conservando la acción `Copiar` para administradores autenticados.
- La Etapa **1/7 a 7/7 de licenciamiento quedó implementada en código**. Etapas 6 y 7 fueron validadas funcionalmente en laboratorio/producción parcial como se detalla abajo.
- La documentación específica de la serie 1.2 se consolidó en **`docs/CONTINUIDAD_Z-HUB-v1.2.md`**. No crear nuevos `CONTINUIDAD_Z-HUB-1.2.xx.md`; agregar aquí las próximas entradas 1.2.x.
- `docs/CONTINUIDAD_Z-HUB.md` se conserva como bitácora maestra general del proyecto.
- Cambio documental de consolidación: PR #8, merge `68b2bea88fa592f5fd3914d2cfac507e766bd116`.
- Release 1.2.79 / hardening License Center: PR #7, merge `339fcb3c0dc849847735271478fe8541d41f3317`.

### 2. Estado real de despliegues — NO asumir que `main` ya está instalado

#### Servidor Z-Hub `z2`

- Última versión confirmada manualmente en producción: **1.2.77**.
- 1.2.77 corrigió la persistencia de variables de License Server durante futuras actualizaciones.
- Verificación real confirmada después de actualizar 1.2.77:
  - `PANEL_VERSION = "1.2.77"`;
  - Supervisor conserva `ZHUB_LICENSE_SERVER_URL=https://192.168.10.240`;
  - Supervisor conserva `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE=/etc/zhub/licencia/server-public.pem`;
  - el proceso real `zhub_backend` heredó ambas variables;
  - panel mostró `TRIAL ACTIVO`, `License Server: Conectado`, `Fuente de validación: Servidor remoto`, capacidad 20.
- **Pendiente de confirmar/desplegar en z2:** 1.2.78/1.2.79. Se puede actualizar directamente a la versión disponible más reciente desde el Centro de Actualizaciones, pero después se debe comprobar que el License Server siga en modo remoto.
- Existe un stash de respaldo creado antes de la actualización manual 1.2.75: `stash@{0}: backup-local-z2-pre-1.2.75`. **No hacer `stash pop` automáticamente**; primero revisar su contenido y decidir si todavía contiene cambios locales que deban recuperarse.

#### License Server `web-licencia`

- LXC Debian 13.6, hostname `web-licencia`, IP LAN `192.168.10.240`, gateway `192.168.10.1`.
- Repositorio: `/opt/zhub-license-src`.
- Servicio: `zhub-license-server.service` con Uvicorn enlazado a `127.0.0.1:8090`, detrás de Nginx HTTPS.
- Último despliegue confirmado: commit `fbf6420` (release Z-Hub 1.2.78) con License Server **APP_VERSION 1.3.0** y servicio `active (running)`.
- La interfaz `/admin-ui` abrió correctamente con el Admin Token y mostró el dashboard de Etapa 7/7.
- **Pendiente:** hacer `git pull` de `main` para incorporar el hardening 1.2.79 en `web-licencia` y reiniciar `zhub-license-server`.
- En el propio `web-licencia`, un `curl https://192.168.10.240/health` llegó a fallar con `unable to get local issuer certificate`; se indicó instalar la CA local en `/usr/local/share/ca-certificates/zhub-lab-ca.crt` y ejecutar `update-ca-certificates`, pero esa corrección local del propio servidor no quedó confirmada por salida posterior. Esto no impidió la comunicación validada desde `z2`.

### 3. License Server — arquitectura y seguridad vigentes

- API y License Center central administran únicamente licenciamiento. MikroTik, OLT y datos operativos ISP permanecen locales en Z-Hub.
- HTTPS/Nginx configurado para `license.zhub.local` y `192.168.10.240`.
- CA de laboratorio: `/etc/zhub-license-server/tls/zhub-lab-ca.crt`.
- Certificado servidor: `/etc/zhub-license-server/tls/license.zhub.local.crt`.
- TLS private key: `/etc/zhub-license-server/tls/license.zhub.local.key` — **nunca copiar ni publicar**.
- Clave privada de firma RS256: `/etc/zhub-license-server/private.pem` — **nunca sale de `web-licencia`**.
- Clave pública RS256: `/etc/zhub-license-server/public.pem`.
- Admin Token: guardado en `/etc/zhub-license-server/server.env`; fue rotado durante las pruebas. **No registrar su valor en GitHub, chats ni capturas.**
- DB License Server: `/var/lib/zhub-license-server/licenses.db`.
- Servicio systemd usa usuario/grupo `zhub-license`, `ProtectSystem=strict`, `NoNewPrivileges=true` y acceso de escritura únicamente donde corresponde.

### 4. Confianza TLS y firma en `z2` — validado

- CA copiada en `z2` a `/usr/local/share/ca-certificates/zhub-lab-ca.crt` y registrada con `update-ca-certificates`.
- Clave pública RS256 copiada a `/etc/zhub/licencia/server-public.pem`.
- `curl https://192.168.10.240/health` desde `z2` funcionó sin `-k`.
- Python del mismo venv del backend (`/var/www/z-hub/backend/venv`) logró abrir `https://192.168.10.240/health` con HTTP 200.
- Prueba directa del código real `license_remote` completada con:
  - HTTPS/API: OK;
  - JWT recibido: OK;
  - firma JWT RS256: OK;
  - tipo TRIAL;
  - plan TRIAL;
  - estado ACTIVA;
  - `max_clients=20`.
- No usar `-k` en configuración productiva. Se utilizó únicamente como diagnóstico antes de arreglar la cadena de confianza.

### 5. Licencia de prueba real usada para validar extremo a extremo

- Cliente/ISP: **Fibra Z**.
- Tipo: `TRIAL`.
- Plan: `TRIAL`.
- Capacidad: **20 abonados**.
- Estado: `ACTIVA`.
- La clave completa no se documenta aquí; el License Center es la fuente autoritativa y la UI 1.2.79 la enmascara por defecto.
- Installation ID de `z2`: `8c565ddd-a389-4780-afec-3da3957348ef`.
- Instalación autorizada en License Center con nombre `Z-Hub Fibra Z`.
- `POST /v1/licenses/validate` respondió HTTP 200 y `valid:true`, entregando JWT firmado.
- La expiración central observada en la autorización fue `2026-10-11T02:15:22.163567+00:00`; por zona horaria Perú puede verse como 10/10/2026 local. Desde 1.2.76 el `expires_at` remoto firmado es la fuente autoritativa para Trials remotos, manteniendo fallback compatible para Trials locales antiguos.
- Periodo de gracia firmado observado hasta 2026-09-14 durante la validación; la gracia no debe extender un Trial más allá de su `expires_at`.

### 6. Evolución de licenciamiento completada

- **Etapa 1/7:** contrato/base de licencias.
- **Etapa 2/7 (1.2.58):** License Manager local.
- **Etapa 3/7 (1.2.59):** límite real de abonados.
- **Etapa 4/7 (1.2.60):** interfaz local de licencia.
- **Etapa 5/7 (1.2.61–1.2.62):** Trial 30 días, vencimiento y flujo de compra/recuperación.
- **Transición 1.2.63–1.2.65:** correcciones de estado/fallback histórico antes de remoto.
- **Etapa 6/7 (1.2.66 en adelante):** License Server remoto, HTTPS, RS256, JWT, instalación persistente, caché firmada y período de gracia.
- **1.2.67–1.2.70:** primer License Center web, automatización de claves/planes/Trials, claves largas 192 bits y TRIAL central forzado a 20 abonados / 30 días.
- **1.2.71:** enforcement local del Trial de 20 clientes.
- **1.2.72:** panel muestra fuente/servidor/instalación/gracia correctamente.
- **1.2.73:** bloqueo de recuperación obligatorio para `invalid`, `missing`, `trial_expired` o `read_only`, sin borrar datos.
- **1.2.74:** se retiraron DEMO empaquetadas como autorización productiva y snapshot persistido dejó de autorizar por sí solo.
- **1.2.75:** recuperación acepta PAID y TRIAL remotamente validadas; se validó activación real del TRIAL central en `z2`.
- **1.2.76:** `expires_at` remoto firmado pasa a ser autoritativo para Trials remotos.
- **1.2.77:** instalador preserva las variables de License Server en Supervisor entre actualizaciones; validado en `z2`.
- **1.2.78 / License Server 1.3.0:** cierre funcional de Etapa 7/7: resumen comercial, clientes/ISP, licencias, instalaciones, validaciones, filtros, métricas PAID/TRIAL, Trial próximo a vencer, rechazos, renovar Trial, suspender/revocar/reactivar y copiar datos.
- **1.2.79:** hardening final de la UI: claves e Installation ID enmascarados visualmente por defecto; acción Copiar mantiene el valor real para el admin autenticado.

### 7. Incidencias encontradas y correcciones importantes

- Python 3.13 rechazó inicialmente la CA porque no tenía `keyUsage`; se regeneró/corrigió la CA con `Basic Constraints CA:TRUE` y `Key Usage: Certificate Sign, CRL Sign`, y el certificado servidor quedó con `CA:FALSE`, `Digital Signature`, `Key Encipherment`, `TLS Web Server Authentication` y SAN DNS/IP.
- Después de corregir la CA, `z2` validó HTTPS tanto con `curl` como con Python/urllib.
- El panel seguía mostrando `License Server temporalmente inaccesible` hasta comprobar que el proceso real usara la CA y reiniciar correctamente el backend.
- El endpoint `/v1/licenses/validate` fue probado directamente y devolvió `valid:true`.
- Actualizar a 1.2.76 sobrescribió `zhub_backend.conf` y eliminó las variables remotas, provocando `Modo local`; se restauraron manualmente y 1.2.77 corrigió el instalador para preservarlas en futuras actualizaciones.
- No volver a insertar IP fija del laboratorio en el código. El License Server se configura por entorno.

### 8. Supervisor/backend de `z2`

- Backend: `/var/www/z-hub/backend`.
- Supervisor: `/etc/supervisor/conf.d/zhub_backend.conf`.
- Comando: `/var/www/z-hub/backend/venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2`.
- Variables remotas confirmadas en Supervisor y `/proc/<PID>/environ`:
  - `ZHUB_LICENSE_SERVER_URL=https://192.168.10.240`
  - `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE=/etc/zhub/licencia/server-public.pem`
- Backup manual conocido: `/etc/supervisor/conf.d/zhub_backend.conf.bak-1.2.75` y posteriormente otro backup creado durante la corrección 1.2.76.

### 9. License Center — funciones visibles/validadas

- Secciones: `Resumen`, `Clientes / ISP`, `Licencias`, `Instalaciones`, `Validaciones`.
- Dashboard observado con 1 cliente, 1 licencia activa, 1 TRIAL, 1 instalación activa y registros de validación/rechazo 24 h.
- La actividad reciente mostró correctamente a Fibra Z como activa.
- Los rechazos observados correspondían a pruebas previas de TLS/licencia y se conservaron como auditoría.
- Para entrar a `/admin-ui` se usa el Admin Token del servidor; el token no debe pegarse en chats ni aparecer en capturas.
- 1.2.79 corrige exposición visual excesiva de `license_key` e `installation_id`; los valores siguen disponibles mediante `Copiar` para administrador autenticado.

### 10. Backups y ramas relevantes de esta fase

- `backup/pre-license-lock-1.2.73-20260911`
- `backup/pre-remove-demo-license-1.2.74-20260911`
- `backup/pre-remote-license-1.2.75-20260911`
- `backup/pre-remote-trial-dates-1.2.76-20260911`
- `backup/pre-license-env-persistence-1.2.77-20260911`
- `backup/pre-stage7-hardening-1.2.79-20260911`
- `backup/pre-unify-v1.2-continuity-20260911`
- `backup/pre-handover-1.2.79-20260911`

### 11. Commits/PR principales recientes

- 1.2.74: merge `ac1c841ff0cd332b454c85618b9314536e4e4b35`.
- 1.2.75: merge `6304dc9047d73cc9ee9b2f5b277f29402fbe1e59`.
- 1.2.76: merge `fdf42686135fcc50ee35047ee2aae7656867375e`.
- 1.2.78: merge `fbf6420b0f794491836473a0006b20a47c2ce6f1`.
- 1.2.79: PR #7, merge `339fcb3c0dc849847735271478fe8541d41f3317`.
- Consolidación de bitácoras v1.2: PR #8, merge `68b2bea88fa592f5fd3914d2cfac507e766bd116`.

### 12. Próximo paso exacto recomendado para una conversación futura

1. Leer este bloque y verificar `main` antes de tocar código.
2. En `web-licencia`, comprobar `git status`, hacer `git pull --ff-only origin main`, reiniciar `zhub-license-server` y confirmar `/health`; esto debe incorporar el hardening 1.2.79.
3. Si el propio `web-licencia` aún falla al validar su certificado, instalar su CA pública en el trust store local y confirmar con `curl`/Python sin `-k`.
4. En `z2`, abrir Centro de Actualizaciones y actualizar desde 1.2.77 a la última 1.2.x disponible (actualmente 1.2.79 en `main`).
5. Después de actualizar `z2`, verificar:
   - `PANEL_VERSION`;
   - `environment=` de Supervisor;
   - variables `ZHUB_LICENSE_*` del proceso real;
   - `TRIAL ACTIVO`;
   - `License Server: Conectado`;
   - `Fuente de validación: Servidor remoto`;
   - capacidad 20 y vencimiento/gracia coherentes.
6. Abrir `/admin-ui` y confirmar visualmente que license key e Installation ID estén enmascarados por defecto y que `Copiar` siga funcionando.
7. Solo después de validar 1.2.79 en ambos servidores, revisar el stash antiguo de `z2`; no aplicarlo a ciegas.
8. Si todo queda correcto, registrar la validación productiva final en esta misma bitácora. No crear otro archivo de continuidad 1.2.x.

### 13. Reglas de seguridad que deben mantenerse

- Nunca subir ni copiar al repositorio `private.pem`, TLS private keys, Admin Token, contraseñas ni secretos de producción.
- `public.pem` y certificados públicos pueden distribuirse donde corresponda.
- No borrar/recrear bases de datos para corregir licenciamiento o UI.
- Una licencia inválida/vencida puede bloquear escritura/operación, pero **no elimina datos**.
- Ante caída temporal del License Server, usar únicamente la caché firmada/gracia definida; una negativa explícita del servidor no debe convertirse en fallback autorizado.
- Antes de cambios críticos, crear rama de backup.
- Todo cambio funcional incrementa versión; cambios exclusivamente documentales no incrementan `PANEL_VERSION`.


## 1.2.38 — 2026-09-10 — Republicación integral del saneamiento 1.2.37

- **Objetivo:** volver a entregar todo el saneamiento y las correcciones de 1.2.37 bajo un número de versión nuevo para que el Centro de Actualizaciones detecte una actualización completa como `1.2.38`.
- **Contenido:** 1.2.38 conserva íntegramente las correcciones de seguridad, integridad Z-Hub ↔ MikroTik, pagos, historial de retirados, autenticación con cookie httpOnly, cifrado independiente, zona horaria `America/Lima`, workers con logging, cierre de casos de Recuperación, permisos y calidad introducidas en 1.2.37.
- **Código funcional:** no se reescriben ni revierten los cambios ya saneados de 1.2.37; `main` mantiene esos archivos y se incrementa `PANEL_VERSION` para provocar una nueva entrega completa mediante el actualizador.
- **Backup integral previo:** antes de republicar se creó `backup/pre-republish-1.2.37-20260910`, apuntando exactamente al commit `8abd0aaccd422c10ba4d101758ba88a15447936d`.
- **Backup documental:** `docs/backups/1.2.37/REPUBLISH_1.2.38_BACKUP.md` registra la rama, commit y blobs previos.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` pasa a `1.2.38`; el changelog vuelve a enumerar el saneamiento completo y añade que se trata de una republicación solicitada.
- **Compatibilidad:** no se borra, reinicializa ni migra destructivamente MariaDB; no se eliminan clientes, facturas, ONU, NAP, IP, historial ni configuraciones MikroTik existentes.
- **Pruebas heredadas:** la base saneada de 1.2.37 ya había pasado compilación Python, contratos pytest y build React en GitHub Actions.
- **Pruebas de 1.2.38:** GitHub Actions debe volver a validar el nuevo HEAD; no se considera cerrada esa comprobación hasta que los jobs terminen.
- **Pruebas pendientes en producción:** actualizar desde el Centro de Actualizaciones, reiniciar/verificar backend contra MariaDB real, confirmar login/recarga, listado de clientes, MikroTik, facturación, pausas, retiros, Recuperación y OLT.
- **Resultado esperado:** un servidor que ya veía 1.2.37 debe detectar 1.2.38 y volver a aplicar el estado completo actual de `main` sin borrar datos.
- **Siguiente versión funcional:** `1.2.39`.

## 1.2.37 — 2026-09-10 — Saneamiento de seguridad, integridad y calidad

- **Objetivo:** corregir los hallazgos críticos y altos de la auditoría de 1.2.36 antes de continuar agregando funciones, protegiendo secretos, datos históricos y la sincronización con MikroTik.
- **Backup integral previo:** antes de modificar se creó la rama `backup/pre-maintenance-1.2.36-20260910`, apuntando exactamente al commit `d086581b5f8e09fcb518ea702b51a2950306bcdc`. `docs/backups/1.2.36/FULL_REPOSITORY_BACKUP.md` documenta el rollback.
- **Instalador:** se elimina el `chmod -R 755` global; `backend/.env` queda protegido con modo `600` y se aplican permisos diferenciados a directorios, código, scripts y frontend publicado.
- **MikroTik / Clientes:** suspensión, reactivación y eliminación definitiva solo modifican/eliminan el estado local cuando RouterOS confirma la operación. Un fallo externo ya no deja un estado local falso.
- **Pagos:** el hecho financiero se conserva aunque la reactivación automática en MikroTik falle. En ese caso el cliente permanece `suspended` y la API informa la incidencia para intervención.
- **Retiro:** deja de borrar facturas, tickets, tareas, documentos, comunicaciones, actividades y servicios. Se conserva historial; facturas pendientes se cancelan/archivan y servicios adicionales se conservan como retirados.
- **Comunicaciones:** Email/SMS sin proveedor real quedan como `registered` y la API responde `sent: false`; se elimina la falsa confirmación de entrega externa.
- **Autenticación:** la sesión persistente se apoya en cookie httpOnly; el JWT deja de guardarse en `localStorage`. Un encabezado histórico `Authorization: Bearer ` vacío ya no bloquea el fallback a la cookie. `SESSION_COOKIE_SECURE` permite exigir cookie Secure al desplegar con HTTPS.
- **Cifrado:** se agrega `APP_ENCRYPTION_KEY` independiente del `JWT_SECRET` para secretos SMTP, con compatibilidad de lectura para instalaciones antiguas.
- **Ajustes:** `PUT /api/settings` queda limitado a claves conocidas; secretos y contadores internos quedan fuera de la actualización genérica.
- **Zona horaria:** la operación de negocio usa `America/Lima` por defecto mediante `APP_TIMEZONE`; facturación, pausas y suspensión prolongada dejan de depender de la fecha UTC para decisiones diarias.
- **Workers:** los workers de pausa y suspensión prolongada registran excepciones en logs en vez de silenciarlas.
- **Recuperación:** `Recuperado` y `No recuperado` se consideran estados cerrados y no pueden reabrirse silenciosamente mediante PATCH.
- **Permisos/UI:** los submenús `settings_*` heredan consistentemente el permiso `settings`; se normaliza branding visible/documental restante de FibraZ hacia Z-Hub donde no era una clave técnica de compatibilidad.
- **Base de datos:** se elimina la doble ejecución accidental de `_add_missing_columns()` en el arranque MariaDB.
- **Calidad:** se agrega `backend/tests/test_maintenance_contracts.py` y `.github/workflows/quality.yml`. Los reportes viejos se marcan como históricos y dejan de considerarse certificación de la versión actual.
- **CI:** el primer intento del frontend falló antes del build porque el workflow intentaba cachear un `frontend/yarn.lock` que no existe. Se corrigió el workflow para instalar dependencias sin ese caché. La ejecución `34487091693`, sobre el commit `35f575d702fa64eaeb228c826938d68e84d37c7c`, terminó en `success`.
- **Pruebas confirmadas por CI:** compilación estática Python OK, contratos de mantenimiento pytest OK y build de producción React OK.
- **Pruebas pendientes:** actualización real del servidor, arranque contra MariaDB de producción y pruebas con MikroTik/OLT reales. No se afirma haber ejecutado esas pruebas.
- **Compatibilidad:** no se borra ni reinicializa la base de datos; no se agregan retiros automáticos ni movimientos automáticos de inventario.
- **Archivos principales:** `deploy/install.sh`, `deploy/env/backend.env.example`, `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/app/core/security.py`, `backend/app/core/utils.py`, `backend/app/routers/auth/router.py`, `backend/app/routers/ajustes/router.py`, `backend/app/routers/clientes/router.py`, `backend/app/routers/clientes/retired.py`, `backend/app/routers/clientes/pause.py`, `backend/app/routers/clientes/suspension_alerts.py`, `backend/app/routers/clientes/equipment_recoveries.py`, `backend/app/routers/facturacion/router.py`, `frontend/src/context/AuthContext.js`, `frontend/src/modules/ajustes/staff/permissions.js`, `frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx`, documentación y CI.
- **Resultado:** 1.2.37 queda como release de mantenimiento/saneamiento, con backup completo de 1.2.36 y controles automáticos de calidad antes de continuar nuevas funciones.
- **Siguiente versión funcional:** `1.2.38`.

## 1.2.36 — 2026-09-10 — Módulo operativo de Recuperación de equipos

- **Objetivo:** convertir `Recuperación de equipos` de un espacio preparado a un flujo operativo para controlar ONU, CPE u otros equipos que deben recuperarse de clientes suspendidos por largo tiempo o retirados.
- **Nuevo submódulo:** se agrega `Clientes → Recuperación`, visible con el mismo permiso `clients`, sin crear un permiso paralelo que rompa los roles existentes.
- **Candidatos:** la pantalla reúne clientes con suspensión prolongada según la política configurada y clientes retirados que todavía no tienen un caso abierto. El operador decide manualmente cuándo enviarlos a recuperación.
- **Persistencia:** nueva tabla `equipment_recoveries` mediante el modelo `EquipmentRecovery`; `init_db()` la crea al arrancar sin borrar ni modificar datos existentes.
- **Ficha del equipo:** para fibra se conserva la ONU/serial disponible; para inalámbrico se conserva CPE, antena e IP de administración cuando existan. Para retirados se reutiliza la ficha técnica histórica de 1.2.34 si fue conservada.
- **Estados:** `Pendiente`, `Contactado`, `Visita programada`, `Recuperado` y `No recuperado`.
- **Seguimiento:** cada caso puede guardar responsable, fecha de visita y observaciones. La visita programada exige una fecha válida.
- **Duplicados:** un cliente no puede tener dos recuperaciones abiertas simultáneamente; puede generarse un caso nuevo después de cerrar el anterior como recuperado o no recuperado.
- **Alerta de suspensión:** el aviso de Clientes incorpora botón `Recuperación` para abrir directamente el nuevo submódulo.
- **API:** se agregan `GET /api/equipment-recoveries`, `GET /api/equipment-recoveries/summary`, `POST /api/equipment-recoveries/from-client/{client_id}` y `PATCH /api/equipment-recoveries/{recovery_id}` bajo permiso de Clientes.
- **Seguridad de inventario:** marcar `Recuperado` **no aumenta ni modifica automáticamente Almacén**. Todavía no existe una relación inequívoca entre una ONU/CPE recuperada y un registro concreto de `inventory`; se evita alterar stock por aproximación.
- **Compatibilidad:** no se modifica el estado del cliente, MikroTik, facturación, NAP/OLT, pausa, retiro ni recursos técnicos al crear o actualizar un caso de recuperación. El módulo es seguimiento físico/operativo.
- **Archivos nuevos:** `backend/app/models/equipment_recovery.py`, `backend/app/routers/clientes/equipment_recoveries.py`, `frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx`, `frontend/src/modules/clientes/recuperacion/equipment-recovery.css`.
- **Archivos modificados:** `backend/app/models/__init__.py`, `backend/server.py`, `frontend/src/components/layout/Sidebar.jsx`, `frontend/src/components/layout/Layout.jsx`, `frontend/src/modules/ajustes/staff/permissions.js`, `frontend/src/modules/clientes/usuarios/Users.jsx`, `frontend/src/modules/clientes/usuarios/SuspensionRecoveryAlerts.jsx`, `frontend/src/modules/system-update/version.js`.
- **Backup:** `docs/backups/1.2.35/EQUIPMENT_RECOVERY_BACKUP.md` registra los blobs previos y los archivos nuevos a eliminar para rollback.
- **Pruebas realizadas:** revisión estática del modelo, creación automática de tabla, rutas, validación de estados/fecha, prevención de duplicados, lectura de ficha técnica de retirados, navegación lateral, permiso `clients`, carga tolerante de candidatos y enlace desde la alerta de suspensión.
- **Pruebas pendientes:** compilación/importación Python, build React, arranque real del backend para crear `equipment_recoveries`, prueba visual en tema oscuro/claro y flujo real crear → contactar → programar visita → recuperar/no recuperar.
- **Riesgos:** la primera versión no lleva control unitario de varios equipos separados dentro de un mismo cliente ni movimiento automático de inventario; las observaciones permiten documentar el resultado hasta definir una asociación segura con Almacén.
- **Commits principales:** backup `5788174e32a81056d26c5fad674ecb5c0bff1662`; modelo `6307f4e08dc6b8dd8beaf585b04f1f97216af9ce`; API `e900684b5f79866d7cbce1d9f863aa8b8c833cd4`; registro modelo `44a0213fa7c35a4399e932558507dbb6395ae5e9`; servidor `0e246d30dcecb87ec1c7cd315d95d0529420a166`; UI `09cec59a95b09effcf250664681a3ce33560581c`; CSS `ffcfa572b33a7a00409a0f59b618138709c4b856`; menú `d7a5121c1d01486ec22a8fa68ff590e6dd6a7a4d`; permisos `0c104bc1b8b4b97dd7870ded9598c6acbbd74af1`; alerta `03d9c5a48cb5ff075b98db957ff182d29245e695`; integración `7e8accdb03b08d8b1cf18d80d952badb58113762`, `17176bb7a82dc6dac7f0daf52e61afe67ae31ef1`; versión `fc481c7bc8fe5005bb49c9bbc12f1df62a3680d5`.

## 1.2.35 — 2026-09-10 — Corrección del listado vacío de Clientes

- **Causa confirmada:** desde 1.2.33 el frontend de `Clientes` consulta `GET /api/clients/pause-policy`; en 1.2.34 también consulta `GET /api/clients/retirement-policy`. En `backend/server.py`, el router CRUD principal de Clientes estaba registrado antes que los routers especializados. Como dicho CRUD contiene `GET /clients/{client_id}`, FastAPI podía interpretar `pause-policy` o `retirement-policy` como si fueran IDs de cliente y devolver 404.
- **Efecto visual:** `Clients.jsx` usaba `Promise.all`; el fallo de una sola política auxiliar descartaba también la respuesta correcta de `GET /api/clients`, por lo que la pantalla mostraba `Clientes (0)` aunque el abonado siguiera guardado y su configuración permaneciera en MikroTik.
- **Datos:** el problema era de resolución/carga de API; esta corrección no elimina, recrea ni modifica clientes existentes, facturas, IP, ONU, NAP ni configuración MikroTik.
- **Backend:** se reordenan las rutas de Clientes en `backend/server.py` para registrar primero `retired`, `pause`, alertas, instalaciones, servicios y demás rutas estáticas/especializadas, dejando `clientes_router` después. Así `/clients/pause-policy` y `/clients/retirement-policy` ya no pueden ser capturadas por `/clients/{client_id}`.
- **Frontend resistente:** `Clients.jsx` cambia la carga a `Promise.allSettled`. La lista principal `/clients` es la fuente obligatoria; si una API auxiliar de políticas, retirados, pausas, planes o red falla, ya no se borra visualmente la lista principal de clientes y se conservan los valores previamente cargados o por defecto para el dato auxiliar.
- **Compatibilidad:** se mantienen sin cambios funcionales las políticas de Registro y altas, Pausas de servicio, Suspensiones, retiros y reactivaciones y la futura Recuperación de equipos.
- **Backup:** `docs/backups/1.2.34/CLIENT_ROUTE_ORDER_BACKUP.md` conserva los blobs previos de `backend/server.py`, `frontend/src/modules/clientes/Clients.jsx`, `version.js` y bitácora.
- **Pruebas realizadas:** revisión estática del orden efectivo de `include_router`, confirmación de la existencia de `GET /clients/{client_id}`, `GET /clients/pause-policy` y `GET /clients/retirement-policy`, y revisión de la lógica de carga parcial del frontend.
- **Pruebas pendientes:** actualización real del servidor, reinicio del backend, comprobación visual de que reaparece el cliente existente y prueba de las políticas de pausa/retiro desde el navegador.
- **Resultado esperado:** después de actualizar/reiniciar, el cliente existente vuelve a mostrarse. Si una política auxiliar falla en el futuro, la tabla principal no quedará vacía por ese fallo secundario.
- **Commits principales:** backup inicial `cc48aa17ca69d2ac464cdb1689af6f9b79467fde`; backup ampliado `703c3e307ee9b01c885b92d19e301c9cc5f52f73`; orden de rutas `2f908a836b69ec695624950656633be7cc225d36`; carga resistente Clientes `cd629853c53e912af8e2277c73cbd15f6bc40a28`; versión `73eb349d3a866c447987ed0b6cbe23336966da54`.

## 1.2.34 — 2026-09-10 — Políticas de Suspensiones, retiros y reactivaciones

- **Objetivo:** convertir `Ajustes → Configuración clientes → Suspensiones, retiros y reactivaciones` en una sección funcional más completa, manteniendo la alerta por suspensión prolongada y añadiendo reglas de retiro/retorno.
- **Configuración:** junto a la alerta de 1–6 meses se agregan tres políticas: motivo obligatorio al retirar, conservar ficha técnica previa al retiro y permitir/bloquear reactivación de clientes retirados.
- **Motivo de retiro:** si la política está activa, se mantiene el requisito de 10–250 caracteres. Si se desactiva, el motivo puede quedar vacío; si se escribe uno, debe tener al menos 3 caracteres.
- **Historial técnico:** cuando está activo, antes de liberar recursos se guarda una copia del servicio anterior con tecnología, plan, router, IP, tipo de conexión, usuario PPPoE, ONU, NAP/puerto, zona, CPE/base, antena, IP de administración y fecha de instalación.
- **Base de datos:** se agrega `retirement_technical_snapshot` al modelo `Client` como texto JSON. La migración ligera de `init_db` debe crear la columna sin borrar clientes ni datos existentes.
- **Retirados:** la API devuelve `retirement_snapshot` ya convertido a objeto; la pestaña Retirados muestra una columna `Ficha técnica anterior` cuando existe información conservada.
- **Reactivación:** la política `Permitir reactivar clientes retirados` controla el botón `Reactivar / volver a registrar`; el endpoint de finalización también rechaza la reactivación cuando la política está desactivada.
- **Seguridad operacional:** el retiro sigue siendo manual. La alerta de suspensión prolongada nunca retira automáticamente ni libera recursos por sí sola.
- **MikroTik:** la secuencia de retiro existente se conserva: primero se intenta liberar el cliente en MikroTik y solo si la operación confirma éxito se completa la baja en base de datos.
- **Compatibilidad:** no se modifican pausas, facturación, altas, NAP/OLT, suspensión automática ni clientes activos. Los clientes retirados antes de 1.2.34 no tendrán ficha técnica histórica retroactiva si esos datos ya fueron eliminados.
- **Archivos modificados:** `backend/app/models/setting.py`, `backend/app/models/client.py`, `backend/app/routers/clientes/retired.py`, `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/clientes/Clients.jsx`, `frontend/src/modules/system-update/version.js`.
- **Backup:** `docs/backups/1.2.33/SUSPENSION_RETIREMENT_SETTINGS_BACKUP.md` conserva los blobs exactos previos de 1.2.33.
- **Pruebas realizadas:** revisión estática de valores por defecto, lectura/guardado de políticas, validación condicional de motivo, captura de ficha técnica antes del vaciado de recursos, decoración de Retirados y visibilidad del botón de reactivación.
- **Pruebas pendientes:** build React, compilación/importación Python, arranque real para verificar migración de `retirement_technical_snapshot`, retiro real contra MikroTik y prueba visual/funcional en servidor.
- **Riesgos:** la ficha técnica conserva solo el último retiro registrado en la fila del cliente; no sustituye todavía un historial estructurado de múltiples ciclos. La recuperación física de equipos se implementará aparte en `Recuperación de equipos`.
- **Commits principales:** backup `977047f4a2c35d410b6c2b3f39a1669f7395586b`; settings `20996fc6dfdc58ed91840e584d03d7f53e68f62b`; modelo cliente `361ec7455d7be831602cd9fa69d699dfcf91e909`; backend retiro `de51dacf3b029abe8b4c2db35989094daef658a4`; UI Ajustes `2c9bd3fe39ea6c44f797bf072f35621c8dfc79ba`; UI Clientes `5fce86d925715e4c8aab63622d9a35b67523a6a5`; versión `9ab3429c4b48a2e0529d566f4d75dc53de8b1bdf`.

## 1.2.33 — 2026-09-10 — Preferencias funcionales de Pausas de servicio

- **Objetivo:** convertir `Ajustes → Configuración clientes → Pausas de servicio` en una sección funcional sin romper el flujo de pausa validado en 1.2.27.
- **Configuración:** se agregan seis preferencias: duración máxima **1–3 meses**, aviso previo **3/5/7 días**, permitir reactivación anticipada, permitir cambio manual del día de facturación, mostrar botón de aviso por WhatsApp y reactivación automática al vencer.
- **Persistencia:** todas las preferencias se guardan en el JSON de `settings`; no se crean nuevas tablas ni columnas.
- **Backend:** `pause.py` lee la política en cada operación. El límite de meses y las restricciones de reactivación/cambio de facturación también se validan en servidor, no solo en la interfaz.
- **API Clientes:** `GET /api/clients/pause-policy` expone únicamente las preferencias necesarias para el módulo Clientes y queda cubierto por el permiso `clients` ya aplicado al router de pausas.
- **Aviso configurable:** `pause_alert_due` deja de estar fijo en 5 días y usa la política seleccionada. Se distingue además `pause_due` cuando la fecha ya venció.
- **Reactivación automática/manual:** si `client_pause_auto_resume` está activa, el worker conserva el comportamiento anterior y reintenta cada hora. Si está desactivada, la pausa vencida permanece pendiente de reactivación manual.
- **Reactivación anticipada:** si está desactivada, no aparece el botón antes del vencimiento y el backend rechaza intentos anticipados. Al vencer sí puede reactivarse manualmente.
- **Día de facturación:** si el cambio manual está desactivado, el selector desaparece y el backend rechaza un `billing_day` enviado manualmente; se mantiene el cálculo automático que devuelve los días guardados.
- **WhatsApp:** el botón se muestra únicamente durante el período de aviso previo y solo si la política está activa. El texto se adapta según la reactivación sea automática o manual.
- **Duración:** el modal de pausa ofrece solo 1..N meses según el máximo configurado; el backend vuelve a verificar el límite antes de cortar el servicio.
- **Compatibilidad:** se preservan días guardados, congelamiento de facturación, recursos técnicos, MikroTik cut/restore, retiros y suspensión prolongada.
- **Archivos modificados:** `backend/app/models/setting.py`, `backend/app/routers/clientes/pause.py`, `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/clientes/Clients.jsx`, `frontend/src/modules/system-update/version.js`.
- **Backup:** `docs/backups/1.2.32/PAUSE_SETTINGS_BACKUP.md` conserva los blobs exactos de 1.2.32 previos al cambio.
- **Pruebas realizadas:** revisión estática de límites 1–3, avisos 3/5/7, bloqueo de reactivación anticipada, bloqueo de cambio manual de facturación, worker condicionado por `auto_resume`, exposición de `pause-policy` y render de controles en Clientes.
- **Pruebas pendientes:** build React, compilación/importación Python, arranque real del backend, prueba visual y prueba operativa de cada combinación de política en servidor.
- **Riesgos:** al desactivar reactivación automática, una pausa vencida seguirá sin servicio hasta que un operador la reactive manualmente; esto es intencional y se señala en la pestaña En pausa.
- **Commits principales:** backup `2562fb6b7ce69efa617c05e72cdc5b91d3de866e`; settings `9562940eac8c8ff907802622d38143eafe8d2c3f`; backend pausas `584a004c5d01991ed0301def0bf713724e5646ca`; UI Ajustes `693992bf27a19226ec0b535bca784ac6ff914735`; UI Clientes `601ea54f525ac8a05817ceb4206d17a227b1dd00`; versión `9f6bf306a94bb5695f9d4cfe6bf376a871116e10`.

## 1.2.32 — 2026-09-10 — Preferencias funcionales de Registro y altas

- **Objetivo:** convertir `Ajustes → Configuración clientes → Registro y altas` en una sección funcional para definir valores predeterminados y una validación del alta de nuevos abonados.
- **Configuración:** se agregan cuatro preferencias: día de facturación sugerido **1–30**, tecnología predeterminada **Fibra/Inalámbrico**, fecha de instalación **obligatoria/opcional** y estado inicial de `Crear primera factura` **activado/desactivado**.
- **Persistencia:** las preferencias se guardan en la fila JSON de `settings`; `DEFAULT_SETTINGS` incorpora valores seguros para instalaciones existentes: día 5, Fibra, fecha obligatoria y primera factura activada.
- **API para altas:** se crea `GET /api/client-registration-settings`, incluido bajo permiso `clients`, para que técnicos con acceso a Clientes puedan leer únicamente estas cuatro preferencias sin necesitar permiso de Ajustes.
- **Aplicación en alta:** el asistente oficial consulta `/api/client-registration-settings` al abrirse y aplica las preferencias a nuevos abonados. No sobrescribe datos de un cliente que se está editando.
- **Instalaciones prellenadas:** si el alta llega con identidad/datos de una instalación previa, se conserva la tecnología ya registrada en ese borrador; sí se aplican el día de facturación y la preferencia de primera factura.
- **Fecha opcional:** cuando la política permite fecha opcional, el asistente muestra `Sin fecha` para poder dejar el campo vacío. Cuando es obligatoria, valida antes de continuar/finalizar.
- **Primera factura:** la preferencia es un valor inicial; el operador conserva el checkbox individual del asistente y puede modificarlo antes de registrar.
- **Tecnología:** la preferencia es un valor inicial y no elimina la posibilidad de cambiar Fibra/Inalámbrico durante el alta; el filtro de planes por tecnología de 1.2.26 continúa vigente.
- **Archivos nuevos:** `backend/app/routers/clientes/registration_settings.py`.
- **Archivos modificados:** `backend/app/models/setting.py`, `backend/server.py`, `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx`, `frontend/src/modules/system-update/version.js`.
- **Backend/Base de datos:** no se agregan columnas ni tablas; se amplía únicamente el JSON de settings y se registra una ruta de lectura segura. No se modifica aprovisionamiento MikroTik.
- **Compatibilidad:** no se cambian NAP, OLT, retiros, pausas, suspensión prolongada, facturación de clientes ya existentes ni datos reales.
- **Backup:** `docs/backups/1.2.31/REGISTRATION_SETTINGS_BACKUP.md` conserva blobs exactos previos de 1.2.31, incluido `backend/server.py`, y registra el archivo nuevo que debe eliminarse en rollback.
- **Pruebas realizadas:** revisión estática de lectura/guardado de las cuatro preferencias, límites del día 1–30, preservación de tecnología en borradores prellenados, validación condicional de fecha de instalación y registro de la nueva ruta bajo permiso `clients`.
- **Pruebas pendientes:** build React, compilación/importación Python, arranque real del frontend/backend y prueba visual/funcional completa en servidor después de instalar 1.2.32.
- **Resultado esperado:** el administrador puede fijar las cuatro políticas desde Configuración clientes y las nuevas altas reciben esos valores; un técnico con permiso de Clientes puede leer las preferencias necesarias sin abrir Ajustes.
- **Commits principales:** backup inicial `85a2b63f62742775de058ca2cc40034e9ab7f70b`; backup completado `2dd4fb8a96296ed3cd758bd2e05978f546289ba8`; settings `02d562258bfee0fa93a7261be39ddb2446e73078`; UI Ajustes `5e4247ce8e35a20101c7ebc446482d58b770f4b9`; asistente inicial `993cb65da5d013dea4a6337c382b14955eb4c775`; API clientes `6e324a8b6480d64bea7db407269c8e5b6762c33d`; servidor `41e74a1137c6bd7bd2e0fe215225fad2f8da589d`; asistente final `e5fe7d3e690880967e794820ebe36aafdac1b745`; versión `b2d38f3934411ab065f19cd809b081f891f88212`.

## 1.2.31 — 2026-09-09 — Tarjetas funcionales en Configuración clientes

- **Objetivo:** corregir que las cuatro tarjetas superiores de `Ajustes → Configuración clientes` parecían botones pero no respondían al clic.
- **Solución:** `Registro y altas`, `Pausas de servicio`, `Suspensiones, retiros y reactivaciones` y `Recuperación de equipos` ahora son botones reales con selección visual, flecha de estado y contenido contextual.
- **Suspensiones:** se conserva como sección inicial y al seleccionarla muestra la política funcional de alerta por suspensión prolongada de 1 a 6 meses.
- **Otras secciones:** Registro y altas, Pausas y Recuperación ya responden al clic y muestran su área correspondiente preparada para incorporar sus opciones sin duplicar Facturación.
- **Tema claro:** se agregan estilos hover, activo y foco accesible locales; la tarjeta seleccionada queda resaltada sin afectar otros módulos.
- **Archivos modificados:** `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/ajustes/clientes/client-settings-theme.css`, `frontend/src/modules/system-update/version.js`.
- **Backend/Base de datos:** sin cambios.
- **Compatibilidad:** no se modifica facturación, MikroTik, pausa temporal, suspensión prolongada, retiro ni datos reales.
- **Backup:** `docs/backups/1.2.30/CLIENT_SETTINGS_BUTTONS_BACKUP.md` conserva blobs exactos previos de 1.2.30.
- **Pruebas realizadas:** revisión estática de estado `activeGroup`, eventos `onClick`, `aria-pressed`, render condicional de la política y clases locales para tema claro/oscuro.
- **Pruebas pendientes:** build React y validación visual/clic real en el servidor después de instalar 1.2.31.
- **Resultado esperado:** las cuatro tarjetas dejan de verse desactivadas y funcionan como selector de secciones.
- **Commits principales:** backup `ccfcf3786315115199dc53649088f88e75540503`; UI `2cf15154efbd8932b8f00a93eb19532882222375`; CSS `8efc7f8be16d38be5eefd9d6e71993fd89b126b1`; versión `56e3f5f8c7ab43549769324d535bfcba9fecee2b`.

## 1.2.30 — 2026-09-09 — Configuración clientes compacta y Recuperación de equipos

- **Objetivo:** ordenar mejor `Ajustes → Configuración clientes`, eliminar la categoría redundante `Avisos del cliente` y corregir el contraste de esta pantalla en el tema claro.
- **Organización:** las cuatro áreas quedan como `Registro y altas`, `Pausas de servicio`, `Suspensiones, retiros y reactivaciones` y `Recuperación de equipos`.
- **Recuperación de equipos:** reemplaza a `Avisos del cliente` para reservar un espacio específico al seguimiento futuro de ONU, router, CPE u otros equipos pendientes de recuperar, sin duplicar las notificaciones que ya existen en Facturación del abonado.
- **Suspensión prolongada:** la política 1–6 meses existente se conserva intacta y conceptualmente queda asociada al grupo `Suspensiones, retiros y reactivaciones`.
- **Diseño:** se reduce altura, padding, iconos, separaciones y tipografía secundaria de las tarjetas para ocupar menos espacio, manteniendo margen para agregar opciones futuras.
- **Tema claro:** se crea `client-settings-theme.css` con estilos locales para fondos blancos, bordes azul-gris, texto legible, iconos, selector, botón y nota informativa. No se modifica la capa global del tema.
- **Archivos modificados:** `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/system-update/version.js`.
- **Archivo nuevo:** `frontend/src/modules/ajustes/clientes/client-settings-theme.css`.
- **Backend/Base de datos:** sin cambios.
- **Compatibilidad:** no se modifica Facturación, MikroTik, pausas, retiros, alertas de suspensión prolongada ni datos reales de clientes.
- **Backup:** `docs/backups/1.2.29/CLIENT_SETTINGS_LAYOUT_BACKUP.md` conserva blobs exactos de 1.2.29 y registra el CSS nuevo para rollback.
- **Pruebas realizadas:** revisión estática de imports, clases CSS locales, selector de 1–6 meses y preservación del guardado de política existente.
- **Pruebas pendientes:** build React y validación visual en servidor con tema oscuro y `zhub-light` después de instalar 1.2.30.
- **Resultado esperado:** Configuración clientes ocupa menos altura y mantiene coherencia visual con el tema claro sin afectar otros módulos.
- **Commits principales:** backup `ecec41a36907a9828bd2b6564c9d81399ca4f9ce`; UI `8325ead219f69410e583809144dd99fe14711f42`; CSS `498c5811be73f6d8066f023b29cae99370cdbfa4`; versión `2bfc94c2bd657e605730117e5db0f9a47ce381f4`.

## 1.2.29 — 2026-09-09 — Alerta por suspensión prolongada y recuperación de equipos

- **Objetivo:** detectar clientes que permanecen suspendidos durante demasiado tiempo para facilitar la decisión operativa de recuperar ONU, router u otros equipos instalados.
- **Configuración:** `Ajustes → Configuración clientes` incorpora `Alerta por suspensión prolongada`, con interruptor activar/desactivar y selección de umbral de **1 a 6 meses**.
- **Valor inicial:** la política queda habilitada con **3 meses** como umbral predeterminado; el administrador puede cambiarlo en cualquier momento.
- **Seguimiento:** se agrega `suspended_at` al modelo `Client`. La migración ligera de `init_db` debe incorporar la columna sin borrar clientes existentes.
- **Compatibilidad con clientes antiguos:** si un cliente ya estaba suspendido y no posee `suspended_at`, Z-Hub intenta usar `last_connection_time` como referencia histórica; si no existe una fecha utilizable, inicia el seguimiento desde el momento en que el sistema lo detecta.
- **Worker:** `suspension_alert_worker` revisa cada hora los clientes y mantiene la fecha de suspensión; también limpia esa marca cuando el cliente deja de estar suspendido.
- **API:** nuevo `GET /api/client-alerts/suspensions`, protegido por permisos de Clientes. Devuelve política, total suspendido y lista de clientes que ya superaron el umbral.
- **UI Clientes:** sobre `Control de Clientes` aparece una alerta persistente solo cuando existen casos vencidos. Muestra nombre, DNI/RUC, teléfono, dirección, router, ONU si existe, fecha de suspensión y tiempo acumulado.
- **Cálculo:** los meses se calculan por calendario; la alerta se activa al alcanzar la misma fecha del mes correspondiente y continúa mostrando meses más días adicionales.
- **Pausa temporal:** `status=paused` queda expresamente excluido. Una pausa voluntaria no se considera cliente perdido.
- **Acción automática:** ninguna. La alerta **no retira**, **no elimina**, **no libera IP/ONU/NAP**, **no modifica MikroTik** y **no cambia facturación**. La recuperación de equipos sigue siendo una decisión humana.
- **Archivos nuevos:** `backend/app/routers/clientes/suspension_alerts.py`, `frontend/src/modules/clientes/usuarios/SuspensionRecoveryAlerts.jsx`.
- **Archivos modificados:** `backend/app/models/client.py`, `backend/app/models/setting.py`, `backend/server.py`, `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, `frontend/src/modules/clientes/usuarios/Users.jsx`, `frontend/src/modules/system-update/version.js`.
- **Backup:** `docs/backups/1.2.28/LONG_SUSPENSION_ALERT_BACKUP.md` conserva los blobs exactos de 1.2.28 afectados y registra los archivos nuevos que deben eliminarse en un rollback completo.
- **Pruebas realizadas:** revisión estática de rutas, configuración 1–6 meses, exclusión de `paused`, cálculo calendario, render condicional de la alerta y registro del worker en el `lifespan`.
- **Pruebas pendientes:** compilación Python, build React, arranque real para verificar migración de `suspended_at`, prueba con cliente suspendido real y validación visual después de instalar 1.2.29.
- **Riesgo conocido:** para clientes suspendidos antes de 1.2.29 sin fecha histórica exacta, la fecha puede ser inferida desde `last_connection_time`; si tampoco existe, el conteo exacto comienza al ser detectado por esta versión.
- **Commits principales:** backup `38ee11f95d24be9defb60e00a5a240d6d7734e89`; API `c9923a4cc9ea3d3a4c82a391c237636fd0dffbc7`; modelo cliente `ef05ab122e54db91e3a431e9719b8350e7a8ef2e`; settings `296eb52e6bd4a03ca671e69e98fe4c9fd1f4d22c`; servidor `82a1ed44fb9883b8071b8f6a37585b104eb73192`; configuración UI `9ea2ffa5a563468192475e9ec8544a8b02d97f8d`; alerta UI `ba9364bc545f3525374e29a77d965c019e510c89`; integración Usuarios `9371a77e36cfe2b2f4328705ee6c8dc77b66f393`; versión `1388116585ed1db621bf16605bf9d40024b8d0b7`.

## 1.2.27 — 2026-09-09 — Servicio en pausa temporal

- **Objetivo:** permitir congelar temporalmente el servicio de un cliente por viaje, construcción u otra ausencia sin retirarlo ni liberar sus recursos técnicos.
- **UI Clientes:** se agrega el botón `Pausar servicio` para clientes activos y una pestaña `En pausa` con contador, fecha de inicio, fecha programada de reactivación, días guardados, motivo y acciones.
- **Duración:** se puede seleccionar 1, 2 o 3 meses. El final se calcula por mes calendario conservando el día cuando exista y usando el último día válido en meses más cortos.
- **Motivo:** obligatorio, entre 10 y 250 caracteres.
- **Días conservados:** al iniciar la pausa Z-Hub calcula los días que faltan hasta la próxima fecha de facturación del cliente y guarda ese saldo de tiempo en `pause_saved_days`.
- **MikroTik:** la pausa usa el mecanismo de corte existente (`mt.cut_client`) sin eliminar PPPoE, Queue, IP, plan, router, NAP, ONU ni demás asociaciones. Si MikroTik no logra suspender el servicio, la pausa no se registra.
- **Facturación congelada:** mientras `status=paused`, la generación mensual automática omite al cliente y el proceso de marcar facturas vencidas no avanza sus vencimientos. Las deudas existentes no se eliminan.
- **Reactivación automática:** `pause_worker` revisa una vez por hora las pausas vencidas. Primero intenta `mt.restore_client`; solo si MikroTik confirma la restauración cambia el cliente a activo. Si falla, la pausa queda pendiente y se reintenta posteriormente.
- **Devolución de días:** al reactivar, Z-Hub suma los días guardados desde la fecha real de reactivación y ajusta el día de facturación resultante.
- **Reactivación anticipada:** la pestaña `En pausa` incorpora `Reactivar ahora`. El usuario puede dejar la fecha de facturación en modo automático o escoger opcionalmente un día de facturación del 1 al 30.
- **Aviso 5 días antes:** cuando faltan 5 días o menos aparece `Pausa por finalizar` y un botón `Avisar WhatsApp`, que prepara un mensaje con nombre, fecha de reactivación y días conservados. No se agregó envío automático por una API externa de WhatsApp.
- **Fechas de facturación:** `_billing_dates` deja de forzar todos los días 29/30 al 28 y ahora respeta días 1–30, ajustándose al último día válido del mes cuando corresponda.
- **Base de datos:** `init_db` agregará mediante su migración ligera las columnas `pause_active`, `pause_started_at`, `pause_until`, `pause_months`, `pause_reason`, `pause_saved_days`, `pause_original_billing_day`, `pause_resumed_at` y `pause_billing_day_after` sin borrar datos existentes.
- **Archivos:** `backend/app/models/client.py`, `backend/app/routers/clientes/pause.py` (nuevo), `backend/app/routers/facturacion/router.py`, `backend/server.py`, `frontend/src/modules/clientes/Clients.jsx`, `frontend/src/modules/system-update/version.js`.
- **Compatibilidad:** no se modifican aprovisionamiento inicial, planes, NAP, ONU, Instalaciones, Retirados ni el asistente oficial de Nuevo abonado.
- **Backup:** `docs/backups/1.2.26/SERVICE_PAUSE_BACKUP.md` contiene los blobs exactos previos de 1.2.26.
- **Pruebas realizadas:** revisión estática de estado `paused`, validaciones 1–3 meses y motivo 10–250, corte/restauración MikroTik, cálculo calendario, congelamiento de facturación, reactivación manual/automática y render de la pestaña/alerta/WhatsApp.
- **Pruebas pendientes:** build React, compilación Python, arranque real con migración MariaDB, prueba de corte/restauración contra MikroTik, prueba de una pausa vencida y validación visual después de instalar 1.2.27.
- **Riesgo operativo:** la reactivación automática depende de que el backend permanezca en ejecución y el MikroTik esté accesible; ante fallo no se marca al cliente activo falsamente y se reintenta.
- **Commits principales:** backup `2ec3443f65c2f7fc3cdceda36ab1bd0c2787f9e4`; backend pausa `e12fabfb0526b75e46b3f668a41b58040d675b47`; modelo `8bdae240d9a8c75823b9d6acb2bcb85dfe17c572`; servidor `48f9a0e14b5f14c88922d98bc510b46434bd85e8`; facturación `0a7dcc33bc636fda0266ee3f6d20ff7dcd228e02`; UI `e98cf10a1e1ecda5e8ea1f2b8521f1b866780a5e`; versión `25e69ac8dc0457463ad4dfede33bf310929f04e0`.

## 1.2.26 — 2026-09-09 — Planes filtrados por tecnología en el alta

- **Objetivo:** evitar que durante el registro de un abonado se pueda escoger un plan que pertenezca a otra tecnología.
- **Comportamiento:** cuando la tecnología seleccionada es `Fibra óptica`, el selector `Plan de internet` muestra únicamente planes activos clasificados como fibra; cuando se selecciona `Inalámbrico`, muestra únicamente planes activos de radio/inalámbricos.
- **Clasificación:** tipos con `radio`, `inalam/inalám`, `Ubiquiti` o `Mimosa` se consideran inalámbricos; `Hotspot` queda fuera de ambos selectores; los demás tipos corresponden a fibra.
- **Cambio de tecnología:** al cambiar de Fibra a Inalámbrico o viceversa se limpia `plan_id`, obligando a escoger un plan válido para la nueva tecnología.
- **Validación:** antes de guardar, el asistente verifica que el `plan_id` seleccionado exista dentro de los planes activos compatibles con la tecnología actual.
- **Archivo funcional:** `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` → `1.2.26`.
- **Backend/Base de datos:** sin cambios.
- **Compatibilidad:** se conservan MikroTik, PPPoE, redes IPv4, NAP, ONU, facturación, Instalaciones, reactivación y aprovisionamiento actuales.
- **Backup:** `docs/backups/1.2.25/PLAN_TECH_FILTER_BACKUP.md`.
- **Pruebas realizadas:** revisión estática del filtro, cambio de tecnología, limpieza de `plan_id` y validación previa al submit.
- **Pruebas pendientes:** build React y prueba visual/funcional real en servidor.

## 1.2.25 — 2026-09-09 — Baja controlada y Clientes retirados
- `Retirar cliente` conserva identidad, contacto, fecha y motivo; libera recursos técnicos después de limpiar MikroTik.
- Pestaña `Retirados`, detección por DNI/RUC y `Reactivar / volver a registrar`.
- Motivo obligatorio 10–250 caracteres. Backup en `docs/backups/1.2.24/`.

## 1.2.24 — 2026-09-09 — Pestañas adaptadas al tema Claro Suave
- Instalaciones/Registrados reciben estilos locales para evitar que el tema global oscurezca la pestaña inactiva.
- Activa azul/cian; inactiva azul-gris clara; sin cambios de backend ni flujo.

## 1.2.23 — 2026-09-09 — Pestañas Instalaciones y Registrados
- Dos pestañas con contadores. Instalaciones muestra pendientes; Registrados muestra clientes dados de alta.
- El alta oficial continúa mediante `zhub_installation_draft` y el asistente existente.

## 1.2.22 — 2026-09-09 — Nueva instalación junto a filtros
- `Nueva instalación` se mueve a la fila de búsqueda/fechas y se refuerza la legibilidad de registros.

## 1.2.21 — 2026-09-09 — Progreso continuo del actualizador
- Porcentaje visual avanza 1 a 1 hasta 99%; 100% solo con éxito confirmado y versión objetivo instalada.

## 1.2.20 — 2026-09-09 — Control de Clientes
- Encabezado `Control de Clientes`; se retiran `Nuevo Abonado` y lápiz de la vista principal; tema claro más vivo.

## 1.2.19 — 2026-09-09 — Ubicación mediante minimapa
- Nueva instalación reutiliza `CoordinatesPicker`; clic/arrastre llena coordenadas sin depender de GPS del navegador.

## 1.2.18 — 2026-09-09 — Cierre resistente del instalador
- Comprobación final del backend con reintentos y diagnóstico Supervisor/log.

## 1.2.17 — 2026-09-09 — Instalaciones persistentes
- Tabla/API `installations`, solicitudes pendientes y `Dar de alta cliente`; cancelar alta no pierde la solicitud.

## 1.2.16 — 2026-09-09 — Modal sin cubrir pantalla
- Nueva instalación centrada sin overlay opaco.

## 1.2.15 — 2026-09-09 — Preinscripción desde Instalaciones
- Captura inicial y transferencia al asistente; posteriormente sustituida por persistencia real 1.2.17.

## 1.2.14 — 2026-09-09 — Botón Nueva instalación adaptado al tema
- Botón azul/cian sin cambios de datos.

## 1.2.13 — 2026-09-09 — Recarga segura tras actualizar
- No cierra sesión; recarga solo con éxito y versión coincidente.

## 1.2.12 — 2026-09-09 — Tema claro Instalaciones
- Panel, tabla y controles claros con mayor contraste.

## 1.2.11 — 2026-09-09 — Submódulo Instalaciones
- Se agrega `Clientes → Instalaciones` con listado, búsqueda y filtros.

## 1.2.10 — 2026-09-09 — Identificación centrada en footer
- `Panel Z-Hub · vX` centrado y legible.

## 1.2.09 — 2026-09-09 — Pie y fondo tema claro
- Contenedor y footer con estilo claro.

## 1.2.08 — 2026-09-09 — Planes agrupados
- Fibra, Radioenlace y Hotspot separados; velocidades más visibles.

## 1.2.07 — 2026-09-09 — Tarjetas de planes compactas
- Tarjetas reducidas y colores por tecnología.

## 1.2.06 — 2026-09-09 — Tarjetas por tecnología
- Cuadrícula responsive y color automático.

## 1.2.05 — 2026-09-09 — Zonas a Gestión de Red
- Zonas se mueve preservando permiso `client_zones`.

## 1.2.04 — 2026-09-09 — Buscador PPPoE
- Filtro por usuario, perfil, IP remota o comentario.

## 1.2.03 — 2026-09-09 — Buscador Colas simples
- Filtro por nombre, comentario o IP/target.

## 1.2.02 — 2026-09-09 — Queue type visible
- Nueva columna Queue type con valor RouterOS.

## 1.2.01 — 2026-09-09 — Comentario primero
- Comentario pasa a primera posición en Colas simples.

## 1.2.00 — 2026-09-09 — Límites de velocidad legibles
- Max-limit en Mbps/Gbps; `0/0` se muestra como `Sin límite`.

---

## Plantilla obligatoria próxima versión
Insertar inmediatamente debajo de `HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO`: versión, fecha, objetivo/causa, solución, archivos, compatibilidad, backups, pruebas realizadas, pruebas pendientes, resultado, riesgos y commits.

## Estado documental
- Serie cubierta: **1.2.00 → 1.2.38**.
- Orden: **descendente; versión más reciente primero**.
- Próxima versión funcional: **1.2.39**, encima de 1.2.38.

---

# ANEXOS CONSOLIDADOS DE BITÁCORAS v1.2.x

Esta sección conserva íntegramente las bitácoras v1.2.x que antes estaban separadas. Desde esta consolidación, `docs/CONTINUIDAD_Z-HUB-v1.2.md` es el único archivo de continuidad específico de la rama v1.2.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.17-PENDIENTE.md`

TEMPORAL: entrada preparada para integrar al final de docs/CONTINUIDAD_Z-HUB.md una vez verificado el cierre de 1.2.17.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.65.md`

# Z-Hub — Continuidad 1.2.65

**Fecha:** 2026-09-10
**Versión:** 1.2.65
**Estado:** hotfix publicado en `main`, pendiente validación visual/operativa en servidor real.

## Punto exacto de continuidad
Se corrigió la causa por la que una licencia pagada/ilimitada podía seguir apareciendo como `LICENCIA NO VÁLIDA` después de 1.2.63 y 1.2.64.

El fallback anterior estaba ubicado en `licencia/licencias.txt`, pero `deploy/install.sh` elimina ese directorio durante la instalación. Por eso el motor podía quedarse únicamente con el registro privado y perder la fuente de compatibilidad.

Desde 1.2.65 el fallback runtime es:

`backend/app/core/license_fallback.txt`

`backend/app/core/license_manager.py` lo combina con `/etc/zhub/licencia/licencias.txt`; el registro privado mantiene prioridad para suspensiones/revocaciones explícitas.

## Backup
`backup/pre-license-runtime-fallback-1.2.65-20260910`

## Informe detallado
`docs/INFORME_HOTFIX_RUNTIME_LICENCIA_1.2.65.md`

## Próximo paso obligatorio
Actualizar un servidor de prueba/producción de 1.2.64 a 1.2.65 y comprobar:
1. `Ajustes → Licencia Z-Hub`.
2. La clave terminada en `002` debe aparecer como `LICENCIA ACTIVA` si no está suspendida/inactiva en el registro privado.
3. Reinicio/backend y build deben finalizar correctamente.
4. Solo después de cerrar esta validación continuar con Etapa 6/7 (License Server).


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.66.md`

# Continuidad Z-Hub 1.2.66

Estado: Etapa 6/7 implementada a nivel de código y preparada para despliegue real en VPS.

## Último punto estable
- Versión anterior validada visualmente: 1.2.65.
- Backup previo: `backup/pre-license-stage6-1.2.65-20260910`.

## Cambios 1.2.66
- Cliente remoto de License Server con HTTPS.
- Autorizaciones RS256 verificadas con clave pública.
- Caché firmada para continuidad temporal.
- `license_installation_id` persistente por instalación.
- License Server independiente bajo `license_server/` con SQLite, historial, licencias e instalaciones autorizadas.
- Plantillas de systemd/Nginx y generación de claves.
- Setup y cambio de licencia usan la fuente unificada de Etapa 6.

## Regla de transición
No retirar todavía `license_fallback.txt` ni el registro privado local. Solo deben dejar de ser mecanismo productivo después de desplegar y validar el VPS real.

## Próximo paso
Desplegar `license_server/` en el VPS, definir dominio/subdominio, habilitar HTTPS, generar claves, copiar `public.pem` a Z-Hub, configurar `ZHUB_LICENSE_SERVER_URL`, registrar la licencia e instalación actual y validar online + caída simulada dentro del período de gracia.

Documento detallado: `docs/INFORME_LICENCIAS_ETAPA6_1.2.66.md`.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.67.md`

# Continuidad Z-Hub 1.2.67

Estado: License Server Etapa 6/7 operativo a nivel de código y ampliado con una primera interfaz web de administración central.

## Base estable previa
- Z-Hub 1.2.66.
- Backup creado antes de modificar: `backup/pre-license-center-web-1.2.67-20260910`.
- El contenedor de laboratorio Debian 13 usa IP `192.168.10.240` y ya respondió `GET /health` con HTTP 200 antes de esta ampliación.

## Cambios 1.2.67
- Nuevo `/admin-ui` en el License Server.
- Dashboard: clientes/ISP, licencias activas, instalaciones activas y validaciones de 24 h.
- Gestión de clientes/ISP: empresa, contacto, correo, teléfono, RUC/DNI y estado.
- Gestión de licencias: crear/editar/eliminar, cliente asociado, tipo, plan, `max_clients`, activar/suspender.
- Gestión de instalaciones: autorizar/editar/eliminar, nombre descriptivo y estado.
- Historial de validaciones visible desde la web.
- Migración SQLite no destructiva: crea `customers` y agrega columnas faltantes a bases 1.0 existentes.
- License Server `APP_VERSION=1.1.0`.
- Z-Hub `PANEL_VERSION=1.2.67`.

## Seguridad
- El License Center usa `ZHUB_LICENSE_ADMIN_TOKEN` para `/admin/*`.
- El navegador conserva el token únicamente en `sessionStorage` durante la sesión.
- Para Internet se debe habilitar HTTPS antes de usar la interfaz administrativa remotamente.
- `private.pem` permanece exclusivamente en el servidor de licencias.
- Z-Hub local seguirá recibiendo únicamente `public.pem`.
- No se envían datos MikroTik/OLT ni la base operativa de abonados al License Server.

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/index.html`
- `license_server/static/styles.css`
- `license_server/static/app.js`
- `license_server/README.md`
- `backend/tests/test_license_center_web_contract.py`
- `.github/workflows/quality.yml`
- `frontend/src/modules/system-update/version.js`
- `docs/INFORME_LICENSE_CENTER_WEB_1.2.67.md`

## Prueba siguiente en laboratorio
En `web-licencia`:
1. detener el Uvicorn manual actual si sigue corriendo;
2. `cd /opt/zhub-license-src && git pull origin main`;
3. arrancar otra vez Uvicorn con `server.env` cargado;
4. comprobar `GET /health` y versión `1.1.0`;
5. abrir `http://192.168.10.240:8090/admin-ui` temporalmente para prueba LAN;
6. ingresar con el token administrativo rotado;
7. crear Cliente/ISP → Licencia → Instalación;
8. probar `/v1/licenses/validate` y comprobar autorización RS256;
9. suspender/reactivar desde la web y verificar el comportamiento.

## Pendiente antes de producción
- convertir Uvicorn a servicio systemd;
- colocar Nginx delante del backend;
- asignar dominio/subdominio;
- habilitar HTTPS válido;
- copiar solo `public.pem` a Z-Hub;
- configurar Z-Hub 1.2.67 con la URL HTTPS final;
- retirar el fallback local solo después de validar el flujo remoto completo.

## Próximo punto
No iniciar todavía funciones adicionales de Etapa 7 avanzada. Primero validar visual y funcionalmente este License Center inicial en el contenedor Debian 13 y cerrar la Etapa 6 con HTTPS + conexión real de Z-Hub.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.68.md`

# Continuidad Z-Hub 1.2.68

Fecha: 2026-09-10
Estado: mejora funcional del Z-Hub License Center publicada en `main` para prueba en laboratorio.

## Objetivo
Reducir errores al crear licencias desde la web y automatizar clave, datos del cliente, capacidad por plan y vencimiento TRIAL.

## Cambios
- El License Server pasa a `APP_VERSION = 1.2.0`.
- Nueva generación de clave desde servidor con `GET /admin/licenses/generate-key`.
- Formato de clave: `ZHUB-AAAA-XXXXXXXX`, usando aleatoriedad criptográfica y comprobación contra SQLite antes de devolverla.
- La clave queda de solo lectura en el formulario y puede regenerarse antes de guardar.
- Al seleccionar Cliente / ISP se completan Titular y Correo desde la ficha del cliente; siguen siendo editables.
- Planes comerciales normalizados: `PLAN_100`, `PLAN_300`, `PLAN_500`, `PLAN_1000`, `ILIMITADO`.
- La capacidad se deriva en backend del plan: 100, 300, 500, 1000 o `NULL` para ilimitado. La web refleja el mismo valor y bloquea edición manual de capacidad.
- Tipos de licencia: `PAID` y `TRIAL`.
- Una licencia TRIAL nueva recibe `expires_at` automáticamente a 30 días. El número de días es configurable mediante `ZHUB_LICENSE_TRIAL_DAYS`, con 30 por defecto.
- La validación remota rechaza TRIAL vencidas con `TRIAL_EXPIRED`.
- El JWT de una TRIAL no puede extender su `grace_until` más allá de `expires_at`.
- Estados comerciales visibles de licencia: `ACTIVA`, `SUSPENDIDA`, `REVOCADA`.
- El listado de licencias muestra tipo y vencimiento.
- Migración no destructiva: se agrega `licenses.expires_at` si no existe; no se borra ni reinicializa SQLite.

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/app.js`
- `license_server/env.example`
- `backend/tests/test_license_center_web_contract.py`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_Z-HUB-1.2.68.md`

## Backup previo
Rama: `backup/pre-license-center-automation-1.2.68-20260910`.

## Pruebas locales realizadas antes de publicar
- `python3 -m py_compile` sobre la versión preparada de `license_server/app/main.py`: OK.
- `node --check` sobre la versión preparada de `license_server/static/app.js`: OK.

## Pruebas automáticas
GitHub Actions debe validar compilación Python, contratos pytest y build React sobre el HEAD final de esta entrega. No declarar CI aprobada hasta comprobar conclusión `success`.

## Prueba de laboratorio pendiente
En `web-licencia`:
1. `git pull origin main`.
2. Reiniciar Uvicorn/servicio.
3. Confirmar `/health` con License Server `1.2.0`.
4. Abrir `/admin-ui`.
5. Crear una licencia PAID comprobando clave automática, autocompletado del cliente y capacidad por plan.
6. Crear una licencia TRIAL y confirmar `expires_at`.
7. Autorizar una instalación y validar el flujo `/v1/licenses/validate`.
8. Probar suspensión, reactivación y revocación.

## Compatibilidad y seguridad
- No se modifica la clave privada RS256 ni se publica en GitHub.
- El token administrativo sigue fuera del repositorio.
- MikroTik, OLT y operación ISP siguen locales; el VPS administra únicamente licenciamiento.
- La base existente se conserva.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.69.md`

# Z-Hub 1.2.69 — Continuidad License Center

Fecha: 2026-09-10

## Cambio
Se reemplaza para nuevas licencias el sufijo corto de 8 caracteres hexadecimales por un identificador aleatorio de 48 caracteres hexadecimales (24 bytes / 192 bits).

Formato oficial:
`ZHUB-AAAA-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

Ejemplo de forma (no reutilizar como licencia):
`ZHUB-2026-8F3A7C91D2E64B80A1F94C7752B3D8E69A41F271C6E84353`

## Implementación
- `license_server/static/key192.js`: usa `crypto.getRandomValues()` con 24 bytes y los representa como 48 HEX mayúsculas.
- `license_server/static/index.html`: carga el generador 192-bit después de `app.js`, reemplazando el generador de UI anterior.
- SQLite mantiene `license_key` como PRIMARY KEY, por lo que una colisión no puede guardarse como licencia duplicada.
- No se usan `#`, `$`, `%` ni otros caracteres especiales para evitar problemas de transporte/escape.
- Las licencias existentes no se modifican ni migran; el formato se aplica a claves nuevas/regeneradas.

## Backup
`backup/pre-license-key-192bit-1.2.69-20260910`

## Riesgo / pendiente
El endpoint legado `/admin/licenses/generate-key` continúa existiendo para compatibilidad, pero la interfaz 1.2.69 genera las nuevas claves de 192 bits con Web Crypto. En una revisión futura puede alinearse también ese endpoint sin romper consumidores existentes.

## Prueba operativa pendiente
Actualizar el contenedor `web-licencia`, recargar `/admin-ui` sin caché y confirmar visualmente que Nueva licencia muestre 48 caracteres HEX después de `ZHUB-2026-` y que `Generar otra` produzca una clave distinta.


---

## Fuente consolidada: `CONTINUIDAD_Z-HUB-1.2.70.md`

# Continuidad Z-Hub 1.2.70

Fecha: 2026-09-10

## Objetivo
Corregir el comportamiento de las licencias TRIAL del License Center para que no hereden la capacidad del plan comercial seleccionado.

## Cambios
- Toda licencia `TRIAL` queda limitada a **20 abonados**.
- El límite se aplica en la interfaz y también en el backend; no depende del valor enviado por el navegador.
- Al seleccionar `TRIAL`, el plan pasa automáticamente a `TRIAL` y el selector comercial queda bloqueado.
- La interfaz muestra el mensaje: `TRIAL: máximo 20 abonados y vencimiento automático a los 30 días.`
- El vencimiento sigue siendo automático a los 30 días mediante `expires_at`.
- Las licencias `PAID` continúan usando `PLAN_100`, `PLAN_300`, `PLAN_500`, `PLAN_1000` e `ILIMITADO`.
- El generador del backend queda alineado con el formato largo de 192 bits usando `secrets.token_hex(24)`.
- License Server pasa a versión interna `1.2.1`.
- Panel Z-Hub pasa a `1.2.70`.

## Seguridad
El servidor fuerza `max_clients=20` para `TRIAL`, por lo que una petición manual a la API no puede elevar la capacidad de prueba indicando otro plan o otro máximo.

## Compatibilidad
No se borra ni reinicializa SQLite. Las licencias existentes permanecen almacenadas. El cambio afecta la creación/edición de licencias TRIAL y las nuevas claves generadas.

## Backup previo
`backup/pre-trial-limit-1.2.70-20260910`

## Archivos principales
- `license_server/app/main.py`
- `license_server/static/app.js`
- `backend/tests/test_license_center_web_contract.py`
- `frontend/src/modules/system-update/version.js`

## Pruebas
Se actualizaron los contratos para verificar:
- `TRIAL_MAX_CLIENTS = 20`;
- servidor fuerza plan/capacidad TRIAL;
- UI contiene `TRIAL:20` y el texto de máximo 20 abonados;
- generador usa 24 bytes aleatorios / 48 caracteres hexadecimales;
- versión `1.2.70`.

La ejecución completa de GitHub Actions debe verificarse antes de considerar cerrada la validación automática.
