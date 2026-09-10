# Z-Hub — Bitácora de continuidad v1.2

## REGLAS PRIORITARIAS — LEER ANTES DE MODIFICAR

**Antes de modificar Z-Hub, leer esta bitácora y revisar el estado real de `main` en `ronbercito/Z-Hub`.** El repositorio MikroHub es legado y no se usa para desarrollo nuevo.

1. Identificar el propietario real del comportamiento y modificar solo lo necesario.
2. Crear respaldo antes de cambios críticos o delicados.
3. Probar razonablemente y declarar exactamente qué se probó y qué queda pendiente.
4. Todo cambio funcional incrementa `frontend/src/modules/system-update/version.js`; el CHANGELOG contiene solo la versión actual.
5. Actualizar esta bitácora en la misma entrega.
6. Verificar código, versión y bitácora en `main` antes de declarar la actualización publicada.
7. Nunca borrar la base de datos para corregir UI, subir secretos, ocultar errores de backend ni afirmar pruebas no realizadas.
8. Conservar datos reales y compatibilidad operacional. Seguir Vista React → API → FastAPI → modelo/DB/integración → resultado → build/despliegue.
9. La versión nueva siempre se inserta PRIMERA; las versiones inferiores permanecen debajo.
10. Cambio solo documental no incrementa `PANEL_VERSION`.

---

# HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO

## 1.2.26 — 2026-09-09 — Planes filtrados por tecnología en el alta

- **Objetivo:** evitar que durante el registro de un abonado se pueda escoger un plan que pertenezca a otra tecnología.
- **Comportamiento:** cuando la tecnología seleccionada es `Fibra óptica`, el selector `Plan de internet` muestra únicamente planes activos clasificados como fibra; cuando se selecciona `Inalámbrico`, muestra únicamente planes activos de radio/inalámbricos.
- **Clasificación:** se reutiliza el criterio ya usado por el módulo Planes: tipos con `radio`, `inalam/inalám`, `Ubiquiti` o `Mimosa` se consideran inalámbricos; `Hotspot` queda fuera de ambos selectores; los demás tipos corresponden a fibra.
- **Cambio de tecnología:** al cambiar de Fibra a Inalámbrico o viceversa se limpia `plan_id`, obligando a escoger un plan válido para la nueva tecnología.
- **Validación:** antes de guardar, el asistente verifica que el `plan_id` seleccionado exista dentro de los planes activos compatibles con la tecnología actual; si no coincide, bloquea el registro y muestra un aviso.
- **Archivo funcional:** `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` → `1.2.26`.
- **Backend/Base de datos:** sin cambios; no se modifican planes existentes ni su estructura.
- **Compatibilidad:** se conservan MikroTik, PPPoE, redes IPv4, NAP, ONU, facturación, Instalaciones, reactivación y aprovisionamiento actuales.
- **Backup:** `docs/backups/1.2.25/PLAN_TECH_FILTER_BACKUP.md`, con blobs exactos recuperables de los archivos 1.2.25 previos al cambio.
- **Pruebas realizadas:** revisión estática del filtro por `plan.type`, cambio reactivo al modificar `formData.technology`, limpieza de `plan_id`, placeholder contextual y validación previa al submit.
- **Pruebas pendientes:** build React y prueba visual/funcional real en el servidor después de instalar 1.2.26, comprobando al menos Fibra → solo fibra e Inalámbrico → solo radio/inalámbricos.
- **Resultado:** código funcional y versión publicados en `main`; validación operativa real queda pendiente hasta instalar 1.2.26.
- **Commits principales:** backup `9aa0bc6dc9ade5f5d19a347bd9e78bdf76f174e5`; asistente `0010aea308e100979fb6a364af9dc93b993ecc5c`; versión `591330496adedd9d9bab687980d30ee86f3190cb`.

## 1.2.25 — 2026-09-09 — Baja controlada y Clientes retirados

