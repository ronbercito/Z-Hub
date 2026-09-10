<!--
ARCHIVO INTERNO DE CONTINUIDAD — NO ES PARTE DEL PANEL
Archivo: docs/CONTINUIDAD_Z-HUB-v1.2.md
Serie: Z-Hub 1.2.xx
Propósito: conservar reglas prioritarias y el historial técnico de la serie 1.2.xx.

IMPORTANTE:
- No importar este archivo desde React, FastAPI, Nginx ni ningún bundle/build.
- No colocar contraseñas, tokens, claves privadas, .env ni datos sensibles.
- Este archivo es documental: crearlo o corregirlo NO aumenta PANEL_VERSION.
-->

# Z-Hub — Bitácora de continuidad v1.2

## 0. REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR Z-HUB

Estas reglas se heredan de `docs/CONTINUIDAD_Z-HUB.md` y son obligatorias para toda la serie 1.2.xx.

### Regla principal

**Antes de modificar Z-Hub, leer esta bitácora y revisar el estado real de `main` en `ronbercito/Z-Hub`.**

El repositorio principal y autoritativo es `ronbercito/Z-Hub`, rama `main`. `ronbercito/mirkohub` es legado/fallback y no debe usarse para desarrollo nuevo salvo rollback o emergencia expresamente documentada.

### Cierre obligatorio de cada cambio — prioridad máxima

**Un cambio NO está terminado, NO debe publicarse como finalizado y NO debe informarse al administrador como listo hasta actualizar la bitácora correspondiente.**

Orden obligatorio:

1. Identificar el propietario real del comportamiento y modificar solo los archivos necesarios.
2. Ejecutar pruebas razonables y registrar exactamente cuáles se realizaron y cuáles quedaron pendientes.
3. Si el cambio es funcional, actualizar `frontend/src/modules/system-update/version.js` y su `CHANGELOG`.
4. Actualizar esta bitácora en la misma entrega con versión, fecha, causa/objetivo, solución, archivos, compatibilidad, pruebas, resultado, riesgos y pendientes cuando corresponda.
5. Verificar en GitHub que código, versión y bitácora estén realmente en `main`.
6. Recién entonces comunicar que la actualización fue publicada.

Si se detecta un cambio funcional previo sin documentación, reconstruir primero su entrada usando el código, `version.js`, backups y commits reales antes de continuar.

### Regla de versiones

- Cambio funcional del panel → aumenta `PANEL_VERSION` y reemplaza `CHANGELOG` con **solo los cambios de esa versión**.
- Cambio únicamente documental en `docs/` → NO aumenta `PANEL_VERSION`.
- Numeración de esta serie: `1.2.00` … `1.2.99`; después continúa `1.3.00`.
- La fuente de verdad de la versión visible es `frontend/src/modules/system-update/version.js`.

### Regla NUEVA de orden de esta bitácora

**El historial de versiones se mantiene siempre en orden descendente. La versión más nueva debe quedar PRIMERA y las versiones anteriores deben desplazarse hacia abajo.**

Ejemplo:

```text
1.2.22  ← siempre arriba
1.2.21
1.2.20
...
1.2.01
1.2.00  ← siempre abajo
```

Al crear `1.2.22`, su entrada se inserta encima de `1.2.21`; **nunca se agrega una versión nueva al final del historial**.

### Regla de arquitectura

Seguir la cadena real del comportamiento:

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

No corregir lógica de negocio en `Layout` si pertenece a Clientes, Red, Facturación u otro módulo. No hacer cambios globales a ciegas.

### Reglas de seguridad y mantenimiento

Nunca:
- borrar la base de datos para arreglar una pantalla;
- eliminar datos reales para solucionar un error de UI;
- subir `backend/.env`, contraseñas, tokens o claves reales;
- ocultar errores de backend con cambios visuales;
- afirmar que una función está terminada sin probarla;
- activar módulos en revisión sin compilar/probar;
- cambiar `Layout` para resolver un defecto que pertenece a otro módulo;
- hacer una modificación funcional sin actualizar versión, changelog y bitácora.

