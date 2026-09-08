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
- Versión funcional registrada al crear esta bitácora: **1.0.63**.

La versión 1.0.63 está confirmada en `version.js` y corresponde a las acciones de facturas: editar, ver documento, eliminar, anular y enviar. Las facturas pagadas/con pagos quedan protegidas. El envío actualmente prepara correo/WhatsApp desde el navegador. 

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

Si en el futuro se exige un PDF real descargable/visualizable como archivo PDF, implementar generación binaria en backend (por ejemplo con una librería PDF) y cambiar el endpoint para devolver `application/pdf`.

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
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx` → edición/eliminación de servicios.
- `frontend/src/modules/clientes/editor/CoordinatesPicker.jsx` → selector de coordenadas/mapa.
- `backend/app/routers/clientes/router.py` → API de clientes.
- `backend/app/routers/clientes/services.py` → servicios adicionales.
- `backend/app/routers/clientes/identity_sync.py` → sincronización de identidad con recursos existentes.

### Ubicación/mapa

`CoordinatesPicker.jsx` soporta:

- selección de latitud/longitud;
- marcador;
- mapa Google;
- modo solo lectura;
- vista satélite/control de mapa;
- botón universal “Cómo llegar”.

En el listado de clientes:

- la IP es clicable y abre `http://IP`;
- la dirección dispone de acción “Ubicación” con mini mapa de solo lectura.

---

## 8. Actualizaciones del panel

### Fuente de versión

`frontend/src/modules/system-update/version.js`

Actualmente:

```text
PANEL_VERSION = 1.0.63
```

Este archivo es parte del panel y **sí** debe cambiarse cuando haya una nueva funcionalidad/corrección funcional.

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

Si el código es nuevo y el build es viejo → revisar `setup_debian.sh`, build y copia.

Si código/build son nuevos pero navegador es viejo → revisar caché/Nginx y hacer recarga forzada.

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

### 1.0.38–1.0.39

- Colas y señal ONU.
- Corrección de actualización de colas para evitar duplicados.
- Búsqueda de cola por IP/DNI y uso de `.id` de RouterOS.
- Nombres únicos de servicios adicionales.

### 1.0.40–1.0.43

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

### 1.0.63 — actual

- Acciones por factura: editar, ver documento, eliminar, anular y enviar.
- Protección de facturas pagadas/con pagos.
- Ventana de envío con Correo o WhatsApp.
- Documento actual imprimible/guardable como PDF, todavía no PDF binario real.
- Envío actual mediante `mailto:` / `wa.me`; pendiente integración de proveedor automático si se solicita.

---

## 10. Archivos creados/modificados recientemente para Facturación

### `backend/app/routers/facturacion/invoice_actions.py`

Nueva API para acciones de factura.

Recibe:
- solicitudes autenticadas del frontend;
- ID de factura;
- datos de edición o canal de envío.

Entrega:
- factura actualizada;
- eliminación/anulación controlada;
- documento imprimible;
- metadata de preparación de envío.

### `frontend/src/modules/facturacion/Billing.jsx`

Nueva interfaz de acciones por factura y modal de envío.

Recibe:
- datos de facturas desde la API;
- acciones del administrador.

Entrega:
- acciones visuales y llamadas a los endpoints.

### `frontend/src/modules/system-update/version.js`

Actualizado a 1.0.63.

---

## 11. Problemas conocidos / pendientes

### P1 — PDF real

**Estado:** pendiente.

La ruta `/pdf` genera HTML imprimible. Si se requiere archivo PDF real, implementar generación PDF binaria y probar apertura/descarga.

### P2 — Envío automático real

**Estado:** pendiente.

Correo/WhatsApp actualmente abren los mecanismos del navegador. Para envío automático desde MikroHub habrá que definir e integrar:

- proveedor SMTP/correo;
- o proveedor WhatsApp Business/API;
- credenciales en variables seguras, nunca en Git;
- estados de entrega/error;
- registro de actividad.

