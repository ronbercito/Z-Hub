<!--
ARCHIVO INTERNO DE CONTINUIDAD — NO ES PARTE DEL PANEL
Archivo: docs/CONTINUIDAD_MIKROHUB.md
Propósito: conservar el contexto técnico, decisiones, ubicaciones, versiones y
historial de cambios de MikroHub para retomar el proyecto en futuras sesiones.

IMPORTANTE:
- Esta carpeta docs/ es documentación del repositorio; no es frontend/src/ ni
  backend/app/ y no debe copiarse al directorio público del panel.
- No importar este archivo desde React, FastAPI, Nginx ni ningún bundle/build.
- No colocar aquí contraseñas, tokens, claves privadas, .env ni datos sensibles.
- Cada cambio funcional futuro debe actualizar esta bitácora en el mismo commit
  o entrega de la funcionalidad.
-->

# MikroHub — Bitácora maestra de continuidad

## 0. Regla principal para futuras sesiones

**Antes de modificar MikroHub, leer este archivo completo y revisar el estado real de `main`.**

Este documento es la memoria técnica del proyecto. Su objetivo es que una nueva ventana de ChatGPT/Copilot pueda saber:

- qué se hizo;
- qué versión del panel corresponde a cada cambio;
- dónde está cada funcionalidad;
- qué archivos son responsables de cada comportamiento;
- qué problemas ya fueron corregidos;
- qué restricciones deben respetarse;
- qué queda pendiente;
- cómo continuar sin repetir errores ni borrar datos existentes.

### Regla de actualización de esta bitácora

### Cierre obligatorio de cada cambio (prioridad máxima)

**Un cambio NO está terminado, NO se debe publicar como finalizado y NO se debe informar al administrador como listo hasta que esta bitácora haya sido actualizada.** Esta regla aplica a correcciones, nuevas funciones, cambios visuales, cambios de arquitectura, versiones, despliegues y reversiones.

Orden obligatorio de trabajo:

1. Identificar el propietario real del comportamiento y modificar solo los archivos necesarios.
2. Ejecutar las pruebas razonables del cambio y anotar exactamente cuáles se realizaron y cuáles no.
3. Si es funcional, actualizar frontend/src/modules/system-update/version.js y su CHANGELOG.
4. Actualizar **en la misma entrega** este archivo docs/CONTINUIDAD_MIKROHUB.md con fecha, versión, causa, solución, archivos, flujo, pruebas, resultado, riesgos y pendientes.
5. Verificar en GitHub que tanto el cambio como la bitácora estén realmente en main.
6. Recién entonces comunicar que la actualización fue publicada.

Si se detecta un cambio previo sin documentación, la primera tarea será reconstruirla desde los commits y archivos reales antes de continuar con nuevas funciones.

Cada vez que se **agregue, modifique o corrija** algo en MikroHub:

1. Actualizar esta bitácora.
2. Registrar fecha y una **revisión interna de continuidad**.
3. Registrar la **versión del panel** afectada si el cambio es funcional.
4. Registrar archivos modificados y su función.
5. Registrar qué recibe cada cambio y qué entrega.
6. Registrar pruebas realizadas y resultado.
7. Registrar pendientes o riesgos descubiertos.
8. Publicar la actualización de la bitácora en `main` junto con el cambio cuando sea posible.

**Importante sobre versiones:**
- Cambio funcional del panel → debe aumentar `PANEL_VERSION` y actualizar `CHANGELOG`.
- Cambio solo documental de `docs/` → aumenta la revisión interna de esta bitácora, pero **NO** debe aumentar `PANEL_VERSION`, porque no es una actualización del panel.

---

## 1. Identidad del proyecto

- Repositorio: `ronbercito/mirkohub`
- Rama de publicación: `main`
- Nombre del sistema: **MikroHub**
- Tipo: panel de operaciones para ISP.
- Frontend: React.
- Backend: FastAPI/Python.
- Persistencia: SQLAlchemy/base de datos configurada por el proyecto.
- Integraciones principales: MikroTik, OLT y Google Maps, según módulo.
- Fuente de versión visible: `frontend/src/modules/system-update/version.js`.
- Versión funcional actual: **1.0.95**, en validación posterior a la refactorización de Facturación del cliente.

