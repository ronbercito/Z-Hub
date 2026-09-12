# Z-Hub — Bitácora de continuidad v1.3

## REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR

Esta es la fuente activa de continuidad para **Z-Hub 1.3.x**. La serie 1.2.x queda cerrada en `docs/CONTINUIDAD_Z-HUB-v1.2.md` como histórico.

1. Revisar `main` y esta bitácora antes de modificar.
2. Crear backup antes de cambios críticos.
3. Todo cambio funcional incrementa `PANEL_VERSION`; las nuevas versiones se agregan primero.
4. Mantener Web-Licence separado de Z-Hub y no versionar secretos.
5. Probar CI y declarar por separado código integrado y despliegue real.
6. No borrar datos para resolver problemas de licencia o UI.

---

# HISTORIAL 1.3.xx — MÁS NUEVO PRIMERO

## 1.3.4 — Regla comercial definitiva: PAID sin vencimiento y límite por abonados activos

**Decisión validada con el propietario durante la prueba Etapa 7/7:** solo el TRIAL tiene vigencia temporal. Las licencias pagadas no vencen por días y se controlan exclusivamente por la cantidad de abonados activos.

### Contrato definitivo

- `TRIAL`: 30 días, máximo 20 abonados activos.
- `PLAN_100`: sin vencimiento, máximo 100 abonados activos.
- `PLAN_300`: sin vencimiento, máximo 300 abonados activos.
- `PLAN_500`: sin vencimiento, máximo 500 abonados activos.
- `PLAN_1000`: sin vencimiento, máximo 1000 abonados activos.
- `ILIMITADO`: sin vencimiento y sin límite de abonados activos.
- El consumo de capacidad cuenta únicamente registros `Client.status == "active"`; suspendidos, pausados, retirados o pendientes no consumen cupo mientras no estén activos.

### Comportamiento al alcanzar el límite

- **No se bloquea el panel.** Facturación, cobranza, edición, suspensión, routers, OLTs, monitoreo, mapas, reportes, ajustes, personal y demás funciones continúan disponibles.
- Se bloquea con HTTP `409 CLIENT_LIMIT_REACHED` únicamente una operación que incremente la cantidad de abonados activos: alta de un nuevo abonado, reactivación por `toggle-status`, reanudación de pausa y reactivación histórica de un retirado.
- Suspender/cortar un abonado activo siempre debe seguir permitido y libera capacidad.
- El mensaje indica el uso actual, el límite y que debe cambiarse a un plan superior para registrar/reactivar más clientes.
- El control está en backend mediante `license_guard.py`; no depende solo del frontend.

### UI / licencia

- Las licencias PAID muestran `Sin vencimiento`.
- La pantalla de Licencia se centra en `abonados activos / capacidad` y en el cambio de plan.
- Al llegar al límite se informa que solo quedan bloqueadas nuevas altas/reactivaciones.
- Se alinean los planes locales con Web-Licence: 100/300/500/1000/ILIMITADO.

### Versionado / rollback

- `PANEL_VERSION = "1.3.4"`.
- Backup previo: `backup/pre-capacity-only-licensing-1.3.4-20260911`.
- Rama: `work/capacity-only-licensing-1.3.4-20260911`.
- Web-Licence relacionado: 1.4.6.
- El despliegue real se valida por separado tras CI/merge; no asumir que `main` ya está instalado.

---

## 1.3.3 — Corrección de instalación limpia: bootstrap seguro de Web-Licence

**Hallazgo real durante Etapa 7/7:** una instalación nueva de Z-Hub llegó correctamente al Wizard, pero al intentar Auto-TRIAL respondió `License Server no configurado`.

### Causa

- `deploy/install.sh` ya conservaba `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE` cuando existían en Supervisor.
- Una instalación desde cero no tenía configuración previa de Supervisor, por lo que ambas variables quedaban vacías.
- El Wizard estaba correcto; el defecto estaba en el proceso de instalación limpia.

### Corrección

- Se agrega `deploy/license_bootstrap.sh` y el instalador raíz lo carga antes de ejecutar `deploy/install.sh`.
- La configuración pública por defecto vive en `deploy/license/bootstrap.env` y puede sobreescribirse con variables de entorno.
- El bootstrap instala únicamente material **público** de confianza:
  - `deploy/license/server-public.pem` -> `/etc/zhub/licencia/server-public.pem` para verificar autorizaciones RS256.
  - `deploy/license/zhub-lab-ca.crt` -> `/usr/local/share/ca-certificates/zhub-lab-ca.crt` y ejecuta `update-ca-certificates` para validar TLS normalmente.