Siempre:
- conservar datos existentes;
- validar frontend + API + backend según el alcance real;
- probar el flujo real después de desplegar cuando sea posible;
- registrar pruebas realizadas y pendientes sin inventarlas;
- mantener el changelog visible entendible para el administrador;
- dejar detalles técnicos internos en esta bitácora, no en el changelog visible;
- crear respaldo antes de modificar archivos críticos o delicados cuando el flujo lo permita.

---

# HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO

## 1.2.22 — 2026-09-09 — Nueva instalación junto a filtros y registros más legibles

- **Objetivo:** aprovechar el espacio libre de la franja superior de Instalaciones y dar más presencia visual a los datos registrados, siguiendo la ubicación marcada por el administrador.
- **Interfaz:** `Nueva instalación` deja el encabezado y se ubica en la misma fila de buscador y filtros de fecha, inmediatamente después del segundo selector de fecha.
- **Color:** el botón conserva la clase `installation-new-button` y su combinación azul/cian, con mayor peso, relleno y realce suave sin convertirlo en una acción excesivamente grande.
- **Legibilidad:** títulos, subtítulos, encabezados de tabla, datos de registros, estados y tarjetas pendientes usan mayor tamaño/peso tipográfico para que nombre, ubicación, fecha, teléfono y tecnología tengan más presencia.
- **Compatibilidad:** no se modifican filtros, consultas, API, base de datos, persistencia de instalaciones, `Dar de alta cliente`, Nuevo abonado, ficha del cliente, facturación ni aprovisionamiento.
- **Archivo funcional:** `frontend/src/modules/clientes/instalaciones/Installations.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` actualizado a 1.2.22 con changelog exclusivo de esta versión.
- **Backups:** `Installations.jsx` y `version.js` de 1.2.21 guardados en `docs/backups/1.2.21/` antes de modificar.
- **Pruebas realizadas:** revisión estática del JSX, posición del botón, clases responsive, preservación de handlers, filtros, tabla, tarjetas pendientes y puente `zhub_installation_draft`.
- **Pruebas pendientes:** build React y validación visual real después de instalar 1.2.22 en el servidor.
- **Resultado:** cambio visual publicado en `main`; no altera lógica funcional ni datos.
- **Commits:** backup `15d07518c704992fb37bbfb794522f13c88f51cd` y `120ff51702cfb809246a7fb5f6aa4b682a73e2fa`; UI `32ae07c9b6f95e74c05ad869406f334e92c74ea2`; versión `813828cf2abce29742c6ce8bbb186342ed98c774`.

## 1.2.21 — 2026-09-09 — Progreso visual continuo del actualizador

- **Actualizaciones:** el porcentaje visible avanza de 1% en 1% en lugar de saltar directamente entre hitos como 20% y 70%.
- **Progreso:** mientras una etapa tarda, el indicador continúa avanzando gradualmente hasta 99% para mostrar actividad.
- **Finalización segura:** 100% solo aparece cuando el backend confirma éxito y la versión instalada coincide con la versión objetivo.
- **Interfaz:** la barra acompaña el porcentaje continuo y muestra un mensaje de procesamiento durante la actualización.
- **Compatibilidad:** no modifica backend, base de datos, Clientes, Instalaciones, facturación ni aprovisionamiento.
- **Seguridad:** respaldo de `UpdateCenter.jsx` y `version.js` de 1.2.20 en `docs/backups/1.2.20/`.
- **Archivo funcional:** `frontend/src/modules/system-update/UpdateCenter.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js`.

## 1.2.20 — 2026-09-09 — Control de Clientes y simplificación de acciones

- **Clientes:** el encabezado del módulo muestra `Control de Clientes`.
- **Alta:** se retiró `Nuevo Abonado` de la vista principal; el alta oficial continúa desde Instalaciones mediante `Dar de alta cliente`.
- **Tabla:** se retiró el botón de edición con icono de lápiz.
- **Tema claro:** encabezado, filtros, tabla y acciones reciben mayor contraste sin modificar el tema oscuro.
- **Compatibilidad:** no modifica `ClientRegistrationWizard`, ficha del cliente, backend, base de datos, facturación ni aprovisionamiento.
- **Seguridad:** respaldo de `Clients.jsx` y `version.js` de 1.2.19 en `docs/backups/1.2.19/`.

## 1.2.19 — 2026-09-09 — Ubicación mediante minimapa de Google Maps

