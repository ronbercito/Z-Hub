<!--
ARCHIVO INTERNO DE CONTINUIDAD — NO ES PARTE DEL PANEL
Archivo: docs/CONTINUIDAD_Z-HUB-v1.2.md
Serie: Z-Hub 1.2.xx
Propósito: conservar reglas prioritarias y el historial técnico de la serie 1.2.xx.

IMPORTANTE:
- No importar este archivo desde React, FastAPI, Nginx ni ningún bundle/build.
- No colocar contraseñas, tokens, claves privadas, .env ni datos sensibles.
- Este archivo es documental; una corrección solo documental NO aumenta PANEL_VERSION.
-->

# Z-Hub — Bitácora de continuidad v1.2

## 0. REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR Z-HUB

Estas reglas se heredan de `docs/CONTINUIDAD_Z-HUB.md` y son obligatorias para toda la serie 1.2.xx.

### Regla principal

**Antes de modificar Z-Hub, leer esta bitácora y revisar el estado real de `main` en `ronbercito/Z-Hub`.**

- Repositorio principal y autoritativo: `ronbercito/Z-Hub`.
- Rama de publicación: `main`.
- `ronbercito/mirkohub` es legado/fallback y no debe utilizarse para desarrollo nuevo salvo rollback o emergencia documentada.

### Cierre obligatorio de cada cambio — prioridad máxima

**Un cambio NO está terminado, NO debe declararse finalizado y NO debe informarse como listo hasta cumplir el cierre documental.**

Orden obligatorio:

1. Identificar el propietario real del comportamiento y modificar solo los archivos necesarios.
2. Ejecutar pruebas razonables y registrar exactamente qué se probó y qué quedó pendiente.
3. Si el cambio es funcional, actualizar `frontend/src/modules/system-update/version.js` y reemplazar su `CHANGELOG` con únicamente los cambios de esa versión.
4. Actualizar esta bitácora en la misma entrega con versión, fecha, objetivo/causa, solución, archivos, compatibilidad, pruebas, resultado, riesgos y pendientes.
5. Verificar en GitHub que código, versión y bitácora estén realmente en `main`.
6. Recién entonces comunicar que la actualización fue publicada.

Si aparece un cambio funcional previo sin documentación, reconstruir primero su entrada usando código, `version.js`, backups y commits reales.

### Regla de versiones

- Cambio funcional → aumenta `PANEL_VERSION`.
- Cambio solo documental → NO aumenta `PANEL_VERSION`.
- Serie actual: `1.2.00` a `1.2.99`; después continúa `1.3.00`.
- Fuente de verdad: `frontend/src/modules/system-update/version.js`.

### Regla de orden de esta bitácora

**La versión más nueva siempre debe quedar PRIMERA. Las versiones inferiores quedan debajo.**

Ejemplo:

```text
1.2.24  ← nueva, siempre arriba
1.2.23
1.2.22
...
1.2.01
1.2.00  ← más antigua, abajo
```

Nunca agregar una nueva versión al final del historial.

### Regla de arquitectura

Seguir siempre el propietario real del comportamiento:

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

No corregir en Layout un defecto que pertenece a Clientes, Red, Facturación u otro módulo. No realizar cambios globales a ciegas.

### Seguridad y mantenimiento

Nunca:
- borrar la base de datos para corregir una pantalla;
- eliminar datos reales por un defecto de UI;
- subir `.env`, contraseñas, tokens o claves reales;
- ocultar errores de backend con cambios visuales;
- afirmar que una función fue probada si no se probó;
- cambiar un módulo ajeno para resolver un defecto local;
- realizar una modificación funcional sin versión, changelog y bitácora.

Siempre:
- conservar datos existentes;
- mantener compatibilidad con la operación actual;
- validar frontend/API/backend según el alcance real;
- registrar pruebas realizadas y pendientes sin inventarlas;
- crear respaldo antes de modificar archivos críticos o delicados cuando sea posible;
- mantener el changelog visible breve y los detalles técnicos en esta bitácora.

---

# HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO

## 1.2.23 — 2026-09-09 — Pestañas Instalaciones y Registrados

