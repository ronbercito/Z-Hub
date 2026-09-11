## 2026-09-11 — Reorganización documental de continuidad y backups

- Se revisó nuevamente `docs/backups/` y se confirmó la evolución de tres modelos históricos: copias directas de código, backups documentales y rollbacks registrados por rama/commit en informes/continuidad.
- Se agregó `docs/backups/README.md` para dejar explícita la convención: una carpeta de backup representa normalmente el estado protegido antes del cambio, no necesariamente la versión final resultante.
- Se conserva el material histórico existente; esta limpieza no elimina copias `.bak` ni registros de rollback.
- Se mantiene `docs/CONTINUIDAD_Z-HUB-v1.2.md` como fuente activa de la serie 1.2.x, con las versiones nuevas primero.
- `docs/CONTINUIDAD_Z-HUB.md` continúa siendo la bitácora maestra general; la sección de identidad antigua que decía 1.1.79 queda expresamente declarada como legado histórico y no como estado actual.
- No se modificó código funcional ni `PANEL_VERSION`.
- Commit de esta limpieza: `cbac1ee1155664993897bb343e854a492226962a`.

# Z-Hub — Bitácora maestra de continuidad

## 0. Fuente de verdad y reglas

**Fuente activa de la serie 1.2.x:** `docs/CONTINUIDAD_Z-HUB-v1.2.md`.

**Estado actual conocido:** Z-Hub 1.2.79 en `main`, según la bitácora v1.2. Antes de cualquier cambio hay que verificar nuevamente `main`, el despliegue real de `z2` y el estado desplegado de Web-Licence.

Esta bitácora maestra conserva contexto general e histórico. No debe interpretarse ningún dato antiguo de este archivo como estado actual si contradice la bitácora v1.2 o el código real de `main`.

### Reglas obligatorias

1. Identificar el propietario real del comportamiento y modificar solo lo necesario.
2. Crear respaldo antes de cambios críticos o delicados.
3. Ejecutar pruebas razonables y declarar exactamente qué se probó y qué queda pendiente.
4. Todo cambio funcional incrementa `frontend/src/modules/system-update/version.js` y actualiza el CHANGELOG correspondiente.
5. Actualizar la bitácora en la misma entrega.
6. Verificar código, versión y documentación en `main` antes de declarar una actualización publicada.
7. Nunca borrar la base de datos para corregir UI, subir secretos, ocultar errores de backend ni afirmar pruebas no realizadas.
8. Conservar datos reales y compatibilidad operacional.
9. Las nuevas entradas de la serie 1.2.x se agregan primero en `CONTINUIDAD_Z-HUB-v1.2.md`.
10. Un cambio solo documental no incrementa `PANEL_VERSION`.

---

## 1. Estado actual

La serie funcional activa del proyecto es **1.2.x**. La última versión documentada en `main` es **1.2.79**.

La arquitectura de licenciamiento fue separada: el servidor central y License Center viven en `ronbercito/web-licence`; Z-Hub conserva el cliente remoto, cache/JWT, activación, validación y enforcement necesarios para comunicarse con ese servicio.

La versión de producción de `z2` no debe asumirse igual a `main`: la bitácora v1.2 registra 1.2.77 como última versión confirmada manualmente en ese servidor.

---

## 2. Historial de versiones y cambios importantes — MÁS NUEVO PRIMERO

> **Regla:** siempre leer primero la versión más alta. Las versiones inferiores permanecen debajo. Esta sección es un índice rápido; el detalle completo de 1.2.x está en `docs/CONTINUIDAD_Z-HUB-v1.2.md`.

### 1.2.79 — Hardening visual del License Center
- Claves de licencia e Installation ID enmascarados por defecto.
- La acción `Copiar` conserva el valor real para el administrador autenticado.

### 1.2.78 — Cierre funcional de Etapa 7/7
- License Center con resumen comercial, clientes/ISP, licencias, instalaciones y validaciones.
- Filtros, métricas PAID/TRIAL y operaciones de renovar, suspender, revocar y reactivar.

### 1.2.77 — Persistencia de configuración remota
- El instalador preserva `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE` durante actualizaciones.
- Corrección del problema que hacía caer el backend a modo local después de actualizar.

### 1.2.76 — `expires_at` remoto autoritativo
- El vencimiento firmado por Web-Licence pasa a ser la fuente autoritativa para Trials remotos.

### 1.2.75 — Recuperación y activación remota
- Recuperación compatible con licencias PAID y TRIAL validadas remotamente.
- Activación real del Trial central validada en `z2`.

### 1.2.74 — Retiro de autorizaciones DEMO
- Se eliminan DEMO empaquetadas como autorización productiva.
- Un snapshot persistido ya no autoriza por sí solo.