- En instalación limpia se usa como endpoint por defecto `https://192.168.10.240`; sigue siendo sobreescribible mediante `ZHUB_LICENSE_SERVER_URL`.
- Se exportan automáticamente `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE`, que luego son persistidas por la lógica existente de Supervisor.
- No se usa `curl -k`, no se desactiva validación TLS y no se versiona ninguna clave privada.
- Se agrega `backend/tests/test_license_bootstrap_133_contract.py` para evitar regresiones del bootstrap.

### Seguridad

- Permitido en repositorio: clave pública RS256 y certificado público de CA.
- Prohibido y no agregado: `private.pem`, claves privadas TLS, CA privada, tokens o secretos del servidor Web-Licence.

### Versionado / rollback

- `PANEL_VERSION = "1.3.3"`.
- Backup previo: `backup/pre-license-bootstrap-1.3.3-20260911`.
- Rama de trabajo: `work/license-bootstrap-1.3.3-20260911`.

### Validación real en laboratorio

- LXC de prueba `Grupo-Pobre` actualizado correctamente a **Z-Hub 1.3.3**.
- En la primera ejecución desde 1.3.2, `install.sh` se autoactualizó a 1.3.3 durante el mismo proceso; por ello el bootstrap nuevo no podía ejecutarse hasta la siguiente invocación del instalador ya actualizado.
- Segunda ejecución confirmada con los artefactos públicos instalados:
  - `/etc/zhub/licencia/server-public.pem`
  - `/usr/local/share/ca-certificates/zhub-lab-ca.crt`
- Supervisor confirmado con:
  - `ZHUB_LICENSE_SERVER_URL="https://192.168.10.240"`
  - `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE="/etc/zhub/licencia/server-public.pem"`
- Auto-TRIAL posteriormente validado: Wizard avanzó, Installation ID quedó vinculado y otro contenedor con el mismo cliente fue rechazado para una segunda prueba.

---

## 1.3.2 — Etapa 7/7: validación integral y cierre del flujo comercial

**Objetivo histórico:** cerrar el circuito registro -> Trial automático -> reinstalación -> conversión PAID -> renovación/suspensión. La regla de vencimiento PAID definida aquí quedó **supersedida por 1.3.4**.

- Mantiene el mismo `Installation ID`, HW-ID y licencia después de convertir TRIAL a PAID.
- La clave de licencia continúa oculta y no vuelve al flujo visible.
- Se agrega `backend/tests/test_stage7_e2e_contract.py` y pasa a formar parte obligatoria de CI.
- Backup previo: `backup/pre-stage7-e2e-1.3.2-20260911`.
- Rama: `work/stage7-e2e-1.3.2-20260911`.

---

## 1.3.1 — Etapa 5/7: Licencia simplificada para el cliente

**Objetivo:** retirar del panel del cliente la gestión manual de claves y los detalles técnicos internos del License Server. Web-Licence queda como fuente administrativa y comercial de la licencia.

### Vista del cliente

- Estado de licencia.
- Plan actual.
- Vencimiento disponible para TRIAL; desde 1.3.4 PAID muestra `Sin vencimiento`.
- Días restantes cuando es TRIAL.
- Capacidad autorizada y uso.
- Installation ID.
- Botón de contacto comercial por WhatsApp.

### Seguridad / operación

- La UI no muestra la clave ni ofrece formulario para escribir una nueva clave.
- Si el Trial vence o la licencia queda inválida, los datos permanecen intactos.

### Rollback

- Backup previo: `backup/pre-license-customer-view-1.3.1-20260911`.
- Rama de trabajo: `work/license-customer-view-1.3.1-20260911`.

---

## 1.3.0 — Etapa 4/7: Setup Wizard con Auto-TRIAL

**Objetivo:** retirar la introducción manual de claves del proceso normal de primera instalación y conectar el Wizard con el Auto-TRIAL.

### Flujo

`registro cliente -> instalación Z-Hub -> correo registrado -> HW-ID local -> Web-Licence -> activar/recuperar TRIAL -> validar licencia firmada -> crear admin -> finalizar`.

### Backend

- Nuevo `POST /api/setup/auto-trial`.
- El endpoint obtiene/persiste `license_installation_id`, invoca `activate_auto_trial()` y Web-Licence decide por HW-ID si activa o recupera el TRIAL.
- `/api/setup/license` queda como compatibilidad/recuperación administrativa.
- `/api/setup/complete` usa la licencia almacenada por backend.

### Frontend

- El Wizard solicita el correo registrado, no una serie de licencia.
- Si el HW-ID ya tuvo Trial, recupera el mismo registro sin reiniciar el período.

### Rollback

- Backup previo: `backup/pre-wizard-auto-trial-1.3.0-20260911`.
- Rama de trabajo: `work/wizard-auto-trial-1.3.0-20260911`.

### Cierre

- PR #12 integrado a `main` después de CI verde.
- Merge: `60829ef213f1f7b492bbdec1a3373a72289aa63b`.
- Despliegue real de Z-Hub 1.3.0 confirmado desde el Centro de Actualizaciones.