---

## 2. Mapa rápido del proyecto

### Frontend

Ruta base: `frontend/src/`

| Ruta | Función |
|---|---|
| `modules/auth/` | Login, sesión, token y acceso. |
| `modules/inicio/` | Dashboard/resumen. |
| `modules/clientes/` | Clientes, ficha, servicios y operaciones relacionadas. |
| `modules/planes/` | Planes y tarifas. |
| `modules/facturacion/` | Facturas, pagos, configuración y acciones de facturación. |
| `modules/tickets/` | Soporte/incidencias. |
| `modules/mensajeria/` | Mensajería/notificaciones. |
| `modules/red/` | Routers, OLT, IPv4, NAP, zonas y monitoreo. |
| `modules/hotspot/` | Hotspot. |
| `modules/almacen/` | Inventario. |
| `modules/tareas/` | Tareas operativas. |
| `modules/ajustes/` | Configuración general, SMTP, Maps y restricciones. |
| `modules/system-update/` | Versión, changelog y centro de actualizaciones. |
| `components/layout/` | Navegación, menú, pie y estructura general. |
| `components/ui/` | Componentes visuales reutilizables. |
| `context/` | Estado transversal. |

### Backend

Ruta base: `backend/app/`

| Ruta | Función |
|---|---|
| `core/` | Configuración, seguridad, JWT, dependencias y DB. |
| `models/` | Modelos ORM y relaciones. |
| `routers/` | API por dominio. |
| `modules/` | Módulos aislados, incluido system update y workspace. |
| `integrations/` | Integraciones externas como MikroTik/OLT. |
| `server.py` | Punto de entrada y registro de routers. |

### Despliegue

- `setup_debian.sh`: sincronización/actualización del servidor.
- `deploy/setup_debian.sh`: dependencias, build frontend y publicación.
- `deploy/nginx/mikrosmart.conf.template`: Nginx/frontend/API.
- `/var/www/mikrosmart_web`: ubicación conocida del build estático en servidor.

---

## 3. Regla de arquitectura

Para localizar cualquier error seguir esta cadena:

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

No corregir un problema de negocio en Layout si pertenece a Clientes, Red o Facturación.

Antes de cambiar un archivo, identificar el **dueño real del comportamiento**.

No hacer cambios globales a ciegas.

---

## 4. Facturación — estado actual

### Frontend principal

`frontend/src/modules/facturacion/Billing.jsx`

Responsabilidad actual:

- pestaña global de Facturas;
- configuración de facturación;
- generación masiva/manual según las funciones existentes;
- pagos;
- cortes;
- acciones por factura.

En la versión **1.0.63**, cada factura tiene acciones independientes:

- **Editar**;
- **Ver documento**;
- **Eliminar**;
- **Anular**;
- **Enviar**;
- **Pagar** cuando corresponde.

La acción **Enviar** abre una ventana pequeña con:

- Correo;
- WhatsApp.

Actualmente estas opciones preparan el envío mediante `mailto:` y `wa.me`. No existe todavía un proveedor servidor de SMTP/WhatsApp Business implementado específicamente para el envío automático de estas facturas.

### Backend de acciones

`backend/app/routers/facturacion/invoice_actions.py`

Endpoints implementados:

```text
PUT  /api/invoices/{invoice_id}
DELETE /api/invoices/{invoice_id}/permanent
POST /api/invoices/{invoice_id}/annul
GET  /api/invoices/{invoice_id}/pdf
POST /api/invoices/{invoice_id}/send?channel=email|whatsapp
```

`backend/server.py` registra el router de acciones de facturas con el permiso de billing.

### Protección de facturas

Regla actual:

- Factura pagada → no editar, no eliminar desde servicio, no anular.
- Factura con pagos registrados → protegida contra acciones destructivas.
- Factura pendiente → puede editarse/eliminarse/anularse según la acción.
- Factura anulada → no debe volver a tratarse como factura activa.

