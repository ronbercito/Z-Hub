# Z-Hub 1.2.67 — License Center web inicial

## Objetivo
Agregar una interfaz web administrativa al License Server de Etapa 6 para operar clientes/ISP, licencias, instalaciones autorizadas e historial sin editar SQLite ni usar curl para tareas normales.

## Base estable
- Punto previo: Z-Hub 1.2.66.
- Backup: `backup/pre-license-center-web-1.2.67-20260910`.
- El License Server conserva validación RS256, installation_id y período de gracia.

## Cambios
- `license_server/static/index.html`: aplicación web administrativa.
- `license_server/static/styles.css`: diseño Z-Hub azul/blanco responsive.
- `license_server/static/app.js`: autenticación por token, dashboard y CRUD.
- `license_server/app/main.py`: API de clientes/ISP, listados administrativos, dashboard, CRUD de licencias e instalaciones y migración compatible de SQLite.
- Se crea tabla `customers`.
- Se agregan `customer_id` a `licenses` e `installation_name` a `installations` cuando una base antigua ya existe.
- `APP_VERSION` del License Server pasa a `1.1.0`.
- Z-Hub panel pasa a `1.2.67`.

## Web administrativa
Ruta: `/admin-ui`.

Funciones iniciales:
- dashboard;
- clientes/ISP;
- licencias;
- instalaciones;
- historial de validaciones.

La sesión web usa el token `ZHUB_LICENSE_ADMIN_TOKEN` y lo conserva en `sessionStorage`. Para exposición por Internet debe utilizarse HTTPS.

## Seguridad y continuidad
- La clave privada RS256 permanece solo en el License Server.
- La web no recibe información MikroTik/OLT ni datos operativos de abonados del ISP.
- Suspender una licencia o instalación afecta la validación central; no se reutiliza una autorización antigua ante rechazo explícito.
- El fallback local de transición de Z-Hub no se retira todavía hasta completar pruebas reales del VPS simulado.

## Validación prevista
1. actualizar checkout del contenedor;
2. reiniciar Uvicorn/servicio;
3. abrir `/admin-ui`;
4. crear un cliente/ISP;
5. crear licencia y asignarla;
6. autorizar installation_id;
7. validar desde `/v1/licenses/validate`;
8. comprobar suspensión/reactivación;
9. comprobar historial.