- **Objetivo:** reemplazar la eliminación como procedimiento normal de salida por una baja controlada que conserve la identidad del cliente.
- **UI Clientes:** nuevo botón `Retirar cliente` y pestaña `Retirados`.
- **Confirmación:** muestra nombre, DNI/RUC, teléfono, dirección y recursos que serán liberados.
- **Motivo:** obligatorio, mínimo 10 y máximo 250 caracteres. `retired_at` guarda la fecha/hora automáticamente y `retirement_reason` conserva el motivo.
- **Seguridad MikroTik:** antes de archivar se ejecuta `mt.remove_client`. Si MikroTik no puede liberar la configuración, la operación se cancela y el cliente permanece sin retirar.
- **Liberación:** después de confirmar limpieza se liberan IP, PPPoE, plan, router, red IPv4, NAP/puerto, ONU, potencia, zona y asociaciones inalámbricas. Se eliminan registros operativos asociados (servicios, facturas, tickets, tareas, comunicaciones, documentos y actividad) y se conserva la identidad/contacto/dirección/coordenadas del cliente junto con fecha y motivo de retiro.
- **Estado:** el mismo registro `clients` pasa a `status=retired`; no se crea un duplicado ni se elimina el cliente histórico.
- **Reactivación:** `Retirados` incorpora `Reactivar / volver a registrar`; reutiliza `ClientRegistrationWizard` existente con datos personales precargados y obliga a asignar nuevamente servicio, plan, router, IP/NAP/ONU según corresponda. Tras aprovisionar correctamente se limpia el estado de retiro.
- **DNI/RUC retirado:** al intentar crear una nueva solicitud de Instalaciones con un DNI/RUC retirado, la API devuelve un aviso legible con nombre, fecha y motivo y dirige a `Clientes > Retirados > Volver a registrar`.
- **Base de datos:** se agregan automáticamente `clients.retired_at` y `clients.retirement_reason` mediante la migración ligera existente de `init_db`.
- **Archivos:** `backend/app/models/client.py`, `backend/app/routers/clientes/retired.py` (nuevo), `backend/app/routers/clientes/installations.py`, `backend/server.py`, `frontend/src/modules/clientes/Clients.jsx`, `frontend/src/modules/system-update/version.js`.
- **Compatibilidad:** no se modifica `ClientRegistrationWizard.jsx`; se reutiliza el asistente oficial.
- **Backup:** referencias exactas de blobs 1.2.24 en `docs/backups/1.2.24/RETIREMENT_CHANGE_BACKUP.md`.
- **Pruebas realizadas:** revisión estática de rutas, modelo, migración ligera existente, validación 10–250, abortar ante fallo MikroTik, limpieza de campos técnicos y flujo de reactivación en código.
- **Pruebas pendientes:** build React, compilación Python, arranque/migración MariaDB y prueba real contra MikroTik después de instalar 1.2.25. No se ha ejecutado una baja real sobre un cliente de producción desde este entorno.
- **Riesgo operativo:** Retirar es una acción destructiva sobre la configuración de servicio y registros operativos asociados; usar únicamente cuando la baja sea real. El botón Eliminar continúa separado para registros creados por error.

## 1.2.24 — 2026-09-09 — Pestañas adaptadas al tema Claro Suave
- Instalaciones/Registrados reciben estilos locales para evitar que el tema global oscurezca la pestaña inactiva.
- Activa azul/cian; inactiva azul-gris clara; sin cambios de backend ni flujo.

## 1.2.23 — 2026-09-09 — Pestañas Instalaciones y Registrados
- Dos pestañas con contadores. Instalaciones muestra pendientes; Registrados muestra clientes dados de alta.
- El alta oficial continúa mediante `zhub_installation_draft` y el asistente existente.

## 1.2.22 — 2026-09-09 — Nueva instalación junto a filtros
- `Nueva instalación` se mueve a la fila de búsqueda/fechas y se refuerza la legibilidad de registros.