### Documento/PDF — pendiente técnico

El endpoint actual llamado `/pdf` genera un **documento HTML imprimible**, que el navegador puede imprimir/guardar como PDF.

**No es todavía un PDF binario real.**

Si en el futuro se exige un PDF real descargable/visualizable como archivo PDF, implementar generación binaria en backend y cambiar el endpoint para devolver `application/pdf`.

No declarar esa tarea como terminada hasta probar el archivo PDF real.

---

## 5. Clientes y servicios — estado actual

### Servicios

El servicio principal permanece asociado al cliente.

Los servicios adicionales se almacenan en:

`client_services`

Backend principal:

`backend/app/routers/clientes/services.py`

Funciones existentes incluyen listado, creación, actualización, eliminación, estado ONU y aprovisionamiento.

### Facturación por servicio

El modelo de factura utiliza:

- `service_id`;
- `service_label`;
- `service_type`.

La identificación persistida del servicio permite reconocer a qué servicio/cuenta corresponde una factura incluso si posteriormente se elimina el servicio adicional.

Formato usado para identificación:

```text
Servicio 1 · Principal · PLAN
Servicio 2 · Adicional · PLAN
Servicio 3 · Adicional · PLAN
```

El historial de una factura pagada no debe perder su identificación por depender exclusivamente de la fila del servicio que después pudo eliminarse.

### Eliminación de servicio adicional

Si el servicio tiene facturas pendientes:

1. Backend responde con `409 PENDING_INVOICES`.
2. Frontend muestra advertencia.
3. La advertencia informa que también existen facturas pendientes asociadas.
4. Solo con confirmación explícita se eliminan servicio + facturas pendientes.
5. Facturas pagadas no deben borrarse mediante esta operación.

Frontend relacionado:

`frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`

### Eliminación completa del cliente

Al eliminar el cliente completo, la lógica implementada limpia los registros asociados solicitados, incluyendo:

- facturas;
- servicios;
- tickets;
- tareas;
- comunicaciones;
- documentos;
- historial/actividad asociado.

Esto es una excepción deliberada a la protección de facturas pagadas: **si el administrador elimina el cliente completo, se eliminan también sus facturas**, porque esa fue la regla funcional definida para la eliminación integral.

No borrar tablas ni datos masivamente para solucionar problemas visuales.

---

## 6. Red, IP, NAP y ONU — estado acumulado

### NAP

La disponibilidad debe considerar ocupación tanto del servicio principal como de servicios adicionales.

Archivo backend relevante:

`backend/app/routers/red/nap_boxes.py`

### IPv4

La disponibilidad considera ocupación de clientes y servicios adicionales y excluye direcciones no asignables según las reglas implementadas:

- dirección de red;
- gateway;
- broadcast.

Archivo relevante:

`backend/app/routers/red/ipv4_networks.py`

### MikroTik

La arquitectura de servicios adicionales permite provisionar/actualizar recursos MikroTik para PPPoE, estático/DHCP y manejar potencia óptica cuando corresponde.

### Colas

Reglas acumuladas:

- nombres basados en DNI;
- servicios adicionales usan nombres diferenciados como `svc-DNI`, `svc-DNI-2`, etc.;
- comentarios de recursos identifican cliente/plan/servicio;
- formato de comentarios:

```text
Servicio 1: NOMBRE | PLAN
Servicio 2: NOMBRE | PLAN | serv 2
Servicio 3: NOMBRE | PLAN | serv 3
```

El DNI se usa en el nombre de cola según las reglas implementadas.

### Sincronización de identidad

Archivo:

`backend/app/routers/clientes/identity_sync.py`

La actualización del resumen del cliente sincroniza nombre/DNI con recursos MikroTik existentes.

`backend/server.py` contiene middleware para esa sincronización cuando corresponde a un PATCH del resumen.

---

## 7. Cliente — mapa de archivos importantes

