# Z-Hub 1.3.3 — Bootstrap seguro de Web-Licence

Durante la prueba real de Etapa 7/7, una instalación limpia llegó al Setup Wizard pero Auto-TRIAL devolvió `License Server no configurado`.

La causa fue que `deploy/install.sh` solo podía conservar variables remotas ya existentes en Supervisor. En una instalación nueva no existían aún `ZHUB_LICENSE_SERVER_URL` ni `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE`.

La corrección agrega un bootstrap previo que instala la clave pública RS256 y la CA TLS pública incluidas en `deploy/license/`, actualiza el almacén de certificados del sistema y exporta la configuración remota antes de ejecutar el instalador principal. No se incluye material privado y no se desactiva la validación TLS.

Backup: `backup/pre-license-bootstrap-1.3.3-20260911`

Rama: `work/license-bootstrap-1.3.3-20260911`

Validación pendiente tras merge: repetir el instalador en el LXC de laboratorio y confirmar Auto-TRIAL real con Web-Licence.
