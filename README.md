<!--
Archivo: README.md
Actualización: 2026-09-10 — saneamiento 1.2.37 y fuente activa de continuidad.
Función: punto de entrada del repositorio Z-Hub y acceso a sus guías principales.
-->

# Z-Hub

Panel de gestión para operación ISP: clientes, red, routers/OLT, IPv4, facturación, tickets, mensajería, tareas, ajustes y actualizaciones.

## 📚 Lectura obligatoria antes de modificar

1. **README.md** — reglas generales del repositorio.
2. **`docs/CONTINUIDAD_Z-HUB-v1.2.md`** — **bitácora activa de la serie 1.2.x** y fuente autoritativa para el estado actual, versión, cambios, pruebas y pendientes.
3. **`docs/CONTINUIDAD_Z-HUB.md`** — archivo maestro histórico anterior. Contiene contexto extenso de etapas previas, pero actualmente no debe usarse solo para deducir el estado de las versiones recientes hasta que ambas bitácoras se reconcilien de forma documental y segura.
4. Archivo/módulo específico que se vaya a modificar.

> Regla de seguridad documental: cuando exista una diferencia entre la bitácora histórica y la bitácora activa 1.2.x sobre el estado actual, prevalece `docs/CONTINUIDAD_Z-HUB-v1.2.md`. No se debe truncar ni sobrescribir el archivo histórico para “ponerlo al día”.

## Instalación y despliegue

- **`INSTALL_DEBIAN.md`** — guía de instalación y despliegue.
- **`install.sh`** — entrada principal del instalador/actualizador.
- **`deploy/install.sh`** — implementación del despliegue.

## 🔐 Reglas de seguridad

La documentación interna no debe:

- importarse desde React o FastAPI;
- copiarse al directorio público del panel;
- incluirse como fuente de datos del frontend;
- contener contraseñas, tokens, claves privadas, `.env` ni secretos reales.

Los secretos del servidor pertenecen a `backend/.env`, fuera de Git, y el instalador debe mantener ese archivo con permisos restringidos.

## 📝 Regla de continuidad y publicación

Todo cambio funcional debe:

1. Revisar primero el estado real de `main`.
2. Crear un backup recuperable antes de cambios críticos o delicados.
3. Modificar el módulo propietario del comportamiento, no aplicar parches globales innecesarios.
4. Actualizar `frontend/src/modules/system-update/version.js`; el `CHANGELOG` contiene únicamente la versión actual.
5. Registrar la versión nueva al inicio de `docs/CONTINUIDAD_Z-HUB-v1.2.md` mientras esta serie siga activa.
6. Indicar archivos modificados, compatibilidad, pruebas realizadas, pruebas pendientes y riesgos conocidos.
7. No afirmar build, pruebas de servidor, MariaDB, MikroTik u OLT si no se ejecutaron realmente.
8. Verificar código, versión y bitácora en `main` antes de considerar publicada la entrega.

Los cambios exclusivamente documentales no incrementan `PANEL_VERSION`.

## Arquitectura resumida

`React → API /api → FastAPI → SQLAlchemy/MariaDB o integración MikroTik/OLT → respuesta → UI`

Las operaciones que modifican un equipo externo deben confirmar el resultado del equipo antes de reflejar un estado incompatible en la base local. Los hechos financieros, como un pago registrado, se conservan aunque una reactivación de red posterior falle; en ese caso el cliente debe permanecer suspendido y mostrarse el error operativo.