- `frontend/src/modules/clientes/Clients.jsx` → listado y apertura de ficha.
- `frontend/src/modules/clientes/ClientDetail.jsx` → ficha por pestañas.
- `frontend/src/modules/clientes/editor/ClientBilling.jsx` → wrapper estable y límite de error de Facturación.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` → controlador de estado, API y coordinación de Facturación.
- `frontend/src/modules/clientes/editor/billing/ClientBillingTable.jsx` → tabla y ordenamiento de facturas.
- `frontend/src/modules/clientes/editor/billing/ClientBillingFilters.jsx` → búsqueda y filtros.
- `frontend/src/modules/clientes/editor/billing/ClientBillingActions.jsx` → acciones superiores y por factura.
- `frontend/src/modules/clientes/editor/billing/clientBillingUtils.js` → configuración, fechas, clases y valores de ordenamiento.
- `frontend/src/modules/clientes/editor/billing/ClientBillingErrorBoundary.jsx` → aislamiento de errores de renderizado.
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx` → edición/eliminación de servicios.
- `frontend/src/modules/clientes/editor/CoordinatesPicker.jsx` → selector de coordenadas/mapa.
- `backend/app/routers/clientes/router.py` → API de clientes.
- `backend/app/routers/clientes/services.py` → servicios adicionales.
- `backend/app/routers/clientes/identity_sync.py` → sincronización de identidad con recursos existentes.

### Ubicación/mapa

`CoordinatesPicker.jsx` soporta selección de latitud/longitud, marcador, mapa Google, modo solo lectura, vista satélite/control de mapa y botón universal “Cómo llegar”.

---

## 8. Actualizaciones del panel

### Fuente de versión

`frontend/src/modules/system-update/version.js`

Versión funcional en esta entrega:

```text
PANEL_VERSION = 1.0.95
```

Este archivo es parte del panel y debe cambiarse cuando haya una nueva funcionalidad/corrección funcional.

### Centro de actualización

`frontend/src/modules/system-update/UpdateCenter.jsx`

### Backend

`backend/app/modules/system_update/router.py`

### Script

`backend/app/modules/system_update/run_update.sh`

### Flujo

```text
Comprobar
  ↓
git fetch origin main
  ↓
comparar HEAD vs origin/main
  ↓
mostrar versión/changelog
  ↓
Confirmar actualización
  ↓
run_update.sh
  ↓
setup_debian.sh
  ↓
build React
  ↓
publicar build
  ↓
reiniciar backend/Nginx
  ↓
100%
  ↓
cerrar sesión
```

### Regla crítica de actualización

No decir “actualización instalada” solamente porque Git avanzó.

Hay que verificar:

1. commit del servidor;
2. `PANEL_VERSION` en código;
3. build React publicado;
4. versión visible después de nuevo ingreso.

### Comandos de despliegue usados

```bash
cd /var/www/mikrohub
git fetch origin main
git checkout main
git reset --hard origin/main
bash setup_debian.sh
grep PANEL_VERSION frontend/src/modules/system-update/version.js
```

### Problema histórico de caché

Hubo una discrepancia donde Git/backend mostraban una versión nueva pero el pie del panel mostraba una versión anterior porque el navegador/build estático seguía sirviendo una versión vieja.

Para investigar:

```bash
cd /var/www/mikrohub
git rev-parse --short HEAD
grep PANEL_VERSION frontend/src/modules/system-update/version.js
grep -R "PANEL_VERSION" /var/www/mikrosmart_web/static/js 2>/dev/null | head
ls -la /var/www/mikrosmart_web
```

---

## 9. Historial de versiones y cambios importantes

> Este historial es resumido. La bitácora debe seguir agregando entradas, no reemplazar las anteriores.

### 1.0.23
- Selector de IP de servicio.
- Puertos libres de NAP.
- Potencia óptica en dBm.

### 1.0.25
- Criterios de disponibilidad IPv4.
- Exclusión de red/gateway/broadcast.
- Conteos consistentes.

### 1.0.26–1.0.27
- Reescritura de ClientDetail y schemas.
- Corrección de sintaxis Python inválida en schemas que impedía arranque/login del backend.

