# Informe de mantenimiento y saneamiento — Z-Hub 1.2.37

**Fecha:** 2026-09-10  
**Repositorio:** `ronbercito/Z-Hub`  
**Rama:** `main`  
**Versión de origen:** 1.2.36  
**Versión de entrega:** 1.2.37

## 1. Respaldo realizado antes de modificar

Antes de aplicar cualquier corrección se creó un respaldo integral del repositorio mediante la rama:

`backup/pre-maintenance-1.2.36-20260910`

La rama apunta al estado exacto previo al saneamiento:

`d086581b5f8e09fcb518ea702b51a2950306bcdc`

También se documentó el punto de restauración en `docs/backups/1.2.36/FULL_REPOSITORY_BACKUP.md`.

Este respaldo permite volver al código completo de 1.2.36 si una prueba real del servidor descubre una incompatibilidad no reproducida en CI.

## 2. Seguridad del instalador y secretos

Se eliminó la aplicación global de permisos `chmod -R 755` sobre todo el árbol de Z-Hub. El instalador ahora diferencia permisos de directorios, código, scripts y contenido web, y protege expresamente `backend/.env` con modo `600`.

Se agregó `SESSION_COOKIE_SECURE` para poder exigir cookie Secure al usar HTTPS, y `APP_ENCRYPTION_KEY` para separar el cifrado de secretos SMTP de `JWT_SECRET`. Se mantiene compatibilidad para leer datos SMTP cifrados previamente con la clave histórica.

## 3. Autenticación

El JWT ya no se persiste en `localStorage`. La sesión persistente utiliza la cookie httpOnly emitida por el backend. El token devuelto en login se conserva únicamente en memoria como compatibilidad temporal con componentes que todavía construyen `Authorization: Bearer`.

El backend acepta la cookie cuando no hay Bearer válido, incluso si un componente antiguo envía accidentalmente `Authorization: Bearer ` vacío tras una recarga.

## 4. Integridad Z-Hub ↔ MikroTik

Se endurecieron las operaciones que cambian el estado técnico del abonado:

- Suspender: el estado local cambia solo si MikroTik confirma el corte.
- Reactivar: el estado local cambia solo si MikroTik confirma la restauración.
- Eliminación definitiva: si no se puede limpiar RouterOS, el cliente no se elimina de la base local.
- Pago de deuda: el pago se conserva como hecho financiero aunque la restauración de red falle; en ese caso el cliente permanece suspendido y la API informa la incidencia.

El objetivo es evitar que Z-Hub muestre un estado distinto del que realmente conserva RouterOS.

## 5. Retiro de clientes e historial

El retiro dejó de destruir el historial administrativo. Ya no se eliminan facturas, tickets, tareas, documentos, comunicaciones ni actividades del cliente retirado.

Las obligaciones pendientes se cancelan/archivan en lugar de borrarse, y los servicios adicionales se conservan como retirados. La ficha técnica histórica introducida previamente continúa disponible para Recuperación de equipos.

La limpieza de MikroTik sigue siendo obligatoria antes de completar el retiro local.

## 6. Comunicaciones Email/SMS

Los endpoints que únicamente registraban una comunicación ya no afirman que un mensaje fue enviado externamente. Mientras no exista un proveedor real asociado, el registro queda con estado `registered` y la respuesta indica `sent: false`.

Esto evita que un operador interprete un registro interno como confirmación de entrega al abonado.

## 7. Ajustes, SMTP y configuración

`PUT /api/settings` ahora valida las claves recibidas contra una lista permitida. Claves internas, secretos y contadores no pueden modificarse arbitrariamente por el endpoint genérico.

Las operaciones SMTP bloqueantes se desplazaron fuera del event loop principal. El cifrado SMTP puede utilizar `APP_ENCRYPTION_KEY` separada de la firma JWT.

## 8. Zona horaria y workers

Se agregó `APP_TIMEZONE`, con valor predeterminado `America/Lima`. Las decisiones diarias de facturación, pausa y suspensión prolongada utilizan la fecha operativa local en lugar de depender exclusivamente de UTC.

