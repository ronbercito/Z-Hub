# Z-Hub — guía de pruebas de autenticación y módulos base

> Documento de apoyo para pruebas. Desde Z-Hub 1.2.37 **no existen credenciales administrativas predeterminadas**. La cuenta admin se crea mediante el asistente inicial.

## Variables para pruebas

No guardar credenciales reales en Git. Definirlas únicamente en el entorno de pruebas:

```bash
export REACT_APP_BACKEND_URL="http://127.0.0.1:8001"
export ZHUB_TEST_EMAIL="admin-de-pruebas@ejemplo.local"
export ZHUB_TEST_PASSWORD="<contraseña-del-entorno-de-pruebas>"
```

## Verificaciones mínimas

1. **Autenticación**
   - `POST /api/auth/login` con una cuenta creada para pruebas.
   - confirmar cookie `access_token` httpOnly.
   - `GET /api/auth/me` debe funcionar con la cookie.
   - una credencial inválida debe retornar 401.

2. **Permisos**
   - admin: acceso completo.
   - técnico/cobranzas: comprobar los permisos configurados, incluidos los submenús `settings_*`.

3. **Clientes + MikroTik**
   - alta exitosa únicamente con un MikroTik de laboratorio o un mock que confirme aprovisionamiento.
   - fallo de aprovisionamiento debe conservar la base sin un alta parcial.
   - corte/reactivación: el estado local solo debe cambiar cuando MikroTik confirme la acción.
   - eliminación: si falla la limpieza de MikroTik, el cliente no debe desaparecer de la base.

4. **Facturación**
   - registrar pago completo/parcial.
   - si un pago deja al cliente sin deuda, intentar reactivación; ante fallo MikroTik el pago se conserva y el cliente sigue suspendido.
   - generación mensual sin duplicados y respetando pausas.

5. **Retiro**
   - liberar recursos técnicos.
   - conservar facturas, tickets, tareas, documentos, comunicaciones y actividades.
   - facturas pendientes deben pasar a anuladas, no borrarse.

6. **Recuperación de equipos**
   - crear caso → Contactado → Visita programada → Recuperado/No recuperado.
   - un caso cerrado no puede reabrirse editando su estado; un nuevo intento debe crear otro caso.

7. **Despliegue/seguridad**
   - `backend/.env` debe quedar con permisos 600.
   - ejecutar build React y arranque del backend.
   - comprobar `/api/health` tras la actualización.

## Nota sobre pruebas históricas

Los resultados guardados en `test_reports/` corresponden a iteraciones anteriores y no certifican por sí solos la versión actual. Cada reporte nuevo debe indicar versión y commit probados.