### 1.0.28
- Selector de coordenadas con Google Maps.
- Integración en ClientDetail.

### 1.0.29
- Centro de actualización detecta cualquier diferencia `HEAD != origin/main`, no solo cambios de `version.js`.

### 1.0.30
- Guardado de servicio cierra correctamente el editor.
- `ClientServiceEditor` acepta `onSave`/`onSaveSuccess`.

### 1.0.36–1.0.37
- Servicios adicionales provisionan/actualizan MikroTik.
- Manejo independiente de ONU/potencia.
- Limpieza de recursos MikroTik al eliminar cliente.
- Nombres de colas basados en DNI.

### 1.0.38–1.0.43
- Comentarios de recursos diferenciados por servicio.
- Sincronización de nombre/DNI con recursos MikroTik existentes.

### 1.0.52
- Facturación global con Facturas/Configuración.
- Factura manual.
- Pagos.
- Configuración de facturación.

### 1.0.58
- ClientBilling reestructurado con Facturas/Transacciones/Saldos/Configuración.
- Facturas relacionadas con `service_id`.
- Corrección posterior de JSX.

### 1.0.61
- Eliminación de servicio adicional con protección de facturas pendientes.
- Confirmación explícita antes de borrar servicio + facturas pendientes.
- Facturas pagadas protegidas.

### 1.0.62
- Eliminación completa del cliente limpia facturas, servicios, tickets, tareas, comunicaciones, documentos e historial asociado.
- Facturas conservan identificación del servicio mediante `service_label`/`service_type`.
- Migración conservadora de columnas sin borrar base de datos existente.

### 1.0.63
- Acciones por factura: editar, ver documento, eliminar, anular y enviar.
- Protección de facturas pagadas/con pagos.
- Ventana de envío con Correo o WhatsApp.
- Documento actual imprimible/guardable como PDF, todavía no PDF binario real.
- Envío actual mediante `mailto:` / `wa.me`.

### 1.0.85–1.0.90
- Correcciones y mejoras del flujo de eliminación de clientes.
- Fuente única de versión.
- Mejoras de feedback del Centro de Actualizaciones.
- Fecha de instalación preseleccionada en Nuevo Abonado.
- 1.0.90: feedback visual persistente al comprobar actualizaciones.

---

## 10. Problemas conocidos / pendientes

### P1 — PDF real
**Estado:** pendiente.

La ruta `/pdf` genera HTML imprimible. Si se requiere archivo PDF real, implementar generación PDF binaria y probar apertura/descarga.

### P2 — Envío automático real
**Estado:** pendiente.

Correo/WhatsApp actualmente abren los mecanismos del navegador. Para envío automático desde MikroHub habrá que definir e integrar proveedor y credenciales seguras.

### P3 — Email del cliente
**Estado:** revisar.

El flujo actual puede solicitar el correo al administrador.

### P4 — Búsqueda por servicio en Facturación
**Estado:** revisar.

Comprobar si el buscador backend también debe buscar por `service_label`.

### P5 — Documentos físicos
La eliminación de filas de `ClientDocument` no implica necesariamente eliminar archivos físicos almacenados en disco. Revisar de forma independiente y segura si se exige esa limpieza.

---

## 11. Reglas de seguridad y mantenimiento

Nunca:

- borrar la base de datos para arreglar una pantalla;
- eliminar datos reales para solucionar un error de UI;
- subir `backend/.env`;
- subir contraseñas, tokens o claves reales;
- ocultar errores de backend con cambios visuales;
- afirmar que una función está terminada sin probarla;
- activar módulos en revisión sin compilar/probar;
- cambiar Layout para resolver un defecto que pertenece a otro módulo;
- hacer una modificación funcional sin actualizar versión/changelog/bitácora.

Siempre:

- conservar datos existentes;
- validar frontend + API + backend;
- probar el flujo real después de desplegar;
- registrar la modificación en esta bitácora;
- mantener el changelog visible y entendible para el administrador;
- dejar detalles técnicos internos en esta bitácora, no en el changelog visible del panel.