- **Instalaciones:** Nueva instalación reutiliza el mismo minimapa de Google Maps empleado por Z-Hub.
- **Ubicación:** el operador puede hacer clic en el mapa o arrastrar el marcador y aplicar latitud/longitud al registro.
- **Compatibilidad:** se elimina la dependencia del permiso GPS del navegador para este flujo; no modifica Nuevo abonado, ficha, facturación ni aprovisionamiento.
- **Seguridad:** respaldo de `NewInstallationModal.jsx` y `version.js` de 1.2.18 en `docs/backups/1.2.18/`.

## 1.2.18 — 2026-09-09 — Cierre más resistente del instalador

- **Actualización:** la comprobación final del backend reintenta hasta 10 veces en vez de abortar por un único fallo transitorio.
- **Diagnóstico:** si el backend no responde, el instalador muestra estado de Supervisor y últimas líneas del log de error para identificar la causa.
- **Compatibilidad:** no modifica Instalaciones, Abonados, base de datos, facturación ni aprovisionamiento; cambio limitado al cierre del instalador.

## 1.2.17 — 2026-09-09 — Registro persistente de instalaciones y alta posterior

- **Objetivo:** separar registro inicial de instalación y alta definitiva del abonado sin cambiar el asistente oficial.
- **Registro:** `Registrar instalación` guarda la solicitud pendiente en Z-Hub.
- **Persistencia:** nueva tabla `installations` y API `/api/installations`.
- **Vista:** solicitudes pendientes en tarjetas con datos principales.
- **Alta:** `Dar de alta cliente` transfiere datos al formulario oficial mediante `zhub_installation_draft`.
- **Continuidad:** cancelar el alta no borra la solicitud; deja de mostrarse pendiente cuando existe el abonado correspondiente.
- **Archivos nuevos:** `backend/app/models/installation.py`, `backend/app/routers/clientes/installations.py`.
- **Archivos principales modificados:** modal/listado de Instalaciones, registro de modelos, `backend/server.py` y `version.js`.
- **Base de datos:** `init_db()` registra el modelo y `Base.metadata.create_all` crea la nueva tabla sin reemplazar `clients`.
- **Permisos:** autenticación normal y permiso existente de `clients`.
- **Backup:** originales de 1.2.16 en `docs/backups/1.2.16/`.
- **Pruebas registradas:** revisión estática React → API → SQLAlchemy y puente a Nuevo abonado. Pruebas operativas reales quedaron pendientes en esa entrega.

## 1.2.16 — 2026-09-09 — Ventana de instalación sin cubrir la pantalla

- Se elimina la capa opaca y el desenfoque que cubrían Instalaciones al abrir Nueva instalación.
- El formulario permanece como ventana emergente centrada y el módulo sigue visible alrededor en tema claro y oscuro.

## 1.2.15 — 2026-09-09 — Flujo de preinscripción desde Instalaciones

- `Nueva instalación` abre un registro inicial.
- Solicita nombre, DNI/RUC, dirección, celular, correo, referencia, coordenadas, fecha y tecnología.
- En esta versión los datos se transferían temporalmente al asistente oficial de Nuevo abonado sin crear un registro incompleto.
- La transferencia se realizaba mediante la sesión del navegador; este diseño fue sustituido por persistencia real en 1.2.17.

## 1.2.14 — 2026-09-09 — Botón Nueva instalación adaptado al tema

- `Nueva instalación` se mueve al lado izquierdo, debajo del título y descripción.
- Clase propia: degradado cian/azul en oscuro y azul sólido con texto blanco en Claro Suave.
- No modifica filtros, listado ni datos.

## 1.2.13 — 2026-09-09 — Recarga segura al terminar actualización

- El panel deja de cerrar sesión al finalizar una actualización.
- Solo recarga cuando el servidor informa éxito y la versión instalada coincide con la versión objetivo.
- Usa marcador de actualización en URL para solicitar recursos nuevos conservando sesión y credenciales.

## 1.2.12 — 2026-09-09 — Tema claro para Instalaciones

- Panel, tabla, controles y estado vacío dejan de heredar tonos oscuros.
- Tema claro usa fondo blanco, bordes azul grisáceo y textos de alto contraste.
- Tema oscuro y lógica de datos permanecen sin cambios.

## 1.2.11 — 2026-09-09 — Submódulo Instalaciones