### 1.2.73 — Bloqueo de recuperación
- Recuperación obligatoriamente bloqueada ante `invalid`, `missing`, `trial_expired` o `read_only`.
- Nunca se borran datos como mecanismo de recuperación.

### 1.2.72 — Estado remoto visible
- El panel muestra fuente de validación, servidor, Installation ID y período de gracia.

### 1.2.71 — Enforcement del Trial
- Aplicación local del límite real de **20 clientes** para Trial.

### 1.2.70 — License Center / automatización
- Evolución del License Center y automatización de claves/planes/Trials.
- Claves largas y Trial centralizado con límite de 20 abonados / 30 días.

### 1.2.69 — Licenciamiento remoto
- Continuación de la integración centralizada de licencias y validación remota.

### 1.2.68 — Licenciamiento remoto
- Continuación de la integración Web-Licence, activación e instalación persistente.

### 1.2.67 — Primer License Center web
- Base inicial del centro web para administrar licencias, instalaciones y Trials.

### 1.2.66 — Etapa 6/7: License Server remoto
- Integración remota con HTTPS, RS256/JWT, instalación persistente, cache firmada y período de gracia.

### 1.2.65 — Fallback histórico del instalador
- Corrección de la ruta de fallback/runtime hacia `backend/app/core/license_fallback.txt`.

### 1.2.64 — Normalización histórica de licencias
- Estados históricos de licencia normalizados para evitar contradicciones.

### 1.2.63 — Corrección de estados de licencia
- Corrección de estados contradictorios antes de la transición al servidor remoto.

### 1.2.62 — Trial y recuperación
- Continuación del flujo de Trial, vencimiento y recuperación/compra.

### 1.2.61 — Trial
- Implementación del flujo de Trial y sus reglas de vencimiento.

### 1.2.60 — Interfaz local de licencia
- Interfaz de gestión local de licencia.

### 1.2.59 — Límite real de abonados
- Aplicación del límite de capacidad de clientes según la licencia.

### 1.2.58 — License Manager local
- Inicio de la Etapa 2/7 de licenciamiento con administrador local.

### 1.2.57 — Ajustes visuales de Personal
- Correcciones de tema/visualización en gestión de personal.

### 1.2.56 — Temas claro/oscuro
- Correcciones visuales del tema claro y oscuro.

### 1.2.55 — Modales compactos de Ajustes
- Ajustes visuales y de tamaño para los modales del módulo Ajustes.

### 1.2.54 — Navegación de Ajustes
- Corrección del acceso real al tablero principal de Ajustes.

### 1.2.53 — Dashboard de Ajustes
- Incorporación de `SettingsHome` y organización del tablero de configuración.

### 1.2.52 — Colores y temas
- Integración/correcciones visuales de colores y temas.

### 1.2.51 — Integración de Inventario
- Retorno de equipos al inventario mediante coincidencia exacta Serial/MAC.
- Prevención de duplicados y doble devolución.

### 1.2.50 — Normalización de estados
- Correcciones de normalización del estado operativo antes de continuar con Equipos/Inventario.

### 1.2.49 — Corrección de CI/dependencias
- Corrección de dependencias `memfs` / `@jsonjoy.com/fs-snapshot` para estabilizar instalación y build.

### 1.2.48 — Recuperación de equipos
- Flujo operativo de recuperación con responsable, observaciones, contacto, visita y resolución por equipo.
- Cierre automático cuando corresponde y sin reapertura silenciosa.

### 1.2.47 — Retiro integrado con equipos
- El retiro del abonado integra los equipos asignados cuando Recuperación está habilitado.

### 1.2.46 — Base de Equipos
- Nueva base opcional `client_equipment` y API `/api/client-equipment`.

### 1.2.45 — Tabla de Clientes
- Rediseño de la tabla de clientes para mejorar la operación y consulta.

### 1.2.44 — Deuda agregada del cliente
- Consolidación de deuda considerando múltiples servicios del cliente.

### 1.2.43 — Creación guiada de clientes
- Flujo guiado y sincronización de nombres MikroTik → Router.

### 1.2.42 — Modal compacto de servicio
- Simplificación visual del modal de servicio.

### 1.2.41 — Flujo guiado de servicio
- Router → Tecnología → Plan → Conexión → Datos de acceso → Zona.
- Conserva el filtro de planes por tecnología.

### 1.2.40 — Filtro de planes por tecnología
- Los planes se filtran según la tecnología seleccionada.

### 1.2.39 — Hotfix de instalación/build
- Corrección de `craco: Permission denied` evitando copiar `.git`, `backend/venv` y `frontend/node_modules`.

### 1.2.38 — Republicación del saneamiento
- Republicación integral de la base saneada de 1.2.37 para que el Centro de Actualizaciones detecte una versión superior.

