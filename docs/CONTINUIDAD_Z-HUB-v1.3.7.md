# Z-Hub — Continuidad 1.3.7

> Complemento de `docs/CONTINUIDAD_Z-HUB-v1.3.md`. Mantener ambas referencias hasta consolidar esta entrada en la bitácora principal.

## 1.3.7 — Mensaje comercial de WhatsApp más ordenado

Fecha: 2026-09-12.

### Motivo

Durante la validación real de Z-Hub 1.3.6 se confirmó que el contacto comercial sincronizado desde Web-Licence y el botón de WhatsApp funcionan correctamente. El mensaje automático anterior era funcional, pero demasiado directo: `deseo pasar mi Z-Hub Trial a una licencia pagada`.

### Cambio

- Se reemplaza el texto por un mensaje comercial más presentable.
- El mensaje comienza con saludo y separa claramente el motivo de contacto de los datos técnicos.
- Para TRIAL solicita información para cambiar a un plan de pago.
- Para licencias PAID solicita información para cambiar o ampliar el plan/capacidad.
- Se incluyen en bloque ordenado:
  - Installation ID;
  - plan actual;
  - capacidad utilizada / abonados activos;
  - estado de la licencia.
- Se cierra solicitando información sobre los planes disponibles y el proceso correspondiente.
- El número de destino continúa sincronizándose desde el módulo Contacto de Web-Licence; este cambio no modifica el contrato de sincronización 1.4.7.

### Formato esperado — TRIAL

```text
Hola, buen día.

Quisiera solicitar información para cambiar mi Z-Hub Trial a un plan de pago.

Datos de mi instalación:
• Installation ID: <id>
• Plan actual: Trial
• Capacidad utilizada: <uso> de 20 abonados activos
• Estado: Trial activo

Agradecería información sobre los planes disponibles y el proceso para activar una licencia de pago.

Gracias.
```

### Versionado / rollback

- `PANEL_VERSION = "1.3.7"`.
- Backup previo: `backup/pre-whatsapp-message-1.3.7-20260912`.
- Rama: `work/whatsapp-message-1.3.7-20260912`.
- Archivo principal modificado: `frontend/src/modules/ajustes/LicenseSettings.jsx`.
- Contrato agregado: `backend/tests/test_whatsapp_message_137_contract.py`.
- Web-Licence no requiere cambio funcional para esta versión: continúa en 1.4.7 y entrega el contacto comercial central.

### Estado

- Código integrado en rama de trabajo; despliegue y prueba real del mensaje deben validarse después de CI/merge.