---

## 12. Módulos en revisión especial

### Email/SMS de cliente

Hubo componentes experimentales que podían dejar React en blanco. Se desactivó su renderizado directo desde ClientDetail para mantener estable el panel.

No reactivar sin compilar frontend, abrir la ficha, entrar/salir de la pestaña, probar con cliente de prueba y revisar consola/backend.

### Documentos de cliente

Revisión aislada antes de reintegrar cambios.

---

## 13. Plantilla obligatoria para futuras entradas

```text
## [REVISION INTERNA] — [FECHA] — Panel [VERSION]

### Tipo
Nueva función / Corrección / Mejora / Seguridad / Documentación

### Resumen
Qué se hizo y por qué.

### Archivos modificados
- ruta/archivo — qué responsabilidad tiene y qué cambió.

### Flujo
Recibe de: ...
Entrega a: ...

### Base de datos
Tablas/campos afectados: ...
Migración requerida: sí/no

### Integraciones
MikroTik / OLT / Google Maps / correo / WhatsApp / ninguna

### Pruebas
- [ ] frontend compilado
- [ ] backend inicia
- [ ] API probada
- [ ] flujo funcional probado
- [ ] actualización/despliegue probado

### Resultado
Correcto / Pendiente / Requiere revisión

### Pendientes
- ...

### Commit
SHA: ...
```

---

## 14. Registro de continuidad — 2026-09-08 — Panel 1.0.91

**Tipo:** Arquitectura / aislamiento de Facturación.

**Resumen:** se creó un punto de entrada estable para `ClientBilling.jsx`, se trasladó la implementación al directorio `clientes/editor/billing/` y se agregó `ClientBillingErrorBoundary.jsx`. Se creó la rama `backup/pre-facturacion-aislada-2026-09-08` antes de la refactorización.

**Resultado:** la primera versión aislada requirió correcciones posteriores de JSX y ruta de `AuthContext`; el actualizador realizó rollback cuando el build falló. El flujo de rollback funcionó correctamente.

---

## 15. Registro de continuidad — 2026-09-08 — Panel 1.0.93

**Tipo:** Corrección de build.

**Causa:** al mover el módulo a `editor/billing/`, la ruta relativa de `AuthContext` dejó de resolver.

**Solución:** se corrigió la ruta del contexto manteniendo API, base de datos y lógica de negocio sin cambios.

**Resultado:** el usuario confirmó que la actualización posterior cargó normalmente y que Facturación abrió correctamente.

---

## 16. Registro de continuidad — 2026-09-08 — Panel 1.0.94

**Tipo:** Funcionalidad / ordenamiento.

**Resumen:** se agregó ordenamiento para Recibo, Servicio, Período, Monto, Vencimiento y Estado. Inicialmente se implementó como una capa independiente, pero se reemplaza en 1.0.95 por ordenamiento React dentro de la tabla para evitar manipulación directa del DOM.

**Resultado:** 1.0.94 fue validada visualmente en el panel antes de continuar con la refactorización completa.

---

## 17. Registro de continuidad — 2026-09-08 — Panel 1.0.95

**Tipo:** Arquitectura / mantenimiento / funcionalidad.

### Objetivo
Completar el aislamiento recomendado para que futuras modificaciones de Facturación tengan propietarios de código más pequeños y claros, manteniendo el resto de la ficha del cliente separado y protegido por `ErrorBoundary`.

### Estructura nueva

```text
frontend/src/modules/clientes/editor/
├── ClientDetail.jsx
├── ClientBilling.jsx                  ← wrapper estable + ErrorBoundary
└── billing/
    ├── ClientBilling.jsx              ← controlador/API/estado
    ├── ClientBillingTable.jsx         ← tabla + ordenamiento
    ├── ClientBillingFilters.jsx       ← búsqueda + filtros
    ├── ClientBillingActions.jsx       ← acciones superiores y por factura
    ├── clientBillingUtils.js          ← utilidades/configuración
    └── ClientBillingErrorBoundary.jsx ← aislamiento de errores de renderizado
```

