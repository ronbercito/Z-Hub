<!--
ARCHIVO INTERNO DE CONTINUIDAD — NO ES PARTE DEL PANEL
Archivo: docs/CONTINUIDAD_Z-HUB.md
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

# Z-Hub — Bitácora maestra de continuidad

## 0. Regla principal para futuras sesiones

**Antes de modificar Z-Hub, leer este archivo completo y revisar el estado real de `main` en `ronbercito/Z-Hub`.**

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
4. Actualizar **en la misma entrega** este archivo docs/CONTINUIDAD_Z-HUB.md con fecha, versión, causa, solución, archivos, flujo, pruebas, resultado, riesgos y pendientes.
5. Verificar en GitHub que tanto el cambio como la bitácora estén realmente en main.
6. Recién entonces comunicar que la actualización fue publicada.

Si se detecta un cambio previo sin documentación, la primera tarea será reconstruirla desde los commits y archivos reales antes de continuar con nuevas funciones.

Cada vez que se **agregue, modifique o corrija** algo en Z-Hub:

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

- Repositorio principal desde 1.1.12: `ronbercito/Z-Hub`
- Repositorio legado / respaldo de actualización: `ronbercito/mirkohub`
- Rama de publicación: `main`
- Nombre público del sistema desde 1.1.10: **Z-Hub**
- Nombre/rutas técnicas heredadas: **MikroHub** (se conservan por compatibilidad)
- Tipo: panel de operaciones para ISP.
- Frontend: React.
- Backend: FastAPI/Python.
- Persistencia: SQLAlchemy/base de datos configurada por el proyecto.
- Integraciones principales: MikroTik, OLT y Google Maps, según módulo.
- Fuente de versión visible: `frontend/src/modules/system-update/version.js`.
- Versión funcional actual: **1.1.22**, correspondiente al hover transparente azul del menú lateral y submenús del template Z-Hub Claro. El repositorio principal y autoritativo es `ronbercito/Z-Hub`.

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
PANEL_VERSION = 1.1.22
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

---

## 18. Registro de continuidad — 2026-09-08 — Paneles 1.0.96 y 1.0.97

**Tipo:** Funcionalidad / corrección de Facturación → Saldos.

Se incorporó un libro mayor de movimientos firmados para registrar abonos positivos y deudas negativas, con aplicación automática a facturas futuras.

### Archivos principales

- `backend/app/models/client_balance.py` — modelo ORM de movimientos de saldo.
- `backend/app/routers/facturacion/balances.py` — motor de aplicación automática de crédito/deuda.
- `backend/app/routers/facturacion/client_balances.py` — API aislada de Saldos.
- `backend/app/routers/facturacion/router.py` — integración con facturas manuales/mensuales, pendiente y pagos parciales.
- `frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx` — interfaz aislada de Saldos.
- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — integración del submódulo.
- `frontend/src/modules/system-update/version.js` — versiones y changelog.

### Regla definitiva

- monto positivo = saldo a favor;
- monto negativo = deuda;
- el crédito positivo se aplica a la siguiente factura hasta cubrirla;
- el excedente queda disponible;
- la deuda negativa se suma completa a la siguiente factura, aunque supere el monto base;
- los movimientos de aplicación conservan factura origen/destino y trazabilidad.

### Corrección 1.0.97

Se corrigió el caso en que una deuda se limitaba al pendiente de la factura nueva. La regla correcta es:

```text
-100 + factura base 50 = factura final 150
```

La deuda completa se traslada y consume, sin limitarla al importe base.

### Validación pendiente

No se ha ejecutado `yarn build` ni una prueba contra la base de producción desde este entorno. Debe validarse en el panel:

```text
500 → factura 50 → factura final 50 → pagada → saldo 450
-100 → factura 50 → factura final 150 → deuda consumida 100
```

También revisar Facturas, Transacciones, Saldos, Configuración y las demás pestañas del cliente.

---

## 19. Registro de continuidad — 2026-09-08 — Panel 1.0.98

**Tipo:** Mejora visual / UX.

### Objetivo
Hacer más visible la navegación interna de Facturación del cliente para que el administrador pueda localizar rápidamente la sección abierta.

### Solución
Se modificó `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` para reemplazar la barra discreta por cuatro pestañas destacadas:

- **Facturas** — documento.
- **Transacciones** — intercambio.
- **Saldos** — cartera/saldo.
- **Configuración** — ajustes.

La pestaña activa utiliza fondo cian translúcido, borde luminoso, icono resaltado, línea inferior brillante y glow suave. Las inactivas conservan contraste y efecto hover. La distribución es responsive.

También se reforzó el encabezado del módulo con el rótulo **Facturación** y la descripción de navegación.

### Archivos modificados

- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — propietario de la navegación y composición visual.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.0.98 y CHANGELOG.
- `docs/CONTINUIDAD_Z-HUB.md` — esta entrada de continuidad maestra.
- `docs/CONTINUIDAD_MIKROHUB_1.0.96_SALDOS.md` — registro complementario actualizado.
- `docs/CONTINUIDAD_MIKROHUB_2026-09-08.md` — continuidad diaria consolidada.

### Backup

Antes de modificar `main` se creó:

`backup/pre-facturacion-tabs-resaltadas-2026-09-08`

Se mantiene el backup hasta completar la validación en servidor.

### Base de datos/API

Sin cambios.

### Flujo

```text
Ficha del cliente
  ↓
Facturación
  ↓
Pestañas destacadas
  ├── Facturas
  ├── Transacciones
  ├── Saldos
  └── Configuración
```

### Pruebas

- [x] backup creado antes de modificar `main`;
- [x] propietario real identificado en `billing/ClientBilling.jsx`;
- [x] cambio visual limitado al módulo de Facturación del cliente;
- [x] versión 1.0.98 y CHANGELOG actualizados;
- [x] base de datos y endpoints sin cambios deliberados;
- [ ] `yarn build` — no ejecutado desde este entorno;
- [ ] validación visual en navegador/servidor;
- [ ] prueba de las cuatro pestañas después de instalar 1.0.98;
- [ ] prueba de Factura libre y aplicación de Saldos después del despliegue.

### Resultado

El cambio visual y la documentación están publicados en `main`. La versión 1.0.98 queda pendiente de validación real mediante build y revisión del panel desplegado.

### Riesgos / pendientes

- Un error de compilación React solo puede descartarse ejecutando el build real.
- El backup debe conservarse hasta validar 1.0.98.
- No realizar cambios en base de datos para resolver problemas de interfaz.

### Commits

- Cambio visual: `7ddae5b12235f5b9dce43a0ce6154ffefb3a5590`
- Versión 1.0.98: `f2d098facf6aea953df195eb768e3dc56ad1ae3d`
- Continuidad Saldos: `2a76212a080c52b6814dbffc74a4014ca67d4bdd`
- Continuidad diaria: `7f7c9b203c25e3315038ae8e60d56c24d029740f`

---

## 20. Registro de continuidad — 2026-09-08 — Panel 1.1.9

**Tipo:** Corrección funcional / Facturación por cliente / vencimiento / corte / mensajería.

### Causa

La pantalla `Ficha del cliente → Facturación → Configuración` estaba leyendo la configuración global del ISP (`/settings`) en lugar de las reglas específicas guardadas en el registro del abonado. El asistente de registro ya persistía las reglas en la tabla `clients`, por lo que los valores mostrados en la ficha no coincidían con los elegidos al registrar al cliente.

### Datos que deben ser la fuente real del cliente

La configuración individual utiliza:

- `billing_type` — Prepago (adelantado) / Postpago (Vencido).
- `billing_day` — día de pago.
- `invoice_lead_days` — días de anticipación para crear factura.
- `grace_days` — días de gracia.
- `cut_after_months` — meses vencidos antes del corte.
- `invoice_notification_channel` — canal del aviso de nueva factura.
- `payment_reminder_channel` — canal de recordatorios.
- `reminder_1_days`, `reminder_2_days`, `reminder_3_days` — días de cada recordatorio.

### Solución

La configuración de Facturación del cliente se alineó con los valores guardados durante el registro.

#### Frontend

`frontend/src/modules/clientes/editor/billing/ClientBilling.jsx`

- Configuración deja de depender de la configuración global para representar las reglas del abonado.
- La pantalla utiliza las mismas opciones conceptuales del registro.
- Se muestra una previsión de emisión/vencimiento calculada con el día de pago y la anticipación del cliente.
- Guardar configuración afecta al abonado y no reprovisiona el servicio técnico.

#### Backend

`backend/app/routers/facturacion/client_balances.py`

- `GET /clients/{client_id}/billing-config` recupera la configuración individual.
- `PATCH /clients/{client_id}/billing-config` permite actualizarla y registrar el cambio.

`backend/app/routers/facturacion/router.py`

- La generación mensual calcula la emisión restando `invoice_lead_days` al día de vencimiento configurado.
- El vencimiento se calcula usando `billing_day` del abonado.
- `mark-overdue` suma `grace_days` del cliente antes de cambiar una factura a `overdue`.

`backend/app/routers/red/router.py`