### 1.2.37 — Mantenimiento y hardening
- Saneamiento de instalador/permisos, `.env`, autenticación, cookies/JWT, MikroTik, retiro, comunicaciones, SMTP, timezone, workers, recuperación, permisos y DB.
- Regla operacional: el estado local cambia después de confirmar la operación MikroTik.

### 1.1.79 → 1.0.23 — HISTORIAL LEGACY
- Este bloque conserva el rango histórico anterior a 1.2.x.
- La documentación original de estas versiones se mantiene en los informes/historiales existentes del repositorio.
- **Importante:** 1.1.79 ya no es la versión actual; es un punto histórico anterior a la serie 1.2.x.
- El orden histórico de referencia dentro de este rango también debe interpretarse de mayor a menor versión: **1.1.79, 1.1.78, 1.1.77 … hasta 1.0.23**.

### Fuente detallada

Para la serie activa, consultar `docs/CONTINUIDAD_Z-HUB-v1.2.md`, donde las entradas completas están organizadas de **1.2.79 hacia abajo**.

Para versiones antiguas, consultar los informes históricos específicos de cada versión. No usar esos registros legacy para determinar el estado funcional actual.

---

## 3. Documentación y backups

### Continuidad

- `docs/CONTINUIDAD_Z-HUB.md` → contexto maestro general e histórico.
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → fuente activa de continuidad para 1.2.x.

### Backups

- `docs/backups/README.md` → convención y reglas de uso de backups históricos.
- `docs/backups/` → puntos de restauración históricos y material legado.

Los backups antiguos no se consideran código vigente. El código vigente se determina desde Git y `main`.

---

## 4. Identidad histórica del proyecto

- Repositorio principal desde 1.1.12: `ronbercito/Z-Hub`.
- Repositorio legado: `ronbercito/mirkohub`.
- Rama de publicación: `main`.
- Nombre público desde 1.1.10: **Z-Hub**.
- Nombres/rutas heredadas como **MikroHub** se conservan solo por compatibilidad.
- Tipo: panel de operaciones para ISP.
- Frontend: React.
- Backend: FastAPI/Python.
- Persistencia: SQLAlchemy/base de datos configurada por el proyecto.
- Integraciones: MikroTik, OLT y Google Maps según módulo.
- Fuente de versión visible: `frontend/src/modules/system-update/version.js`.

> **Nota histórica:** versiones antiguas de este archivo indicaban 1.1.79 como versión actual. Ese dato ya no representa el estado del proyecto y se conserva únicamente como registro histórico.

---

## 5. Regla de arquitectura

Para localizar cualquier error seguir la cadena:

```text
Vista React
  ↓
llamada API
  ↓
router FastAPI
  ↓
modelo / base de datos / integración
  ↓
resultado
  ↓
build y despliegue
```

No corregir un problema de negocio en Layout si pertenece a Clientes, Red o Facturación. Antes de cambiar un archivo, identificar el dueño real del comportamiento. No hacer cambios globales a ciegas.

---

## 6. Estado funcional histórico

Los detalles de Facturación, Clientes/Servicios, Red/IP/NAP/ONU, Equipos/Recuperación, Inventario, Ajustes, Actualizaciones y Licenciamiento se mantienen en la continuidad v1.2 y en los informes específicos de cada versión.

Para evitar duplicidad y contradicciones, esta bitácora maestra no debe volver a copiar bloques extensos de implementación que ya tengan una fuente activa en `CONTINUIDAD_Z-HUB-v1.2.md`.

---

## 7. Regla para futuras sesiones

Antes de modificar Z-Hub:

1. Leer `docs/CONTINUIDAD_Z-HUB.md`.
2. Leer `docs/CONTINUIDAD_Z-HUB-v1.2.md` completa.
3. Revisar el estado real de `main`.
4. Revisar la versión realmente instalada en producción cuando el cambio afecte despliegue.
5. Identificar archivos propietarios del comportamiento.
6. Crear backup cuando el cambio sea crítico.
7. Implementar y probar.
8. Actualizar versión/CHANGELOG si es funcional.
9. Actualizar la continuidad en la misma entrega.
10. Verificar que código y documentación estén en `main`.

**Nunca asumir que la versión de `main` está instalada en producción.**

---

## 8. Estado de la limpieza documental

Revisión interna: **2026-09-11**.

Resultado:

- Backups históricos conservados.
- Convención de backups documentada.
- Serie 1.2.x reconocida con fuente activa única.
- Historial rápido reorganizado con la versión más reciente primero.
- Versión antigua 1.1.79 desambiguada como dato histórico.
- No se incrementó `PANEL_VERSION`.
- No se modificó lógica funcional.
