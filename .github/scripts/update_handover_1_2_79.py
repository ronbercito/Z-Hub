from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
V12 = ROOT / 'docs' / 'CONTINUIDAD_Z-HUB-v1.2.md'
MASTER = ROOT / 'docs' / 'CONTINUIDAD_Z-HUB.md'

section_title = '## PUNTO DE CONTINUIDAD ACTUAL — 2026-09-11 — Z-Hub 1.2.79 / Licencias 7/7'

section = r'''
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
'''.strip() + '\n\n'

text = V12.read_text(encoding='utf-8')
if section_title not in text:
    marker = '# HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO\n'
    if marker not in text:
        raise SystemExit('No se encontró marcador de historial en bitácora v1.2')
    text = text.replace(marker, marker + '\n' + section, 1)
    V12.write_text(text, encoding='utf-8')

master_title = '## 2026-09-11 — Punto de continuidad integral 1.2.79 / License Center 7/7'
master = MASTER.read_text(encoding='utf-8')
if master_title not in master:
    master += f'''\n\n{master_title}\n\n- Se dejó un handover integral y operativo en `docs/CONTINUIDAD_Z-HUB-v1.2.md` con el estado de Z-Hub 1.2.79, License Server 1.3.0, Etapas 1/7–7/7, TLS/CA, RS256/JWT, Supervisor, despliegues confirmados, pendientes exactos y reglas de seguridad.\n- Para cualquier conversación futura sobre la serie 1.2, leer primero el bloque `PUNTO DE CONTINUIDAD ACTUAL — 2026-09-11 — Z-Hub 1.2.79 / Licencias 7/7` dentro de la bitácora v1.2.\n- Estado de despliegue documentado sin asumir lo no comprobado: `z2` confirmado en 1.2.77 y `web-licencia` confirmado en commit 1.2.78/License Server 1.3.0; 1.2.79 está en `main` y requiere despliegue/validación final.\n- No se registran valores de Admin Token, claves privadas ni licencia completa.\n- Cambio exclusivamente documental: `PANEL_VERSION` permanece en 1.2.79.\n'''
    MASTER.write_text(master, encoding='utf-8')

print('handover actualizado')