- `sync-cuts` usa `cut_after_months` del abonado.
- El resultado informa qué regla individual se aplicó y qué clientes fueron omitidos por no alcanzar el número de meses requerido.

### Flujo funcional

```text
Registro de abonado
  ↓
Paso Facturación
  ↓
Reglas guardadas en clients
  ├── tipo
  ├── día de pago
  ├── anticipación
  ├── gracia
  ├── meses para corte
  └── canales/días de mensajes
        ↓
Ficha del cliente
  ↓
Facturación → Configuración
  ↓
GET billing-config
  ↓
Mostrar exactamente las reglas del abonado
  ↓
Guardar cambios del abonado
```

### Reglas de fechas

Para facturación mensual:

```text
vencimiento = próximo día de pago del abonado
emisión = vencimiento - días de anticipación
```

Una factura pasa a vencida solo después de:

```text
fecha de vencimiento + días de gracia del abonado
```

El corte evalúa las facturas `overdue` del cliente y exige la cantidad de meses configurada en `cut_after_months`.

### Mensajería

Los canales y días de recordatorio quedan asociados al abonado. La interfaz conserva las opciones de aviso y recordatorio seleccionadas durante el registro.

**Estado de integración:** la configuración individual queda persistida y disponible para el flujo de mensajería, pero el envío automático externo por proveedor no se declara terminado. El envío existente de factura por navegador continúa usando `mailto:`/`wa.me` hasta integrar un proveedor servidor y sus credenciales seguras.

### Archivos modificados

- `frontend/src/modules/clientes/editor/billing/ClientBilling.jsx` — configuración y cálculo de fechas en la ficha.
- `backend/app/routers/facturacion/client_balances.py` — API de configuración individual del cliente.
- `backend/app/routers/facturacion/router.py` — fechas de emisión/vencimiento y gracia individual.
- `backend/app/routers/red/router.py` — regla individual de meses para corte.
- `frontend/src/modules/system-update/version.js` — PANEL_VERSION 1.1.9 y CHANGELOG.
- `docs/CONTINUIDAD_Z-HUB.md` — registro maestro de esta entrega.
- `docs/CONTINUIDAD_MIKROHUB_1.1.9_FACTURACION_CLIENTE.md` — continuidad complementaria detallada.

### Base de datos

No se creó una tabla nueva. Se utilizan los campos de facturación ya existentes en `clients`.

### Integraciones

- MikroTik: la regla de corte usa la configuración individual del abonado.
- Correo/WhatsApp: canales de notificación quedan asociados al cliente; el transporte automático servidor/proveedor sigue pendiente.

### Pruebas

- [x] revisión de los campos existentes en el modelo `Client`;
- [x] revisión de que el registro del abonado ya guarda las reglas de facturación;
- [x] revisión del propietario de la pantalla de configuración;
- [x] revisión de rutas backend de facturación y corte;
- [x] actualización de `PANEL_VERSION` a 1.1.9;
- [x] actualización de esta bitácora maestra;
- [ ] build React — no ejecutado desde este entorno;
- [ ] prueba funcional real en navegador con un abonado cuyos valores difieran de la configuración global;
- [ ] prueba real de generación mensual y fechas;
- [ ] prueba real de vencimiento después de gracia;
- [ ] prueba real de corte contra MikroTik;
- [ ] prueba real de transporte SMS/WhatsApp/Correo automático.

### Resultado

**Código y documentación de continuidad publicados en `main`.** La versión funcional declarada es 1.1.9. La lógica fue preparada para que la configuración de la ficha corresponda al abonado registrado y para que vencimiento, gracia y corte respeten esas reglas individuales.

La validación real de build, navegador, servidor y transporte externo permanece pendiente y no se debe declarar como aprobada hasta ejecutarla.

### Riesgos / pendientes

1. Validar que un cliente con valores distintos de los globales muestre exactamente sus propios valores.
2. Confirmar que la generación mensual produce emisión/vencimiento esperados para distintos días de pago y anticipación.
3. Confirmar que `grace_days` impide el cambio prematuro a `overdue`.
4. Confirmar que `cut_after_months` evita cortes antes del número de meses configurado.
5. Integrar/probar proveedor servidor real para SMS/WhatsApp/correo si se requiere envío automático.
6. Mantener la regla de no modificar datos existentes para corregir problemas visuales.

### Commits

- Cambios funcionales de configuración/fechas/corte: commits de la entrega 1.1.9 publicados en `main`.
- Versión 1.1.9: `0b7a94f4f36b45f6b1425eb1f1d6c1069d9418ab`.
- Continuidad complementaria: commit de creación de `docs/CONTINUIDAD_MIKROHUB_1.1.9_FACTURACION_CLIENTE.md`.

### Estado de cierre

**1.1.9 queda documentada en la bitácora maestra y en su continuidad complementaria. Pendiente únicamente la validación real de build/servidor/navegador y pruebas de transporte externo antes de considerarla completamente validada.**

---

## 21. Registro de continuidad — 2026-09-08 — Panel 1.1.10

**Tipo:** Identidad / UX / templates visuales / compatibilidad / seguridad de despliegue.

### Objetivo
Cambiar la identidad visible del producto de MikroHub a **Z-Hub** y añadir un template claro inspirado en la propuesta visual aprobada, conservando el template oscuro actual y evitando cambios funcionales en Clientes, Facturación, MikroTik, OLT, permisos o rutas internas.

### Decisión de compatibilidad
El cambio de marca es **visible**, no una migración destructiva de nombres internos.

Se conserva deliberadamente:
- repositorio `ronbercito/mirkohub`;
- ruta de despliegue `/var/www/mikrohub`;
- claves locales heredadas `fibraz_*`;
- nombres técnicos/integraciones que usen MikroHub internamente.

El campo `company_name` sigue siendo configurable. Si el ISP ya tiene un nombre guardado (por ejemplo FIBRA Z), **no se sobrescribe**. Z-Hub funciona como identidad/fallback del producto.

### Backup obligatorio creado
- Backup: `backup-pre-zhub-theme-1.1.10`
- Base: `9c269d9d39add24e860ba9c2ed7e8e9ffa21274b` — Panel 1.1.9.
- Desarrollo/validación: `update-zhub-theme-1.1.10`

### Templates disponibles
1. `dark` — **Oscuro clásico**.
2. `zhub-light` — **Z-Hub Blanco**, con blanco/azul claro y acentos azul, cian y turquesa.

Selector:
`Ajustes → General → Apariencia del panel`

Persistencia:
`panel_theme` dentro del JSON existente de `settings`; no requiere migración SQL.

### Arquitectura del tema
```text
Ajustes > General
  ↓
panel_theme
  ↓
/api/settings
  ↓
settings.data JSON
  ↓
Layout / Login
  ↓
applyPanelTheme()
  ↓
html[data-panel-theme="dark|zhub-light"]
  ↓
panel-theme.css
```

### Archivos nuevos
- `frontend/src/modules/appearance/panelThemes.js`
- `frontend/src/modules/appearance/PanelThemeSelector.jsx`
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/public/zhub-logo.svg`

### Archivos modificados
- `frontend/src/modules/ajustes/Settings.jsx`
- `frontend/src/components/layout/Layout.jsx`
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/auth/Login.jsx`
- `frontend/src/App.js`
- `frontend/src/modules/system-update/UpdateCenter.jsx`
- `frontend/src/modules/system-update/version.js`
- `backend/app/models/setting.py`
- `backend/app/routers/ajustes/router.py`
- `docs/CONTINUIDAD_Z-HUB.md`

### Base de datos y API
No se crea tabla ni columna SQL. Se añade la clave JSON `panel_theme = dark | zhub-light`.

`GET /api/settings/public` puede devolver:
- `company_name`
- `logo_data`
- `panel_theme`

No se modificaron rutas existentes de Clientes, Facturación, MikroTik, OLT, permisos ni autenticación.

### Pruebas realizadas
- [x] rama backup creada antes de publicar;
- [x] rama aislada de desarrollo creada;
- [x] `Settings.jsx`, `Layout.jsx` y `Login.jsx` restaurados desde el `main` vigente y cambios reaplicados mínimamente;
- [x] comparación contra `main` revisada;
- [x] instalación de dependencias frontend en GitHub Actions;
- [x] `yarn build` de producción correcto en GitHub Actions;
- [x] `python -m py_compile backend/app/models/setting.py backend/app/routers/ajustes/router.py` correcto;
- [x] versión y CHANGELOG en 1.1.10;
- [x] continuidad canónica actualizada;
- [ ] instalación real desde el Actualizador del servidor;
- [ ] validación visual real de ambos templates después del despliegue;
- [ ] prueba de cambiar tema, cerrar sesión y volver a ingresar.

### Rollback
1. rollback automático del actualizador ante fallo;
2. rama `backup-pre-zhub-theme-1.1.10` para volver al estado exacto 1.1.9.

### Regla de continuidad
Cada cambio posterior debe actualizar `docs/CONTINUIDAD_Z-HUB.md` antes de comunicarse como terminado.

### Estado
**Código validado por build y documentación actualizada. Preparado para publicación como 1.1.10; instalación real en servidor pendiente de ejecutar desde el Actualizador.**


---