- Se agrega `Clientes → Instalaciones` con el permiso existente de Clientes.
- Pantalla inicial con listado, buscador, filtros de fechas, tecnología, estado y acción Nueva instalación.
- En esta versión consultaba el listado existente de clientes sin modificar registros ni provisión.

## 1.2.10 — 2026-09-09 — Identificación centrada en el pie

- `Panel Z-Hub · vX` se centra en el pie con mayor tamaño y peso seminegrita.
- Se mejora contraste en tema claro conservando versión dinámica y tema oscuro.

## 1.2.09 — 2026-09-09 — Pie y fondo del tema claro

- Contenedor principal y pie reciben clases propias para no heredar fondo oscuro.
- Tema claro usa `#edf2f7`, borde suave y texto legible.
- No modifica tema oscuro ni lógica del panel.

## 1.2.08 — 2026-09-09 — Planes agrupados y velocidades visibles

- Planes organizados en secciones: Fibra Óptica, Radioenlace y Hotspot.
- El cuadro de velocidades recibe clases propias y mayor contraste para Bajada/Subida.
- Editar/eliminar y datos almacenados permanecen sin cambios.

## 1.2.07 — 2026-09-09 — Tarjetas de planes compactas

- Tarjetas reducidas aproximadamente 30%, con ancho 260–290 px y espaciados/tipografías compactos.
- Fibra azul, Radioenlace violeta y Hotspot ámbar con prioridad suficiente también en tema claro.
- No cambia datos ni acciones de planes.

## 1.2.06 — 2026-09-09 — Tarjetas de planes por tecnología

- Cuadrícula responsive uniforme.
- Fibra Óptica GPON azul, Radioenlace violeta y Hotspot ámbar según tecnología seleccionada.
- Se conservan velocidades, precios y acciones editar/eliminar.

## 1.2.05 — 2026-09-09 — Zonas pasa a Gestión de Red

- Se mueve `Zonas` desde Clientes hacia Gestión de Red.
- Se conserva identificador `client_zones`, permisos y pantalla; solo cambia ubicación visual.

## 1.2.04 — 2026-09-09 — Buscador de PPPoE secrets

- Buscador compacto en PPPoE secrets.
- Filtra por usuario, perfil, IP remota o comentario e indica coincidencias.
- No altera secretos, estados, acciones ni agrega consultas al MikroTik.

## 1.2.03 — 2026-09-09 — Buscador de Colas simples

- Buscador compacto en Colas simples.
- Filtra localmente por nombre, comentario o IP/target y muestra coincidencias.
- No agrega consultas ni modifica colas MikroTik.

## 1.2.02 — 2026-09-09 — Queue type visible en Colas simples

- Columna `Queue type` junto a Max-limit con valor real de RouterOS.
- Tipos PCQ quedan identificados; si no existe valor se muestra `default`.

## 1.2.01 — 2026-09-09 — Comentario primero en Colas simples

- Primera columna: Comentario; después Nombre, Target, Max-limit, Tráfico actual y Estado.
- Anchos redistribuidos manteniendo la tabla dentro de pantalla.

## 1.2.00 — 2026-09-09 — Límites de velocidad legibles en Colas simples

- Max-limit convierte valores técnicos de RouterOS a Mbps/Gbps en orden Subida/Bajada.
- `0/0` se muestra como `Sin límite` y se conserva el valor completo en el título.

---

## Plantilla obligatoria para la próxima versión 1.2.xx

> **IMPORTANTE:** insertar la nueva entrada inmediatamente debajo de `HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO`, nunca al final.

```text
## 1.2.XX — AAAA-MM-DD — Título

- Objetivo/Causa: ...
- Solución: ...
- Archivos modificados: ...
- Compatibilidad/Base de datos/Integraciones: ...
- Backups: ...
- Pruebas realizadas: ...
- Pruebas pendientes: ...
- Resultado: ...
- Riesgos/Pendientes: ...
- Commit(s): ...
```

## Estado documental

- Serie cubierta: **1.2.00 → 1.2.22**.
- Orden: **descendente, versión más reciente primero**.
- Próxima entrada, si la siguiente versión es 1.2.23: debe insertarse **encima de 1.2.22**.
- Esta actualización documental acompaña la versión funcional 1.2.22 y no agrega una versión adicional por sí sola.