## 1.2.21 — 2026-09-09 — Progreso continuo del actualizador
- Porcentaje visual avanza 1 a 1 hasta 99%; 100% solo con éxito confirmado y versión objetivo instalada.

## 1.2.20 — 2026-09-09 — Control de Clientes
- Encabezado `Control de Clientes`; se retiran `Nuevo Abonado` y lápiz de la vista principal; tema claro más vivo.

## 1.2.19 — 2026-09-09 — Ubicación mediante minimapa
- Nueva instalación reutiliza `CoordinatesPicker`; clic/arrastre llena coordenadas sin depender de GPS del navegador.

## 1.2.18 — 2026-09-09 — Cierre resistente del instalador
- Comprobación final del backend con reintentos y diagnóstico Supervisor/log.

## 1.2.17 — 2026-09-09 — Instalaciones persistentes
- Tabla/API `installations`, solicitudes pendientes y `Dar de alta cliente`; cancelar alta no pierde la solicitud.

## 1.2.16 — 2026-09-09 — Modal sin cubrir pantalla
- Nueva instalación centrada sin overlay opaco.

## 1.2.15 — 2026-09-09 — Preinscripción desde Instalaciones
- Captura inicial y transferencia al asistente; posteriormente sustituida por persistencia real 1.2.17.

## 1.2.14 — 2026-09-09 — Botón Nueva instalación adaptado al tema
- Botón azul/cian sin cambios de datos.

## 1.2.13 — 2026-09-09 — Recarga segura tras actualizar
- No cierra sesión; recarga solo con éxito y versión coincidente.

## 1.2.12 — 2026-09-09 — Tema claro Instalaciones
- Panel, tabla y controles claros con mayor contraste.

## 1.2.11 — 2026-09-09 — Submódulo Instalaciones
- Se agrega `Clientes → Instalaciones` con listado, búsqueda y filtros.

## 1.2.10 — 2026-09-09 — Identificación centrada en footer
- `Panel Z-Hub · vX` centrado y legible.

## 1.2.09 — 2026-09-09 — Pie y fondo tema claro
- Contenedor y footer con estilo claro.

## 1.2.08 — 2026-09-09 — Planes agrupados
- Fibra, Radioenlace y Hotspot separados; velocidades más visibles.

## 1.2.07 — 2026-09-09 — Tarjetas de planes compactas
- Tarjetas reducidas y colores por tecnología.

## 1.2.06 — 2026-09-09 — Tarjetas por tecnología
- Cuadrícula responsive y color automático.

## 1.2.05 — 2026-09-09 — Zonas a Gestión de Red
- Zonas se mueve preservando permiso `client_zones`.

## 1.2.04 — 2026-09-09 — Buscador PPPoE
- Filtro por usuario, perfil, IP remota o comentario.

## 1.2.03 — 2026-09-09 — Buscador Colas simples
- Filtro por nombre, comentario o IP/target.

## 1.2.02 — 2026-09-09 — Queue type visible
- Nueva columna Queue type con valor RouterOS.

## 1.2.01 — 2026-09-09 — Comentario primero
- Comentario pasa a primera posición en Colas simples.

## 1.2.00 — 2026-09-09 — Límites de velocidad legibles
- Max-limit en Mbps/Gbps; `0/0` se muestra como `Sin límite`.

---

## Plantilla obligatoria próxima versión
Insertar inmediatamente debajo de `HISTORIAL 1.2.xx — MÁS NUEVO PRIMERO`: versión, fecha, objetivo/causa, solución, archivos, compatibilidad, backups, pruebas realizadas, pruebas pendientes, resultado, riesgos y commits.

## Estado documental
- Serie cubierta: **1.2.00 → 1.2.26**.
- Orden: **descendente; versión más reciente primero**.
- Próxima versión funcional: **1.2.27**, encima de 1.2.26.