## 22. Registro de continuidad — 2026-09-09 — Panel 1.1.11

**Tipo:** UX visual / refinamiento del template claro / continuidad / seguridad de despliegue.

### Objetivo

Reducir la sensación de exceso de brillo del template **Z-Hub Blanco** sin abandonar el estilo claro ni alterar la lógica actual del panel.

### Motivo del cambio

Después de probar la versión 1.1.10, el administrador indicó que el template claro se percibía demasiado iluminado. Se solicitó mantener el blanco como base, pero reducir la luminosidad de fondos, superficies, bordes, sombras y efectos para lograr un acabado más sobrio y cómodo durante uso prolongado.

### Backup previo

Antes de publicar esta corrección se creó la rama de respaldo:

`backup-pre-zhub-light-1.1.11`

Base del respaldo:

`f082580712ce36f312ca9b2555ab8ed4d3c96417` — Z-Hub 1.1.10 validado.

Rama de validación:

`update-zhub-light-1.1.11`

### Cambios realizados

- Fondo general del template claro: pasa de un blanco azulado muy brillante a un gris-azulado claro más sobrio.
- Superficies y tarjetas: conservan blanco, pero con menor contraste luminoso contra el fondo.
- Bordes: tonos gris-azulados más neutros.
- Campos e inputs: blanco suave `#fbfdff` en lugar de blanco puro agresivo.
- Hovers: menos luminosos y menos azulados.
- Sombras: reducidas en tamaño e intensidad.
- Gradientes radiales del área principal: opacidad reducida.
- Textos y estados: se mantienen legibles y con contraste suficiente.

### Archivos modificados

- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_Z-HUB.md`
- `docs/CONTINUIDAD_MIKROHUB_1.1.11_TEMA_CLARO.md`

### Compatibilidad

No se modificaron:

- Clientes;
- Facturación;
- MikroTik;
- OLT;
- permisos;
- autenticación;
- estructura de base de datos;
- persistencia del selector de templates;
- template oscuro clásico.

El cambio es exclusivamente visual sobre `html[data-panel-theme="zhub-light"]`.

### Pruebas de esta entrega

- [x] backup previo creado en GitHub;
- [x] cambios aislados en rama de actualización;
- [x] versión subida a 1.1.11;
- [x] continuidad maestra actualizada;
- [x] continuidad complementaria creada;
- [x] build React de producción ejecutado en GitHub Actions;
- [x] sintaxis Python del backend validada con `py_compile`;
- [ ] validación visual real en el servidor después de instalar desde el actualizador;
- [ ] confirmación del administrador de que la luminosidad final es adecuada.

### Resultado esperado

El template **Z-Hub Blanco** debe conservar su apariencia clara y profesional, pero con menor brillo, menor sensación de neón y una lectura más cómoda. La combinación principal continúa siendo blanco, azul, cian y turquesa, solo con un tratamiento más sobrio.

### Pendiente de cierre operativo

Después de instalar 1.1.11 desde el actualizador, revisar visualmente:

1. Inicio / Dashboard.
2. Ajustes.
3. Clientes.
4. Facturación.
5. Tablas y formularios.
6. Sidebar y Navbar.

Si aún se considera demasiado claro, preparar una versión posterior sin alterar 1.1.11 hasta recibir capturas del servidor real.


---

## 23. Registro de continuidad — 2026-09-09 — Panel 1.1.12

**Tipo:** migración de repositorio / actualizador dual / continuidad / compatibilidad.

### Decisión principal

Desde esta versión el repositorio de trabajo y publicación principal del proyecto pasa a ser:

`ronbercito/Z-Hub`

El repositorio anterior:

`ronbercito/mirkohub`

queda conservado como **repositorio legado y fuente de respaldo para actualizaciones**. No se eliminará de inmediato porque las instalaciones existentes todavía pueden tener `origin` apuntando a MikroHub.

### Objetivo

Permitir una transición segura sin reinstalar el panel ni romper instalaciones ya desplegadas. El panel 1.1.12 puede consultar ambos repositorios y elegir la versión funcional más reciente.

### Política de selección

El backend consulta:

1. `https://github.com/ronbercito/Z-Hub.git` — fuente principal.
2. `https://github.com/ronbercito/mirkohub.git` — fuente legado/fallback.

La selección se realiza por `PANEL_VERSION`:

- gana la versión numéricamente mayor;
- si ambos publican la misma versión, **Z-Hub tiene prioridad**;
- un cambio únicamente documental con la misma `PANEL_VERSION` no debe mostrarse como actualización funcional.

### Flujo del actualizador 1.1.12

```text
Panel instalado
  ↓
GET /api/system-update/status
  ↓
consulta Z-Hub/main
  +
consulta MikroHub/main
  ↓
lee PANEL_VERSION de ambos
  ↓
selecciona versión mayor
  ↓
si hay empate → Z-Hub
  ↓
POST /api/system-update/install
  ↓
run_update.sh recibe repositorio seleccionado
  ↓
origin se cambia a esa fuente
  ↓
fetch + reset + setup_debian.sh
  ↓
rollback al commit anterior si falla
```

### Archivos funcionales modificados

- `backend/app/modules/system_update/router.py`
  - consulta ambos repositorios;
  - usa refs remotas separadas para no depender del `origin` actual;
  - devuelve la fuente seleccionada y el estado de ambas fuentes;
  - compara `PANEL_VERSION` y no solo diferencias de commit;
  - envía al instalador el repositorio elegido.

- `backend/app/modules/system_update/run_update.sh`
  - acepta `MIKROHUB_UPDATE_REPOSITORY` y `MIKROHUB_UPDATE_SOURCE`;
  - usa Z-Hub como fuente primaria por defecto en 1.1.12+;
  - conserva MikroHub como fallback compatible;
  - mantiene backup/rollback transaccional.

- `frontend/src/modules/system-update/version.js`
  - `PANEL_VERSION = 1.1.12`;
  - CHANGELOG de migración y doble repositorio.

### Compatibilidad

No se cambian:

- ruta de despliegue `/var/www/mikrohub`;
- variables internas heredadas que todavía usan el nombre MikroHub;
- base de datos;
- clientes;
- facturación;
- routers/OLT;
- permisos;
- autenticación;
- templates visuales.

El cambio de repositorio no implica renombrar rutas técnicas existentes.

### Backup obligatorio

Antes de modificar el actualizador se creó:

`backup-pre-dual-repo-1.1.12`

Esta rama conserva exactamente el estado 1.1.11 previo a la transición.

### Migración de archivos a Z-Hub — COMPLETADA

La migración fue completada el 2026-09-09. El `main` validado de 1.1.12 fue promovido íntegramente a `ronbercito/Z-Hub`, conservando el mismo commit de origen durante la copia inicial (`177e29184ce138469ef0d9d4eb6d5328acf5e409`).

Desde este punto:

- `ronbercito/Z-Hub` es el repositorio principal y autoritativo;
- todo desarrollo nuevo se realiza en Z-Hub;
- `ronbercito/mirkohub` queda congelado como fuente legado/fallback de transición;
- el panel 1.1.12 consulta ambos repositorios y solo ofrece actualización cuando existe una `PANEL_VERSION` superior;
- cambios exclusivamente documentales con la misma versión no provocan una actualización del panel.

### Pruebas de la entrega

- [x] revisión del flujo actual `router.py → run_update.sh → setup_debian.sh`;
- [x] respaldo previo creado;
- [x] consulta dual implementada;
- [x] prioridad Z-Hub en empate de versión;
- [x] cambios documentales con la misma versión no generan falsa actualización;
- [x] rollback preservado;
- [x] sintaxis Python validada;
- [x] sintaxis Bash validada;
- [x] build React de producción validado;
- [x] continuidad maestra actualizada;
- [x] continuidad complementaria creada;
- [ ] instalación real 1.1.12 desde un servidor que aún tenga `origin` en MikroHub;
- [ ] validación real de detección futura de una versión publicada solo en Z-Hub.

### Regla a partir de 1.1.12

**Todo desarrollo nuevo debe realizarse en `ronbercito/Z-Hub`.**

`ronbercito/mirkohub` queda como compatibilidad/fallback y no debe volver a ser el repositorio principal salvo rollback o emergencia expresamente documentada.


### Cierre de migración de repositorio

**Migración de código: completada.** El repositorio principal `ronbercito/Z-Hub` contiene el árbol actualizado de 1.1.12. La validación en servidor real del nuevo actualizador dual permanece pendiente hasta que el administrador instale 1.1.12 desde su panel.


---

## 24. Registro de continuidad — 2026-09-09 — Panel 1.1.13

**Tipo:** UX visual / reducción de luminancia / continuidad / repositorio definitivo.

### Regla definitiva de repositorio

A partir de esta entrega, **todo trabajo nuevo se realiza en `ronbercito/Z-Hub`**: desarrollo, correcciones, documentación, pruebas y publicación.

`ronbercito/mirkohub` queda exclusivamente como repositorio legado/fallback del actualizador dual. No debe recibir nuevas funciones salvo rollback o emergencia expresamente documentada.

### Motivo

El administrador confirmó que el template claro seguía teniendo demasiado brillo blanco y resultaba molesto para la vista durante uso prolongado.