- **Objetivo:** separar visualmente el trabajo pendiente de instalación de los clientes cuyo alta ya terminó correctamente, siguiendo el diseño aprobado por el administrador.
- **Interfaz:** se agregan dos pestañas superiores: `Instalaciones` y `Registrados`, cada una con su contador.
- **Instalaciones:** muestra únicamente solicitudes pendientes de alta. Conserva búsqueda, filtros de fecha, `Nueva instalación`, tarjetas de solicitud y `Dar de alta cliente`.
- **Registrados:** muestra los clientes que ya existen en el módulo oficial de Clientes, con búsqueda, filtros, datos principales y badge `REGISTRADO`.
- **Paso automático:** cuando una solicitud pendiente encuentra un cliente creado con el mismo DNI/RUC, la lógica existente elimina la solicitud pendiente de `/api/installations`; el cliente permanece disponible en `Registrados` porque ya existe en `/api/clients`.
- **Alta oficial preservada:** `Dar de alta cliente` continúa usando `zhub_installation_draft` para transferir los datos al asistente oficial. No se modifican las opciones del formulario Nuevo abonado.
- **Diseño:** encabezado en tarjeta, pestaña activa azul/cian, pestaña inactiva sobria, conteos visibles, controles agrupados y estados más claros.
- **Archivo funcional:** `frontend/src/modules/clientes/instalaciones/Installations.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` → `1.2.23`.
- **Backend/Base de datos:** sin cambios; se reutilizan `/api/installations`, `/api/clients` y la tabla `installations` existentes.
- **Compatibilidad:** no se modifican `NewInstallationModal`, `Clients.jsx`, `ClientRegistrationWizard`, ficha del cliente, facturación, MikroTik, NAP, planes ni aprovisionamiento.
- **Backups:** `Installations.jsx` y `version.js` de 1.2.22 guardados en `docs/backups/1.2.22/` antes de modificar.
- **Pruebas realizadas:** revisión estática del JSX, estados de pestaña, filtros, conteos, render condicional, preservación de handlers, flujo `Dar de alta cliente` y cierre automático por DNI/RUC.
- **Pruebas pendientes:** build React y validación visual/funcional real después de instalar 1.2.23 en el servidor.
- **Resultado:** código publicado en `main`; validación real en servidor pendiente.
- **Commits principales:** backup `4035e501c39be1bb03c6122f058e7319ed4b77bc`, backup versión `151cdddb60b2f2d295f8e19cc627f80a7955a797`, interfaz `2d3ca94cac10e13afb1a7018ecedc0cb933d7283`, versión `1bfa47cc6c0580ddc4bf49a7285eec55f9b423fd`.

## 1.2.22 — 2026-09-09 — Nueva instalación junto a filtros y registros más legibles

- `Nueva instalación` se mueve a la misma fila de buscador y filtros de fecha.
- Botón con mayor presencia visual azul/cian.
- Títulos, encabezados y datos de registros ganan tamaño y peso tipográfico.
- Sin cambios en API, base de datos, alta, ficha, facturación ni aprovisionamiento.
- Backups de 1.2.21 en `docs/backups/1.2.21/`.

## 1.2.21 — 2026-09-09 — Progreso visual continuo del actualizador

- Porcentaje visible avanza de 1% en 1%.
- Mientras una etapa tarda puede avanzar gradualmente hasta 99%.
- 100% solo aparece cuando backend confirma éxito y versión objetivo instalada.
- Sin cambios en Clientes, Instalaciones, base de datos, facturación ni aprovisionamiento.
- Backup en `docs/backups/1.2.20/`.

## 1.2.20 — 2026-09-09 — Control de Clientes y simplificación de acciones

- Encabezado cambiado a `Control de Clientes`.
- Retirado botón `Nuevo Abonado` de la vista principal.
- Retirado botón de edición con lápiz de la tabla.
- Tema claro con más contraste y color.
- Alta oficial continúa desde Instalaciones → `Dar de alta cliente`.
- No se modifican asistente oficial, ficha, backend, DB, facturación ni aprovisionamiento.

## 1.2.19 — 2026-09-09 — Ubicación mediante minimapa de Google Maps

- Nueva instalación reutiliza `CoordinatesPicker`.
- Clic/arrastre del marcador completa latitud y longitud.
- Se elimina la dependencia del permiso GPS del navegador para este flujo.
- No modifica Nuevo abonado ni ficha.

## 1.2.18 — 2026-09-09 — Cierre más resistente del instalador

- Comprobación final del backend reintenta hasta 10 veces.
- Si falla, muestra estado de Supervisor y log del backend.
- Cambio limitado al cierre del instalador.