### P3 — Email del cliente

**Estado:** revisar.

El modelo/flujo actual no tiene un campo de email de cliente utilizado directamente para el envío de facturas, por eso la UI puede solicitar el correo al administrador.

### P4 — Búsqueda por servicio en Facturación

**Estado:** revisar.

La UI muestra `service_label`, pero comprobar si el buscador backend de facturas también debe buscar por esa etiqueta para localizar rápidamente facturas por servicio.

### P5 — ClientBilling

**Estado:** revisar.

La implementación reciente de acciones completas se hizo en la facturación global (`modules/facturacion/Billing.jsx`). `ClientBilling.jsx` puede necesitar recibir las mismas acciones si se desea exactamente el mismo comportamiento dentro de la ficha del cliente.

### P6 — Documentos físicos

La eliminación de filas de `ClientDocument` no implica necesariamente eliminar archivos físicos almacenados en disco. Si se exige limpieza física completa, revisar esa integración de forma independiente y segura.

---

## 12. Reglas de seguridad y mantenimiento

Nunca:

- borrar la base de datos para arreglar una pantalla;
- eliminar datos reales para solucionar un error de UI;
- subir `backend/.env`;
- subir contraseñas, tokens o claves reales;
- ocultar errores de backend con cambios visuales;
- afirmar que una función está terminada sin probarla;
- activar módulos en revisión sin compilar/probar;
- cambiar Layout para resolver un defecto que pertenece a otro módulo;
- hacer una modificación funcional sin actualizar versión/changelog.

Siempre:

- conservar datos existentes;
- validar frontend + API + backend;
- probar el flujo real después de desplegar;
- registrar la modificación en esta bitácora;
- mantener el changelog visible y entendible para el administrador;
- dejar detalles técnicos internos en esta bitácora, no en el changelog visible del panel.

---

## 13. Módulos en revisión especial

### Email/SMS de cliente

Hubo componentes experimentales que podían dejar React en blanco. Se desactivó su renderizado directo desde ClientDetail para mantener estable el panel.

Archivos relacionados para futuras revisiones:

- `backend/app/models/client_communication.py`
- `backend/app/modules/client_workspace/router.py`
- `frontend/src/modules/clientes/editor/ClientCommunications.jsx`

No reactivar sin:

1. compilar frontend;
2. abrir la ficha;
3. entrar/salir de la pestaña;
4. probar con cliente real de prueba;
5. revisar consola y backend.

### Documentos de cliente

Relacionado con:

- `backend/app/models/client_document.py`
- `frontend/src/modules/clientes/editor/ClientDocuments.jsx`

Misma regla: revisión aislada antes de reintegrar.

---

## 14. Plantilla obligatoria para futuras entradas

Copiar esta estructura al final del documento para cada nueva intervención:

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

## 15. Entrada actual de creación de esta bitácora

### REV-0001 — 2026-09-08 — Panel 1.0.63

**Tipo:** Documentación / continuidad.

**Objetivo:** crear una bitácora maestra persistente para futuras sesiones y evitar pérdida de contexto técnico.

**Archivo creado:**

`docs/CONTINUIDAD_MIKROHUB.md`

**Regla de publicación:** este archivo permanece dentro de `docs/` y no debe formar parte del build React ni ser copiado al directorio público del panel.

**Versión del panel:** no cambia por esta entrada documental. El panel continúa en **1.0.63**.

**Estado:** completado.

**Próxima regla:** toda modificación futura debe añadir una nueva entrada debajo de esta sección y conservar las entradas anteriores.

---

## 16. Registro de próximas modificaciones

> **No borrar las entradas anteriores.** Agregar siempre una nueva entrada al final.

### REV-0002 — pendiente

- Fecha: pendiente
- Panel: pendiente
- Tipo: pendiente
- Resumen: pendiente
- Archivos: pendiente
- Pruebas: pendiente
- Commit: pendiente