### Solución

El tema persistido `zhub-light` se conserva para no perder preferencias existentes, pero su presentación visible cambia a **Z-Hub Claro Suave**.

Se reduce la luminancia de manera más marcada:

- fondo general `#d7e0e9`;
- tarjetas/superficies `#e7edf3`;
- superficies secundarias `#dde5ed`;
- sidebar/header `#e3e9f0`;
- campos `#e8edf3`;
- bordes gris-azulados más sobrios;
- hovers menos luminosos;
- sombras y gradientes casi neutros.

No se usa blanco puro como superficie normal del template claro. El blanco se reserva para texto sobre acciones/estados de color cuando aporta contraste.

### Archivos modificados

- `frontend/src/modules/appearance/panel-theme.css`;
- `frontend/src/modules/appearance/panelThemes.js`;
- `frontend/src/modules/system-update/version.js`;
- `docs/CONTINUIDAD_Z-HUB.md`;

### Backup

Rama previa: `backup-pre-soft-light-1.1.13`, creada desde `ff71f9ae621cf196dff4cd21fd217f3a87eab602`.

### Compatibilidad

No se modifican lógica funcional, base de datos, Clientes, Facturación, MikroTik, OLT, permisos, autenticación ni el tema oscuro clásico. El identificador persistido `zhub-light` permanece sin cambios.

### Pruebas

- [x] backup previo creado en `ronbercito/Z-Hub`;
- [x] cambios aislados en rama `update-soft-light-1.1.13`;
- [x] `PANEL_VERSION` actualizado a 1.1.13;
- [x] identificador interno `zhub-light` preservado;
- [x] build React de producción ejecutado en GitHub Actions;
- [x] continuidad maestra actualizada en la misma entrega;
- [ ] validación visual real después de instalar 1.1.13 en el servidor.

### Resultado esperado

El template debe seguir siendo claro, pero notablemente menos brillante, con una base gris-azulada suave y sin grandes superficies blancas que fatiguen la vista.


---

## 25. Nota operativa — Política de ramas Git

**Tipo:** Documentación / flujo de trabajo Git.

### Estructura de ramas

Para cada actualización importante se puede trabajar temporalmente con ramas separadas dentro del mismo repositorio `ronbercito/Z-Hub`. Esto **no crea otro panel ni otra copia física del proyecto**; cada rama es una referencia Git al historial del mismo repositorio y por eso muestra la misma estructura de carpetas (`backend`, `frontend`, `docs`, etc.).

Política vigente:

- `main` = rama oficial, estable y fuente de publicación/actualización del panel.
- `update-*` = rama temporal de desarrollo y validación de una actualización.
- `backup-*` = rama de respaldo creada antes de modificar archivos delicados o críticos.

### Flujo recomendado

```text
main estable
  ↓
crear backup-*
  ↓
crear update-*
  ↓
aplicar cambios
  ↓
validar / compilar / probar
  ↓
promover a main
  ↓
confirmar instalación real
  ↓
eliminar update-* cuando ya no sea necesaria
```

### Regla importante

El panel debe buscar e instalar actualizaciones desde `main`. Las ramas `update-*` no son una segunda instalación ni una fuente permanente de actualización.

Cuando una rama `update-*` ya fue promovida y queda idéntica a `main`, puede eliminarse para mantener limpio el repositorio. Las ramas `backup-*` se conservan mientras sean útiles para rollback y pueden depurarse posteriormente de forma controlada.

### Estado comprobado en 1.1.13

La rama `update-soft-light-1.1.13` quedó idéntica a `main` después de la publicación de la versión 1.1.13. La diferencia era únicamente temporal durante el desarrollo/validación.

### Versionado

Esta nota es exclusivamente documental. **No incrementa `PANEL_VERSION`** y no debe generar una actualización funcional del panel.


---

## 26. Changelog único de continuidad — 1.1.14 a 1.1.22

**Política definitiva:** desde esta consolidación solo existe un archivo de continuidad: docs/CONTINUIDAD_Z-HUB.md. No se crearán archivos por versión, fecha, módulo, prueba o corrección. Cada actualización se agregará al final de este apartado, en orden cronológico, con versión, objetivo, archivos, pruebas, resultado y pendientes.

### Formato obligatorio de cada entrada futura

### [Versión] — [Fecha] — [Tipo]
- Objetivo y causa.
- Archivos modificados.
- Flujo y compatibilidad.
- Pruebas realizadas y pendientes.
- Resultado, riesgos y commits.

### 1.1.14 — 2026-09-09 — Tema claro blanco sólido
- Se rediseñó exclusivamente zhub-light con superficies blancas, azul tinta, bordes discretos y sin glow, neón ni gradientes.
- Archivo funcional: frontend/src/modules/appearance/panel-theme.css. Se conserva el identificador zhub-light y el tema oscuro; sin cambios de API, base de datos ni lógica.
- Pendiente validación real de build y navegador. Commits: 8933f963, 79b39d12.

### 1.1.15 — 2026-09-09 — Tema claro sin brillo
- Se reforzó la apariencia plana y profesional: sin filtros, gradientes, sombras coloreadas ni glow.
- Archivo funcional: frontend/src/modules/appearance/panel-theme.css. Sin cambios en Clientes, Facturación, red, autenticación ni tema oscuro.
- Pendiente build y validación visual. Commits: 32c6f68e, 10b60734.

### 1.1.16–1.1.17 — 2026-09-09 — Ajuste contra referencia visual
- Se afinó zhub-light con fondo claro neutro, superficies blancas, texto azul tinta, KPI sólidos moderados, líneas sobrias y sombras mínimas.
- Se preservó texto blanco dentro de indicadores de color y se evitó modificar el tema oscuro. Archivo funcional: frontend/src/modules/appearance/panel-theme.css.
- Pendiente build y revisión visual de Dashboard, Clientes, Facturación, Red, formularios, tablas y modales. Commits: d8a925e7, 6323aa5c.

### 1.1.18 — 2026-09-09 — Panel derecho del Dashboard
- Se limitó el cambio visual al Resumen del sistema: tarjeta clara, filas gris claro, texto azul tinta y badges sobrios.
- Se mantuvo deliberadamente el gráfico izquierdo sin convertirlo a tarjeta clara. Archivo funcional: frontend/src/modules/appearance/panel-theme.css.
- Pendiente build y validación visual antes de extender el ajuste.

### 1.1.19 — 2026-09-09 — Menú activo en negrita
- Sidebar resalta menú y submenú activos con font-bold sin cambiar rutas, permisos ni expansión.
- Archivo funcional: frontend/src/components/layout/Sidebar.jsx. Pendiente build y validación visual.

### 1.1.20 — 2026-09-09 — Tipografía del menú
- En zhub-light, navegación normal usa peso 600; activa y submenú activo usan peso 800 y azul tinta.
- Archivo funcional: frontend/src/modules/appearance/panel-theme.css. Pendiente build y validación visual.

### 1.1.21 — 2026-09-09 — Tipografía y hover del menú
- Menú claro: normal peso 700; activo y hover peso 900. Estructura, rutas y permisos quedan sin cambios.
- Archivos funcionales: frontend/src/components/layout/Sidebar.jsx y frontend/src/modules/appearance/panel-theme.css. Pendiente build y validación visual real.

### 1.1.22 — 2026-09-09 — Hover transparente azul del menú claro
- Se elimina la barra gris oscura que dificultaba leer al pasar el mouse.
- Menús y submenús de zhub-light usan fondo transparente con carga azul translúcida, marco azul sutil, texto azul oscuro y peso 900 en hover.
- No modifica rutas, permisos ni lógica de navegación. Archivo funcional: frontend/src/modules/appearance/panel-theme.css; versión/changelog: frontend/src/modules/system-update/version.js.
- Pendiente ejecutar build y validar hover en el panel desplegado. Commits: e13af07f, 10b9276f.

### Consolidación documental — 2026-09-09
- Se eliminaron los archivos de continuidad complementarios e históricos para conservar una sola fuente de verdad.
- El único archivo permitido para continuidad futura es este: docs/CONTINUIDAD_Z-HUB.md.
- Esta consolidación es documental: no incrementa PANEL_VERSION ni cambia funcionalidad del panel.

### Renombre del archivo maestro — 2026-09-09
- La bitácora única pasa de CONTINUIDAD_MIKROHUB.md a CONTINUIDAD_Z-HUB.md para reflejar el repositorio y nombre público vigentes.
- Todo el contenido consolidado se conserva en este mismo archivo; el archivo anterior se elimina.
- Desde ahora toda referencia, actualización y documentación futura debe usar exclusivamente docs/CONTINUIDAD_Z-HUB.md.


---

## 27. Integración de registros históricos restantes

### Política obligatoria ante fallos de actualización
- No repetir una actualización a ciegas después de un error, rollback o build fallido.
- Primero identificar versión, archivos y commits involucrados; revisar el código modificado y seguir la cadena completa React → API → backend → modelo/integración → respuesta → interfaz.
- Comparar toda llamada nueva con flujos funcionales equivalentes del repositorio.
- Corregir la causa real, ejecutar build y pruebas relevantes, y solo entonces reintentar el despliegue.
- Nunca borrar base de datos ni ocultar el error para forzar una actualización.

