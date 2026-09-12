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
- Queda pendiente continuar la prueba funcional de Auto-TRIAL desde el Wizard y validar el enlace HW-ID / Installation ID en Web-Licence.

---

## 1.3.2 — Etapa 7/7: validación integral y cierre del flujo comercial

**Objetivo:** cerrar el circuito registro -> Trial automático -> reinstalación -> conversión PAID -> renovación/suspensión y asegurar que Z-Hub refleje los datos comerciales administrados por Web-Licence.

- Mantiene el mismo `Installation ID`, HW-ID y licencia después de convertir TRIAL a PAID.
- `/api/license/info` consulta el vencimiento comercial PAID en Web-Licence para mostrar la fecha real al cliente.
- La clave de licencia continúa oculta y no vuelve al flujo visible.
- Se agrega `backend/tests/test_stage7_e2e_contract.py` y pasa a formar parte obligatoria de CI.
- Backup previo: `backup/pre-stage7-e2e-1.3.2-20260911`.
- Rama: `work/stage7-e2e-1.3.2-20260911`.
- El despliegue real se valida por separado después del merge y CI verde.

---

## 1.3.1 — Etapa 5/7: Licencia simplificada para el cliente

**Objetivo:** retirar del panel del cliente la gestión manual de claves y los detalles técnicos internos del License Server. Web-Licence queda como fuente administrativa y comercial de la licencia.

### Vista del cliente

- Estado de licencia.
- Plan actual.
- Vencimiento disponible.
- Días restantes cuando es TRIAL.
- Capacidad autorizada y uso.
- Installation ID.
- Botón único `Solicitar licencia por WhatsApp` para TRIAL y `Renovar licencia por WhatsApp` para licencias pagadas.
- El mensaje de WhatsApp incluye automáticamente Installation ID, plan y estado para facilitar la atención comercial.

### Seguridad / operación

- La UI ya no muestra la clave enmascarada ni ofrece formulario para escribir una nueva clave.
- La UI deja de exponer fuente de validación, estado técnico del License Server, caché o gracia.
- La ruta backend `/api/license/activate` permanece temporalmente como compatibilidad administrativa, pero no forma parte del flujo visible del cliente.
- Si el Trial vence o la licencia queda inválida, los datos permanecen intactos; el cliente contacta soporte y luego usa `Actualizar estado` después de que Web-Licence cambie la licencia.

### Rollback

- Backup previo: `backup/pre-license-customer-view-1.3.1-20260911`.
- Rama de trabajo: `work/license-customer-view-1.3.1-20260911`.

---

## 1.3.0 — Etapa 4/7: Setup Wizard con Auto-TRIAL

**Objetivo:** retirar la introducción manual de claves del proceso normal de primera instalación y conectar el Wizard con el Auto-TRIAL construido en las etapas 2/7 y 3/7.

### Flujo

`registro cliente -> instalación Z-Hub -> correo registrado -> HW-ID local -> Web-Licence -> activar/recuperar TRIAL -> validar licencia firmada -> crear admin -> finalizar`.

### Backend

- Nuevo `POST /api/setup/auto-trial`.
- El endpoint obtiene/persiste `license_installation_id`, invoca `activate_auto_trial()` y Web-Licence 1.4.3 decide por HW-ID si activa o recupera el TRIAL.
- Después de recibir la asignación, Z-Hub valida la licencia por el contrato remoto existente antes de persistir metadata.
- Rechazos comerciales se separan de indisponibilidad temporal del License Server.
- `/api/setup/license` se conserva como compatibilidad/recuperación administrativa, pero deja de ser el flujo normal del Wizard.
- `/api/setup/complete` ya no recibe la clave desde el navegador: utiliza y vuelve a validar la licencia almacenada por el backend.

### Frontend

- El primer paso del Wizard solicita el correo registrado, no una serie de licencia.
- Informa que el servidor será identificado para impedir múltiples Trials.
- Si el HW-ID ya tuvo Trial, se recupera el mismo registro sin reiniciar el período.
- El segundo paso crea el administrador y el tercero confirma la configuración.

### Versionado

- Primera versión de la nueva serie: **1.3.0**.
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` queda como histórico de 1.2.x.
- Las siguientes 1.3.x se documentarán en este archivo, más nuevas primero.

### Rollback

- Backup previo: `backup/pre-wizard-auto-trial-1.3.0-20260911`.
- Rama de trabajo: `work/wizard-auto-trial-1.3.0-20260911`.

### Cierre

- PR #12 integrado a `main` después de CI verde.
- Merge: `60829ef213f1f7b492bbdec1a3373a72289aa63b`.
- Despliegue real de Z-Hub 1.3.0 confirmado desde el Centro de Actualizaciones.