### Archivos modificados

- `frontend/src/modules/clientes/editor/ClientBilling.jsx` — wrapper estable; ya no contiene lógica de negocio.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — controlador que coordina API, estado y formularios.
- `frontend/src/modules/clientes/editor/billing/ClientBillingTable.jsx` — tabla y ordenamiento React por las seis columnas solicitadas.
- `frontend/src/modules/clientes/editor/billing/ClientBillingFilters.jsx` — búsqueda y filtros Todos/Pagados/Pendientes/Vencidos.
- `frontend/src/modules/clientes/editor/billing/ClientBillingActions.jsx` — acciones Factura libre, Factura de servicios, Configuración y acciones por factura.
- `frontend/src/modules/clientes/editor/billing/clientBillingUtils.js` — configuración por defecto, fechas, clases y valores de ordenamiento.
- `frontend/src/modules/clientes/editor/billing/ClientBillingErrorBoundary.jsx` — límite de error de ejecución.
- `frontend/src/modules/clientes/editor/billing/ClientBillingSorting.jsx` — eliminado; su lógica fue reemplazada por ordenamiento React propio de `ClientBillingTable`.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.0.95 y CHANGELOG.

### Flujo

```text
ClientDetail
   ↓
ClientBilling wrapper
   ↓
ErrorBoundary
   ↓
billing/ClientBilling controlador
   ├── ClientBillingFilters
   ├── ClientBillingTable
   ├── ClientBillingActions
   └── clientBillingUtils
```

### Base de datos
Sin cambios.

### API
Sin cambios. Se conservan endpoints existentes para facturas, servicios, pagos, configuración, documento, eliminación, anulación y envío.

### Comportamiento
Se conserva la lógica existente de facturas, pagos, transacciones, saldos, configuración, edición, eliminación, anulación y envío.

### Ordenamiento
`ClientBillingTable` mantiene su propio estado de ordenamiento y ordena los objetos de factura antes de renderizar. Recibo, Servicio, Período, Monto, Vencimiento y Estado alternan ascendente/descendente. Acciones no es ordenable.

### Aislamiento
Los errores de renderizado de Facturación quedan contenidos por `ClientBillingErrorBoundary`. Esto no puede proteger errores de sintaxis/compilación, por lo que el build debe ejecutarse antes de desplegar.

### Pruebas
- [x] revisión de la implementación vigente antes de refactorizar;
- [x] separación de tabla, filtros, acciones y utilidades;
- [x] eliminación de la capa anterior de manipulación DOM;
- [x] revisión de rutas relativas del contexto;
- [ ] build React en servidor;
- [ ] prueba completa de Facturación después de instalar 1.0.95;
- [ ] prueba de las seis columnas en ascendente/descendente;
- [ ] prueba de otras pestañas de ClientDetail;
- [ ] verificación final de backend y Nginx.

### Riesgos / pendientes
- Un error de sintaxis/compilación todavía puede afectar el build React completo; el ErrorBoundary solo cubre errores de ejecución/renderizado.
- El backup `backup/pre-facturacion-aislada-2026-09-08` debe conservarse hasta completar la validación de 1.0.95.

### Commits de la entrega
- refactorización de utilidades, filtros, acciones y tabla: `7d470a55d9caf56b70aff029bfa03e2392872177`, `20ac89ae40f06c0408958363757ab547e14adb98`, `c41f60e86038299cf186fcba7d23513e6f6f7839`, `5cc8657ccbbaf7628c44b9148d6ea6356fa31e57`;
- controlador refactorizado: `c448983ee3283e7c8b897cf843e2e3fad0c72420`;
- wrapper estable: `2126582ede3ce749081280638b9da861dde22880`;
- eliminación del ordenamiento DOM: `d3b0b4bde86974421833354cc3548738365e18b1`;
- versión 1.0.95: `2af5da43628fbf335277246d7c5747fb05ad832a`.

### Estado
**Preparado para validación mediante el Actualizador del panel. No declarar final hasta que el build y el flujo real sean verificados.**