### Historial integrado de clientes, facturación y eliminación
- 1.0.68: al editar/eliminar/anular facturas pendientes se recalcula saldo y contador desde facturas reales; las facturas pagadas o con pagos quedan protegidas.
- 1.0.69: potencia óptica de fibra se normaliza a dBm negativo y usa rangos visuales por calidad.
- 1.0.72–1.0.85: la eliminación definitiva de cliente evolucionó de confirmación nativa a modal propio, con datos reales de cliente/servicios/facturas, saldo pendiente, advertencia prioritaria y confirmación SI. La versión estable mantiene la carga de datos en Clients.jsx y solo la presentación en el módulo visual; no usar interceptores globales.
- 1.0.91: Facturación de cliente se aisló con wrapper y ErrorBoundary para que un error de ejecución no deje en blanco las demás pestañas. Un error de compilación sigue requiriendo build antes de publicar.
- 1.1.3: eliminar servicio adicional registra auditoría detallada: servicio, plan, conexión, tecnología, equipo, IP, facturas pendientes eliminadas, saldo y cuenta/rol ejecutor. Facturas pagadas o parcialmente pagadas permanecen protegidas.
- 1.1.4: eliminar servicio adicional exige confirmación previa y una segunda confirmación si existen facturas pendientes; cancelar no envía DELETE y el servicio principal no se elimina desde ese botón.

### Backups documentales retirados
- Las notas de backup de Log y de transición 1.0.100 → 1.1.0 se consolidan aquí como referencias históricas. Los respaldos reales deben manejarse mediante ramas backup-* o la carpeta técnica backups/, no mediante archivos de continuidad separados.

### Limpieza final de documentos — 2026-09-09
- Se eliminaron los archivos restantes de continuidad, políticas y notas documentales de backup de docs/.
- El único documento maestro, changelog y regla de continuidad es docs/CONTINUIDAD_Z-HUB.md.
- Esta entrada no incrementa PANEL_VERSION.


### 1.1.23 — 2026-09-09 — Dashboard claro según referencia

- Objetivo: alinear el Dashboard del tema zhub-light con la segunda referencia proporcionada: fondos blancos, bordes azul-gris discretos, texto azul tinta, tablas claras y gráficos legibles.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (contenedor visual y tooltip claro), frontend/src/modules/appearance/panel-theme.css (capa visual acotada a .dashboard-reference), frontend/src/modules/system-update/version.js.
- Flujo/compatibilidad: no cambia API, datos, rutas, permisos ni el tema oscuro. Dashboard mantiene /api/dashboard/summary y solo se modifica su presentación bajo html[data-panel-theme="zhub-light"].
- Backup: rama backup-pre-dashboard-claro-1.1.23 creada antes del cambio.
- Pruebas: revisión estática de JSX, selectores y versión; build y validación visual real en servidor pendientes.
- Resultado esperado: tarjetas KPI coloreadas, recaudación, resumen, últimas tablas y tooltip se presentan en claro como la referencia, eliminando las grandes superficies oscuras del Dashboard.


### 1.1.24 — 2026-09-09 — Tarjetas KPI del Dashboard según referencia
- Objetivo y causa: corregir la franja superior del Dashboard claro. La regla global de tema no reconocía el color sky y además reemplazaba los textos blancos de las tarjetas por tonos oscuros, por eso la tarjeta de transacciones aparecía blanca y con bajo contraste.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (clases visuales propias de cada KPI), frontend/src/modules/appearance/panel-theme.css (colores, tipografía, contraste, altura y ancho de las cuatro tarjetas), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: los valores se siguen obteniendo de /api/dashboard/summary; no se cambian API, datos, navegación, permisos, facturación, autenticación ni el tema oscuro.
- Pruebas: revisión estática de las cuatro clases KPI, selectores de tema y PANEL_VERSION 1.1.24. Build y validación visual en el servidor siguen pendientes.
- Resultado esperado: las tarjetas llenan completamente su recuadro, con verde, azul, violeta y azul oscuro; texto e iconos blancos legibles, títulos con peso alto y sin superficies blancas dentro de la franja KPI.


### 1.1.25 — 2026-09-09 — Área útil del panel ampliada
- Objetivo y causa: la referencia usa todo el espacio posterior al menú lateral. Layout.jsx limitaba el contenido global a max-w-7xl (1280 px), por lo que aparecían franjas vacías y el Dashboard quedaba más estrecho que el modelo.
- Archivos modificados: frontend/src/components/layout/Layout.jsx (se reemplaza el límite max-w-7xl por ancho completo con padding adaptable), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: Dashboard y el resto de módulos conservan sus datos y acciones; solo reciben mayor área de presentación. No cambia API, permisos, autenticación, navegación ni tema oscuro.
- Backup: rama backup-pre-layout-ampliado-1.1.25 creada antes de modificar el layout compartido.
- Pruebas: revisión estática de la clase de Layout, PANEL_VERSION y continuidad. Build y revisión visual real en servidor pendientes.
- Resultado esperado: tras el menú lateral, las tarjetas KPI, gráfico, resumen y tablas se extienden hasta el borde útil del contenido, con márgenes laterales compactos equivalentes a la segunda referencia.


### 1.1.26 — 2026-09-09 — Legibilidad del Resumen del sistema
- Objetivo y causa: ajustar la tipografía del Resumen del sistema para que tenga la misma lectura azul tinta, más nítida y con peso alto de la referencia. Los números de los indicadores circulares requerían mayor contraste respecto de su color de fondo.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (clase propia dashboard-system-summary), frontend/src/modules/appearance/panel-theme.css (tipografía, filas y contadores), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: se preservan /api/dashboard/summary, todos los valores, navegación, permisos, autenticación y tema oscuro; el cambio solo actúa en zhub-light.
- Pruebas: revisión estática de selectores, clase del panel y PANEL_VERSION 1.1.26. Build y validación visual real pendientes.
- Resultado esperado: etiquetas y título en azul tinta con peso consistente; cada contador redondo conserva su color pero muestra un número oscuro, grueso y visible.


### 1.1.27 — 2026-09-09 — Tipografía de Recaudación Diaria reforzada
- Objetivo y causa: aumentar el peso visual de las letras de Recaudación Diaria para que sea consistente con el Resumen del sistema y la referencia aprobada.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (clase propia dashboard-revenue), frontend/src/modules/appearance/panel-theme.css (título, subtítulo, leyenda, escalas y medidor), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: se conservan datos, series, porcentajes, API /api/dashboard/summary, rutas, permisos, autenticación y tema oscuro. Solo cambia la presentación zhub-light.
- Pruebas: revisión estática de clase, selectores y PANEL_VERSION 1.1.27. Build y validación visual real pendientes.
- Resultado esperado: textos, escalas y métricas del gráfico se ven más gruesos, oscuros y notorios sin alterar la gráfica ni sus datos.


### 1.1.28 — 2026-09-09 — Versión visible en Dashboard
- Objetivo y causa: mostrar la versión instalada junto al botón Actualizar para facilitar la comprobación visual del panel sin buscar el pie de página.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (importa y presenta PANEL_VERSION), frontend/src/modules/appearance/panel-theme.css (etiqueta dashboard-version-badge), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: la etiqueta usa la fuente única PANEL_VERSION, por lo que cambia automáticamente en cada publicación. No modifica el mecanismo de actualización, API, datos, permisos, autenticación ni el tema oscuro.
- Pruebas: revisión estática de importación, presentación de PANEL_VERSION, selector y versión 1.1.28. Build y validación visual real pendientes.
- Resultado esperado: el Dashboard muestra “Versión 1.1.28” inmediatamente a la izquierda de “Actualizar”.


### 1.1.29 — 2026-09-09 — Tablas recientes con lectura reforzada
- Objetivo y causa: mejorar el peso de letra en Últimos pagos registrados y Últimos conectados, y resaltar los importes cobrados con un verde más vivo.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (clases propias de ambas tablas), frontend/src/modules/appearance/panel-theme.css (títulos, encabezados, filas e importes), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: conserva los mismos registros, importes, API /api/dashboard/summary, navegación, permisos, autenticación y tema oscuro. Solo cambia la presentación zhub-light.
- Pruebas: revisión estática de clases, selectores y PANEL_VERSION 1.1.29. Build y validación visual real pendientes.
- Resultado esperado: toda la información de ambas tablas se lee con mayor presencia y S/. cobrado resalta en verde vivo sin alterar el valor.


### 1.1.30 — 2026-09-09 — Confirmación del botón Actualizar
- Objetivo y causa: el botón de actualización del Dashboard ejecutaba la consulta, pero no ofrecía confirmación visible; si los valores no cambiaban, parecía no realizar ninguna acción.
- Archivos modificados: frontend/src/modules/inicio/Dashboard.jsx (estado “Actualizando…”, bloqueo temporal y toast de éxito), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: el clic manual llama a /api/dashboard/summary como antes y confirma al terminar. El refresco automático de 15 segundos permanece silencioso. No cambia API, datos, rutas, permisos, autenticación ni tema oscuro.
- Pruebas: revisión estática del flujo silent/manual, estado refreshing, texto del botón y PANEL_VERSION 1.1.30. Build y validación visual real pendientes.
- Resultado esperado: al pulsar el botón se ve “Actualizando…” con icono girando y después el aviso “Dashboard actualizado”; si falla, se conserva el aviso de error existente.


