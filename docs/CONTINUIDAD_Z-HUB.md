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