Los workers de pausa y suspensión prolongada ahora registran excepciones en logs; dejaron de ocultar fallos mediante `except: pass`.

## 9. Recuperación de equipos

Los estados `Recuperado` y `No recuperado` se consideran cerrados. Un caso cerrado no puede volver silenciosamente a Pendiente/Contactado/Visita programada mediante PATCH. Si se necesita un nuevo ciclo, debe abrirse un nuevo caso.

Se mantiene la decisión de no alterar automáticamente Almacén hasta tener una asociación inequívoca entre el equipo recuperado y un registro real de inventario.

## 10. Permisos, base de datos y documentación

Los tabs `settings_*` se resuelven de forma consistente contra el permiso `settings` para roles personalizados.

Se eliminó la doble ejecución accidental de `_add_missing_columns()` durante el arranque MariaDB.

Se actualizaron README, guía de instalación, documentación de autenticación/pruebas, README del frontend y branding documental. Los reportes antiguos quedan señalados como históricos y no como certificación vigente.

La bitácora activa de la serie es `docs/CONTINUIDAD_Z-HUB-v1.2.md`. `docs/CONTINUIDAD_Z-HUB.md` permanece como archivo histórico extenso y no se truncó.

## 11. Calidad y pruebas automáticas

Se agregó `backend/tests/test_maintenance_contracts.py` con contratos de regresión para las correcciones críticas del saneamiento.

También se agregó `.github/workflows/quality.yml` para ejecutar en `main`:

1. compilación estática Python;
2. regresiones de mantenimiento con pytest;
3. instalación de dependencias frontend;
4. build React de producción.

El primer intento del job frontend no llegó a compilar porque el workflow configuró caché para `frontend/yarn.lock`, archivo que el repositorio no contiene. No fue un error del código React. El workflow se corrigió eliminando esa dependencia de caché/frozen-lockfile.

La ejecución de GitHub Actions **34487091693**, commit `35f575d702fa64eaeb228c826938d68e84d37c7c`, terminó con resultado **success**: backend-static OK y frontend-build OK.

## 12. Qué todavía requiere prueba en el servidor real

CI no sustituye el entorno del ISP. Quedan expresamente pendientes:

- ejecutar la actualización mediante el Update Center del servidor;
- verificar el arranque con la MariaDB real y datos existentes;
- validar login/recarga de sesión mediante Nginx;
- comprobar al menos un cliente existente en el listado;
- probar corte/reactivación con un MikroTik real;
- probar pago que reactive servicio;
- probar pausa/reactivación;
- probar retiro conservando historial;
- revisar Recuperación de equipos;
- comprobar consulta OLT en el entorno real.

No se afirma que esas pruebas de producción hayan sido realizadas desde GitHub Actions.

## 13. Dependencias reproducibles

El frontend tiene versiones directas fijadas en `package.json`, pero actualmente no existe `frontend/yarn.lock`. El backend mantiene rangos mínimos en `requirements.txt`. No se fabricó un lockfile a mano porque hacerlo sin resolver el árbol real puede introducir una combinación no probada. La creación de lockfiles reproducibles debe hacerse desde un entorno de build resuelto y luego validar nuevamente CI y el servidor.

## 14. Restauración de emergencia

Si la actualización real presentara un problema grave no cubierto por las pruebas:

- el estado íntegro anterior está preservado en `backup/pre-maintenance-1.2.36-20260910`;
- commit exacto previo: `d086581b5f8e09fcb518ea702b51a2950306bcdc`;
- no se debe borrar ni reinicializar MariaDB para intentar corregir una falla de aplicación.

## 15. Resultado

Z-Hub 1.2.37 es una versión de mantenimiento centrada en seguridad, consistencia de datos, trazabilidad y calidad. No incorpora una función comercial nueva; endurece la base existente antes de continuar el desarrollo funcional a partir de 1.2.38.