### 1.1.31 — 2026-09-09 — Navbar clara y tipografía reforzada
- Objetivo y causa: adaptar Moneda, notificaciones y perfil de la barra superior al tema claro; anteriormente conservaban fondos oscuros y un peso visual inconsistente con el resto del Dashboard.
- Archivos modificados: frontend/src/components/layout/Navbar.jsx (clases propias navbar-currency, navbar-notifications y navbar-user), frontend/src/modules/appearance/panel-theme.css (fondos claros, texto azul tinta y peso alto), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: búsqueda, enlace a facturación de notificaciones, centro de actualizaciones y datos del usuario se conservan sin cambios. No afecta API, permisos, autenticación ni tema oscuro.
- Pruebas: revisión estática de clases, selectores y PANEL_VERSION 1.1.31. Build y validación visual real pendientes.
- Resultado esperado: la barra superior clara muestra moneda, alerta y usuario con superficies claras, bordes discretos y texto más grueso como el resto del panel.


### 1.1.32 — 2026-09-09 — Gestión de red adaptada al tema claro
- Objetivo y causa: al ingresar a Gestión de red, tarjetas de equipos, métricas y tabla de interfaces conservaban grandes superficies oscuras que no seguían el estilo ya aplicado al Dashboard.
- Archivos modificados: frontend/src/modules/red/Network.jsx (contenedores visuales), frontend/src/modules/red/components/RouterCard.jsx (clase de tarjeta), frontend/src/modules/red/components/RouterLiveTabs.jsx (clase de tabla viva), frontend/src/modules/appearance/panel-theme.css (capa clara aislada), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: se preservan las llamadas a /api/routers, acciones de prueba, ping, cortes, configuración, RouterOS y OLT. No cambian datos, rutas, permisos, autenticación ni tema oscuro.
- Backup: rama backup-pre-red-clara-1.1.32 creada antes de modificar la vista operativa.
- Pruebas: revisión estática de clases, selectores y versión 1.1.32. Build y validación visual/lecturas reales pendientes.
- Resultado esperado: Gestión de red presenta equipos, métricas, pestañas e interfaces con fondos blancos, cabeceras gris-azul, textos azul tinta, bordes discretos y estados de color legibles, coherentes con Dashboard.


### 1.1.33 — 2026-09-09 — Color funcional en Gestión de red
- Objetivo y causa: tras llevar la vista a claro, métricas y tablas quedaron demasiado neutras. Se pidió recuperar vida visual manteniendo sobriedad operativa.
- Archivos modificados: frontend/src/modules/red/Network.jsx (identificadores por métrica), frontend/src/modules/appearance/panel-theme.css (tonos suaves por KPI, tarjeta seleccionada, tráfico y estados), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: no cambia la lectura de RouterOS/OLT, métricas, estados, API, datos, permisos ni tema oscuro. Solo se presenta color bajo zhub-light.
- Pruebas: revisión estática de identificadores, selectores y PANEL_VERSION 1.1.33. Build y validación visual real pendientes.
- Resultado esperado: CPU azul, memoria violeta, uptime turquesa, latencia ámbar, PPPoE verde y colas índigo; tráfico y estados resaltan claramente sin volver a fondos oscuros.