## 1.2.17 — 2026-09-09 — Registro persistente de instalaciones y alta posterior

- Separación entre solicitud de instalación y alta definitiva.
- Nueva tabla `installations` y API `/api/installations`.
- Solicitudes pendientes en tarjetas.
- `Dar de alta cliente` transfiere datos mediante `zhub_installation_draft`.
- Cancelar el alta no elimina la solicitud.
- Cuando ya existe cliente con mismo DNI/RUC, la solicitud deja de aparecer pendiente.
- No se modifican las opciones oficiales de Nuevo abonado.
- Backups de 1.2.16 en `docs/backups/1.2.16/`.

## 1.2.16 — 2026-09-09 — Ventana de instalación sin cubrir la pantalla

- Se elimina overlay opaco/desenfoque de Nueva instalación.
- El formulario permanece centrado y el módulo visible alrededor.

## 1.2.15 — 2026-09-09 — Flujo de preinscripción desde Instalaciones

- `Nueva instalación` captura datos iniciales.
- Transferencia temporal al asistente oficial de Nuevo abonado.
- Este diseño temporal fue sustituido por persistencia real en 1.2.17.

## 1.2.14 — 2026-09-09 — Botón Nueva instalación adaptado al tema

- Botón ubicado debajo del título en esa versión.
- Clase visual propia azul/cian.
- Sin cambios de datos.

## 1.2.13 — 2026-09-09 — Recarga segura al terminar actualización

- Ya no cierra sesión al terminar una actualización.
- Recarga únicamente después de éxito confirmado y coincidencia de versión.

## 1.2.12 — 2026-09-09 — Tema claro para Instalaciones

- Panel, tabla y controles dejan de heredar tonos oscuros.
- Fondo claro y textos de mayor contraste.

## 1.2.11 — 2026-09-09 — Submódulo Instalaciones

- Se agrega `Clientes → Instalaciones`.
- Listado, búsqueda, filtros y acceso a Nueva instalación.

## 1.2.10 — 2026-09-09 — Identificación centrada en el pie

- `Panel Z-Hub · vX` centrado en footer.
- Mejor contraste en tema claro.

## 1.2.09 — 2026-09-09 — Pie y fondo del tema claro

- Contenedor principal y footer reciben estilo claro propio.
- Sin cambios funcionales.

## 1.2.08 — 2026-09-09 — Planes agrupados y velocidades visibles

- Planes separados por Fibra, Radioenlace y Hotspot.
- Mejor contraste para velocidades Bajada/Subida.

## 1.2.07 — 2026-09-09 — Tarjetas de planes compactas

- Tarjetas reducidas aproximadamente 30%.
- Fibra azul, Radioenlace violeta, Hotspot ámbar.

## 1.2.06 — 2026-09-09 — Tarjetas de planes por tecnología

- Cuadrícula responsive.
- Color automático según tecnología.

## 1.2.05 — 2026-09-09 — Zonas pasa a Gestión de Red

- `Zonas` se mueve de Clientes a Gestión de Red.
- Se conserva permiso e identificador `client_zones`.

## 1.2.04 — 2026-09-09 — Buscador de PPPoE secrets

- Filtro local por usuario, perfil, IP remota o comentario.
- No modifica secretos MikroTik.

## 1.2.03 — 2026-09-09 — Buscador de Colas simples

- Filtro por nombre, comentario o IP/target.
- No modifica colas MikroTik.

## 1.2.02 — 2026-09-09 — Queue type visible en Colas simples

- Nueva columna `Queue type` usando valor real de RouterOS.

## 1.2.01 — 2026-09-09 — Comentario primero en Colas simples

- Columna Comentario pasa a primera posición.
- Redistribución de anchos.

## 1.2.00 — 2026-09-09 — Límites de velocidad legibles en Colas simples

- Max-limit convertido a Mbps/Gbps.
- `0/0` se muestra como `Sin límite`.

---

## Plantilla obligatoria para la próxima versión 1.2.xx

> Insertar siempre la nueva entrada inmediatamente debajo de `HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO`.

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

- Serie cubierta: **1.2.00 → 1.2.23**.
- Orden: **descendente, versión más reciente primero**.
- Próxima entrada: si corresponde `1.2.24`, debe insertarse **encima de 1.2.23**.