### 1.1.34 — 2026-09-09 — Tablero OLT claro con color operativo
- Objetivo y causa: el resumen de OLT conservaba módulos completos en oscuro pese a que la vista general de Gestión de red ya se adaptó al tema claro.
- Archivos modificados: frontend/src/modules/red/components/OltLiveTabs.jsx (contenedor visual OLT), frontend/src/modules/red/components/olt-tabs/OltSummaryTab.jsx (clase propia del tablero), frontend/src/modules/appearance/panel-theme.css (superficies claras y acentos de estado), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: no se modifica ningún endpoint /api/routers/{id}/olt/*, comando CLI, consulta de PON, ONU, conteo ni acción de la OLT. No cambia permisos, autenticación, datos ni tema oscuro.
- Backup: rama backup-pre-olt-clara-1.1.34 creada antes del ajuste.
- Pruebas: revisión estática de clases, selectores y PANEL_VERSION 1.1.34. Build, revisión visual y validación de lecturas reales pendientes.
- Resultado esperado: Resumen OLT, salud, disponibilidad, estado y actividad usan blanco, bordes azul-gris y colores funcionales: verde/turquesa para línea, índigo para autorización, ámbar para alerta y rojo para fuera de línea.


### 1.1.35 — 2026-09-09 — Métricas sólidas en Gestión de red
- Objetivo y causa: se solicitó más vida visual porque las métricas de Gestión de red aún se percibían demasiado blancas.
- Archivos modificados: frontend/src/modules/appearance/panel-theme.css (tarjetas de métricas sólidas), frontend/src/modules/system-update/version.js.
- Flujo y compatibilidad: CPU, memoria, uptime, latencia, PPPoE y colas conservan los mismos valores y su fuente RouterOS. No cambia API, OLT, datos, permisos, autenticación ni tema oscuro.
- Pruebas: revisión estática de selectores y PANEL_VERSION 1.1.35. Build y validación visual real pendientes.
- Resultado esperado: métricas azul, violeta, turquesa, ámbar, verde y azul profundo; texto/iconos blancos y gruesos. Tabla operativa permanece clara.

### 1.1.36 — Corrección de prioridad visual en Gestión de Red
- Se corrigió la prioridad de CSS de las métricas CPU, Memoria, Uptime, Latencia, PPPoE activos y Colas.
- Los seis recuadros ahora fuerzan fondos sólidos diferenciados (azul, violeta, turquesa, ámbar, verde y azul pizarra), evitando que la superficie clara compartida los sobrescriba.
- Texto e iconos pasan a blanco y se mantiene una jerarquía tipográfica fuerte para conservar legibilidad.
- Alcance: solo apariencia del tema `zhub-light`; sin cambios en las lecturas ni en la API de MikroTik.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.

### 1.1.37 — Indicadores sólidos en el resumen OLT
- Se transformaron las cuatro tarjetas principales del resumen OLT en indicadores de color sólido: OLTs en línea (verde), ONUs en línea (turquesa), ONUs autorizadas (violeta) y alertas activas (ámbar).
- Se aplicó texto e iconos blancos con mayor peso visual para mantener legibilidad sobre cada fondo.
- Los paneles técnicos, lecturas, pestañas y acciones del módulo se conservan sin cambios funcionales.
- Alcance: apariencia exclusiva del tema `zhub-light`; no modifica consultas, comandos ni datos de la OLT.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.

### 1.1.38 — Tarjeta MikroTik con color y realce al pasar el cursor
- La tarjeta de cada router MikroTik usa ahora un degradado azul sólido con alto contraste.
- Al pasar el cursor se vuelve más brillante, se eleva ligeramente y muestra una sombra azul de realce.
- Se ajustó texto, iconos, separadores y botones internos para mantener legibilidad sobre el nuevo fondo.
- Alcance: solo apariencia del tema `zhub-light`; sin cambios en monitoreo, estados ni acciones del router.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.

### 1.1.39 — Puertos PON OLT adaptados al tema de color
- Se añadieron clases visuales propias al encabezado y a las métricas de Puertos PON.
- El encabezado del diagnóstico óptico utiliza azul técnico; las métricas se diferencian por tipo: temperatura naranja, voltaje violeta, corriente láser azul y potencia óptica verde.
- Texto, iconos, barras y etiqueta de lectura se ajustaron a alto contraste; las tarjetas resaltan suavemente al pasar el cursor.
- Alcance: únicamente presentación; no se modificó el parser de métricas, las consultas OLT ni la selección de PON.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.40 — Corrección de contraste y tamaño de tarjeta MikroTik
- Se añadió una clase específica para distinguir visualmente las tarjetas MikroTik de las OLT.
- Se corrigió la prioridad CSS de la tarjeta seleccionada para que conserve el fondo azul sólido y el texto blanco plenamente visible.
- La tarjeta MikroTik queda compacta, con un ancho máximo de 290 px en escritorio y ancho completo en móvil.
- El hover mantiene un azul más luminoso, borde claro y sombra de realce.
- Alcance: solo presentación; no se modifican datos, estado, botones, selecciones ni monitoreo.
- Validación realizada: revisión estática de clase, selectores, versión y registro de continuidad.

### 1.1.41 — Pestaña ONUs OLT adaptada al tema
- Se añadieron clases visuales al workspace y a la lista de ONUs para aplicar estilos de forma segura.
- Las métricas superiores son ahora sólidas: total azul, en línea verde, fuera de línea rojo y sin estado ámbar.
- Se adaptaron búsqueda, filtros, tabla, cabecera y filas a una superficie clara con contrastes azul técnico y estados legibles.
- El contenido sigue siendo el mismo: no se modificaron endpoints, parser, acciones de reinicio/activación/desactivación/eliminación ni consulta óptica.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.42 — Tarjeta OLT compacta y acción CLI corregida
- Se redujo el ancho máximo de la tarjeta OLT a 380 px en escritorio (aprox. 30 % menos); en móvil se mantiene al 100 %.
- Se corrigió el botón “Probar conexión CLI”: ahora usa fondo azul, borde claro, texto e icono blancos y realce al pasar el cursor.
- Alcance: solo apariencia de la tarjeta OLT; no se modifican la prueba de conexión, permisos, llamadas API ni otros controles.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.

### 1.1.43 — Monitor óptico de ONUs adaptado al tema
- Se añadieron clases visuales al panel de Potencia Óptica ONU y a sus tres métricas.
- El bloque “Monitor óptico” ahora tiene fondo azul técnico, selector claramente visible, botón de consulta turquesa y botón Detener con contraste.
- RX usa azul, TX violeta y ONUs con lectura válida verde, todos con texto blanco de alto contraste.
- Alcance: solo presentación; no cambian el escaneo secuencial, las lecturas ópticas, temporizadores, API ni la tabla de resultados.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.44 — Consola OLT adaptada al tema
- Se añadieron contenedores visuales específicos para la consola CLI.
- El área de comando ahora usa azul técnico, entrada blanca legible y botón Ejecutar turquesa de alto contraste.
- La respuesta CLI se muestra en un panel de terminal oscuro y legible cuando exista salida.
- Alcance: solo presentación; no se modifican los comandos enviados, validaciones, permisos ni API de la OLT.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.45 — Planes y Servicios adaptados al tema
- Se añadieron clases de presentación al módulo y a cada tarjeta de plan.
- Las tarjetas usan azul profundo, etiqueta de tecnología visible, bloque de velocidades blanco con valores azul/verde y acciones con alto contraste.
- Se añadió realce visual al pasar el cursor sobre un plan.
- Alcance: únicamente interfaz; CRUD de planes, precios, perfiles PPP y sincronización MikroTik permanecen sin cambios.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.46 — Control de Abonados y Clientes adaptado al tema
- Se añadieron clases visuales al área de filtros y a la tabla de abonados.
- El filtro usa azul técnico; los accesos Todos, Activos y Suspendidos tienen acentos azul, verde y rojo.
- La tabla pasa a superficie clara con cabecera azul oscuro, filas alternadas, hover azul suave y estados/deudas legibles.
- Alcance: solo presentación; no se modifican búsquedas, filtros, datos, acciones de servicio, WhatsApp, OLT ni eliminación.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.47 — Tarjetas de plan compactas y precio destacado
- Las tarjetas de Planes y Servicios tienen ahora un ancho máximo de 290 px en escritorio, con ancho completo en móvil.
- Se añadió una clase específica al precio mensual y se resaltó en amarillo cálido de alto contraste para una lectura comercial inmediata.
- Alcance: solo presentación; no se modifican precios guardados, planes, perfiles PPP ni sincronización MikroTik.
- Validación realizada: revisión estática de clase, selectores, versión y registro de continuidad.

### 1.1.48 — Estados y datos principales de abonados reforzados
- La información principal de Abonado/Contacto, Plan/Tarifa e IP/Conexión se muestra con mayor peso tipográfico.
- El estado ACTIVO usa fondo verde sólido, texto e icono blancos y sombra de realce; el estado CORTADO recibe el mismo tratamiento en rojo.
- Alcance: solo presentación; no se modifican estados reales, deuda, datos ni acciones del abonado.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.

### 1.1.49 — Ficha de cliente adaptada al tema
- Se añadieron clases específicas al modal, formulario de resumen y panel de estado de cuenta.
- Cabecera y pestañas ahora presentan azul técnico; los títulos, etiquetas e inputs ganan contraste y peso tipográfico.
- El estado de cuenta usa un panel azul profundo, tarjetas blancas legibles y estado de servicio activo en verde sólido.
- Alcance: solo presentación; no se modifican guardado, pestañas, datos, facturación, servicios, comunicaciones ni ubicación.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.

### 1.1.50 — Facturación adaptada al tema
- Se añadieron clases específicas para indicadores, tabla y estados de facturas.
- Total facturado, cobrado y por cobrar usan tarjetas sólidas azul, verde y rojo.
- La tabla tiene superficie clara, cabecera azul oscuro, filas alternadas y tipografía operativa más gruesa.
- El estado PAGADO ahora resalta en verde sólido con texto e icono blancos; Pendiente y Vencido también reciben colores sólidos.
- Alcance: solo presentación; no se modifican facturas, pagos, montos, acciones, reglas ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.51 — Pestaña Servicio del cliente adaptada al tema

- Se adapta la pestaña **Servicio** de la ficha del cliente al tema claro Z-Hub.
- La cabecera de “Servicios de Internet” ahora tiene un degradado azul sólido, título más grueso y botón “Nuevo servicio” turquesa visible.
- La tabla cambia a cabecera azul oscuro, filas claras alternadas y datos con tipografía más gruesa para una lectura rápida.
- El estado **Activo** resalta con verde sólido, texto blanco y sombra; los estados no activos quedan en rojo sólido.
- Alcance: únicamente presentación; no se modifican servicios, planes, IP, Router, tecnología, señal ONU, acciones ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.52 — Configuración de Facturación adaptada al tema

- Se adapta la pestaña **Configuración** de Facturación al tema claro Z-Hub.
- Las secciones “Fechas y corte” y “Avisos y recordatorios” ahora son tarjetas blancas con borde superior azul y verde, respectivamente.
- Los títulos, etiquetas y controles tienen mayor contraste y grosor para facilitar la lectura.
- Las entradas y listas usan fondo claro, borde azul y foco visible; la generación automática utiliza el color verde del tema.
- El botón Guardar cambios se refuerza con degradado turquesa/azul.
- Alcance: solo presentación; no se modifican fechas de pago, reglas de corte, recordatorios, generación automática, facturas ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.53 — Log del cliente adaptado al tema

- Se adapta la pestaña **Log** de la ficha del cliente al tema claro Z-Hub.
- El historial usa fondo claro y el contador de eventos se muestra en azul sólido con texto blanco.
- Cada evento ahora es una tarjeta blanca con borde azul suave, título y detalle más gruesos, además de efecto visual al pasar el cursor.
- El operador responsable queda destacado con una etiqueta azul clara de alto contraste; la fecha conserva buena legibilidad.
- Alcance: solo presentación; no se modifican acciones, detalle, operador, fecha, registros históricos ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.54 — Mensajería adaptada al tema

- Se adapta el módulo **Mensajería y Avisos WhatsApp** al tema claro Z-Hub.
- Plantillas y editor pasan a tarjetas claras con bordes azules, mejor contraste y tipografía más gruesa.
- La plantilla seleccionada se resalta en verde claro; las demás conservan un fondo operativo suave con efecto al pasar el cursor.
- Los campos de destinatario, teléfono y mensaje son claros, legibles y con foco visible.
- Los botones Copiar y Enviar por WhatsApp quedan reforzados con color y contraste.
- Alcance: solo presentación; no se modifican plantillas, clientes, teléfonos, contenido de mensajes, copiado ni envío por WhatsApp.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.55 — Ajustes adaptados y distribuidos en dos columnas

- Se adapta la sección **Ajustes → General** al tema claro Z-Hub.
- Las tarjetas de configuración cambian a superficie blanca, bordes coloridos y textos más gruesos.
- En pantallas amplias, las tarjetas se distribuyen en **dos columnas** para aprovechar el espacio y reducir el ancho de cada recuadro; en pantallas menores vuelven a una columna.
- Los campos, selector de apariencia y botón Guardar cambios reciben contraste, foco visible y colores coherentes con el tema.
- Alcance: solo presentación y distribución; no se modifican datos de empresa, logo, temas, canales de cobro, reglas, notificaciones ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.56 — Ajuste de encaje de tarjetas en Ajustes

- Se corrige la distribución de las tarjetas de **Ajustes → General** en pantallas amplias.
- Las dos columnas ahora fluyen de forma compacta según la altura de cada tarjeta, evitando grandes espacios vacíos entre recuadros.
- El botón Guardar cambios se mantiene al final, ocupando todo el ancho de la sección.
- En pantallas menores se conserva una única columna ordenada.
- Alcance: exclusivamente distribución visual; no se cambian campos, valores, reglas ni API.
- Validación realizada: revisión estática de selectores, versión y registro de continuidad.


### 1.1.59 — Redes IPv4 y Cajas NAP adaptadas completamente

- Se adapta de forma completa la presentación de **Redes IPv4** y **Cajas NAP** al tema claro Z-Hub.
- Redes IPv4: indicadores sólidos azul, verde y violeta; buscador claro, tabla blanca con cabecera azul oscuro, filas alternadas y texto operativo grueso.
- Cajas NAP: filtros claros, panel de fondo suave y tarjetas NAP blancas con borde azul, sombra y realce al pasar el cursor.
- Se conservan colores de puertos libres/ocupados y las acciones de editar/eliminar con buena visibilidad.
- Alcance: solo presentación; no se modifican redes, IPs, MikroTik, zonas, NAPs, puertos, asignaciones ni API.
- Validación realizada: revisión estática de clases, selectores, versión y registro de continuidad.


### 1.1.57–1.1.58 — Reconciliación de continuidad: submenús de Red

- Se incorpora el registro que faltaba para la revisión visual de los submenús **Redes IPv4** y **Cajas NAP** en el modo Claro Suave.
- Se verificó el estado del lateral y de las rutas de ambos submódulos; la corrección preparó la base de estilo clara para que no heredaran superficies oscuras del tema anterior.
- Esta intervención fue visual: no alteró navegación, permisos, datos, API, MikroTik, zonas, cajas ni asignaciones.

### 1.1.60 — Bitácora maestra actualizada y cierre de la etapa visual

- Se leyó y revisó el archivo maestro `docs/CONTINUIDAD_Z-HUB.md`.
- Se registró el trabajo realizado desde la versión 1.1.32 hasta la 1.1.59: Dashboard, Gestión de Red, OLT, ONUs, consola, planes, clientes, ficha del abonado, facturación, mensajería, ajustes, Redes IPv4 y Cajas NAP.
- Se confirma el patrón aplicado: tema `zhub-light` con superficies claras, tarjetas de color sólido cuando corresponde, tipografía de mayor peso, estados con contraste y tablas operativas legibles.
- Se documenta también el ajuste de distribución de Ajustes: columnas compactas en pantallas amplias y una columna en pantallas menores.
- Regla obligatoria vigente: **cada cambio futuro debe actualizar la versión del panel y este único documento maestro de continuidad**, detallando archivos, alcance, validación y lo que no fue modificado.
- Validación realizada: se comprobó el historial de versiones y se completaron las entradas que faltaban de la etapa 1.1.57–1.1.58.


### 1.1.61 — Protocolo obligatorio de trabajo y publicación

Para cualquier cambio futuro en Z-Hub se debe respetar estrictamente este orden:

1. **Cambio:** implementar únicamente lo solicitado.
2. **Pruebas:** comprobar de forma segura el cambio realizado.
3. **Bitácora:** actualizar este único archivo maestro con el detalle del cambio, alcance, archivos, pruebas y exclusiones.
4. **Verificación:** confirmar que código, bitácora y resultado esperado están presentes.
5. **Cambio de versión:** actualizar `PANEL_VERSION` y su descripción.
6. **Actualización:** publicar los archivos al repositorio para que el panel pueda actualizarse.

- No se debe cambiar la versión ni publicar antes de registrar y verificar la bitácora.
- Esta regla aplica incluso a cambios exclusivamente visuales o documentales.


#### Aclaración operativa sobre la bitácora

- Este archivo es **interno de continuidad** para las conversaciones de trabajo.
- Su actualización no forma parte de una actualización funcional o visual del panel y, por sí sola, **no debe aumentar** `PANEL_VERSION`, activar el botón Actualizar ni comunicarse como versión nueva del sistema.
- Cuando exista un cambio real en el panel, la bitácora se registra durante el proceso de trabajo, pero la versión y la publicación corresponden únicamente a los archivos funcionales del panel.


### 1.1.62 — Geometría única para menú y submenús

- El menú lateral y sus submenús ahora usan clases estructurales compartidas en `Sidebar.jsx`: contenedor, menú principal, grupo de submenú y submenú.
- Se fijan alturas comunes: menú principal de 40 px y submenús de 36 px, junto con el mismo ancho, sangría y espaciado para ambos temas.
- El tema oscuro y `zhub-light` solo pueden cambiar colores, bordes, texto y estados visuales; no la distribución del menú.
- Como resultado, una futura modificación de orden, tamaño, iconos o posiciones realizada en `Sidebar.jsx` se verá de forma idéntica en los dos temas.
- Prueba realizada: revisión estática de clases comunes y confirmación de que el componente no contiene selectores de tema.
- Alcance: no se modifican rutas, permisos, opciones de menú, navegación ni datos.


### 1.1.63 — Tarjeta MikroTik con geometría compartida entre temas

- El ancho de la tarjeta MikroTik se trasladó desde el CSS exclusivo de `zhub-light` hacia `RouterCard.jsx`, que usan los dos temas.
- En escritorio conserva 290 px y en móvil ocupa el ancho disponible, tanto en claro como en oscuro.
- El tema claro conserva su gradiente azul y el oscuro conserva su paleta oscura/cian; el cambio solo unifica medidas y no altera datos, acciones ni navegación.
- Prueba realizada: comprobación estática de la clase compartida y ausencia de reglas de ancho específicas del tema claro.


### 1.1.64 — Tarjetas OLT con geometría compartida entre temas

- El ancho de las tarjetas OLT se trasladó desde el CSS exclusivo de `zhub-light` hacia `RouterCard.jsx`, compartido por ambos temas.
- En escritorio las OLT usan 380 px y en móvil ocupan el ancho disponible; el tema oscuro ya no expande estas tarjetas por la cuadrícula.
- Los colores, bordes, estados y acción «Probar conexión CLI» propios de cada tema permanecen sin cambios.
- Prueba realizada: comprobación estática de las clases compartidas OLT/MikroTik y ausencia de reglas de ancho OLT exclusivas del tema claro.


### 1.1.65 — Ventana de actualizaciones adaptada a Claro Suave

- Se añadieron identificadores estructurales al modal de actualizaciones, confirmación, avisos, changelog y botones para que el tema claro pueda darles una presentación propia.
- En Claro Suave el modal ahora usa superficie blanca, borde azul, tipografía azul oscura más gruesa, avisos celeste/verde legibles y botones con contraste visible.
- El tema oscuro conserva sus fondos y colores actuales; no se cambió la geometría ni la lógica de ninguno de los temas.
- Prueba realizada: revisión estática de selectores, avisos, botones y rutas `/system-update/status` y `/system-update/install`.
- Alcance: no se modifican la descarga, comprobación, instalación, sesión, API ni actualización real del panel.


### 1.1.66 — Versión anclada junto a Actualizar en el Dashboard

- El indicador de versión del panel se agrupa de forma explícita con el botón «Actualizar» en el encabezado del Dashboard.
- En escritorio el grupo queda alineado a la derecha; en pantallas pequeñas se mantiene unido y alineado sin trasladar la versión al inicio del contenido.
- La versión continúa obteniéndose de `PANEL_VERSION`; no se modifica la actualización del Dashboard ni datos operativos.
- Prueba realizada: revisión estática del orden versión → botón, anclaje de escritorio, alineamiento móvil y fuente de versión.


### 1.1.67 — Instalación silenciosa y progreso legible en actualizaciones

- Durante una instalación, el panel conserva el sondeo de estado cada 3 segundos para actualizar el progreso, pero lo realiza sin cambiar el botón «Comprobar» a estado de búsqueda.
- El mensaje «Buscando actualización…» solo aparece cuando el operador presiona manualmente «Comprobar».
- Se reforzó en Claro Suave el contraste de textos, contenedor y barra del progreso para evitar controles o letras blancas poco visibles.
- Prueba realizada: revisión estática del sondeo silencioso, activación manual, colores de progreso y rutas de estado/instalación.
- Alcance: no se alteran la frecuencia de sondeo durante instalación, descarga, instalación, sesión ni API.


### 1.1.68 — Versión movida al control global de actualizaciones

- Se corrigió la ubicación: la versión deja de mostrarse en el encabezado del Dashboard.
- Ahora se muestra en la barra superior, inmediatamente antes del botón global de actualizaciones con ícono de descarga, tal como corresponde al control marcado.
- El indicador lee `PANEL_VERSION` y tiene estilo propio para oscuro y Claro Suave.
- Prueba realizada: revisión estática del grupo superior, orden versión → botón, eliminación del duplicado en Dashboard y estilos de ambos temas.
- Alcance: no se modifican las métricas del Dashboard, descarga, instalación, sesión ni API.


### 1.1.69 — Mensaje «Buscando actualización» visible en Claro Suave

- Se corrigió el estado visual del botón «Comprobar»: la regla clara normal anulaba sus colores cuando `aria-busy="true"`.
- Durante una comprobación manual, el botón ahora muestra fondo azul sólido, texto e ícono blancos y el mensaje «Buscando actualización…» con contraste.
- Al terminar vuelve a su apariencia clara normal; no se cambia el sondeo silencioso durante instalación.
- Prueba realizada: revisión estática de estilos normal/ocupado, selector `aria-busy`, color de fondo y texto del ícono.


### 1.1.70 — Inicio de sesión adaptado al tema seleccionado

- La pantalla de inicio de sesión ahora respeta el tema guardado que obtiene desde `/settings/public` antes de autenticar.
- En Claro Suave usa fondo luminoso, tarjeta blanca, títulos y campos de alto contraste, además de accesos rápidos claros con colores funcionales.
- En Oscuro se conserva la presentación actual; la geometría de la pantalla se mantiene compartida.
- Prueba realizada: revisión estática de aplicación del tema guardado, estructura de Login, estilos claros y llamada de autenticación sin cambios.
- Alcance: no se modifican credenciales, roles, API, sesión, redirecciones ni acceso.
