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

## 1.2.28 — 2026-09-09 — Ajustes → Configuración clientes

- **Objetivo:** crear un espacio propio dentro de Ajustes donde se concentren las opciones futuras relacionadas con el panel de Clientes.
- **Navegación:** se agrega `Configuración clientes` como submenú de `Ajustes`, inmediatamente después de `General`.
- **Pantalla dedicada:** se crea `frontend/src/modules/ajustes/clientes/ClientSettings.jsx`, con una vista inicial organizada en Registro y altas, Pausas de servicio, Retiros/reactivaciones y Avisos del cliente.
- **Alcance actual:** esta entrega crea únicamente la estructura y el acceso; no agrega todavía nuevos interruptores ni reglas configurables para evitar inventar comportamientos no solicitados.
- **Ruta:** `settings_clients` se resuelve de forma explícita en `Layout.jsx` hacia `ClientSettings`; las demás secciones de Ajustes continúan usando el flujo existente de `Settings.jsx`.
- **Archivos:** `frontend/src/modules/ajustes/navigation/settingsSections.js`, `frontend/src/modules/ajustes/clientes/ClientSettings.jsx` (nuevo), `frontend/src/components/layout/Layout.jsx`, `frontend/src/modules/system-update/version.js`.
- **Compatibilidad:** no se modifica base de datos, backend, facturación, MikroTik, pausas, retiros, Instalaciones, planes ni datos de clientes.
- **Backups:** `docs/backups/1.2.27/CLIENT_SETTINGS_MENU_BACKUP.md` y `docs/backups/1.2.27/LAYOUT_CLIENT_SETTINGS_BACKUP.md` registran los blobs exactos previos de 1.2.27.
- **Pruebas realizadas:** revisión estática de la generación automática del submenú desde `SETTINGS_SECTIONS`, resolución de `settings_clients` antes del manejador genérico `settings_*`, import correcto de `ClientSettings` y verificación de que no existen llamadas API ni mutaciones de datos en la nueva pantalla.
- **Pruebas pendientes:** build React y validación visual real después de instalar 1.2.28.
- **Resultado esperado:** al desplegar Ajustes debe aparecer `Configuración clientes`; al abrirlo debe mostrarse la nueva pantalla dedicada sin afectar las otras categorías.
- **Commits principales:** backup `fd3be93f0818f821d09f2b4e0a09575122c8b433`; backup Layout `def13ae13db6a14a24bc5b2f51f99ece9baf0853`; navegación `bcfe1e278f686f3723bd1c7e02c937cabc481b07`; pantalla `01f8272e0dd9ec6c92da1e69840f2b91f4e62549`; ruta Layout `d96ad15bca705118de72b3f004f273156eedaf4a`; versión `b3dd3a037307c08696ed450711af58817cae7e0f`.

## 1.2.27 — 2026-09-09 — Servicio en pausa temporal

- **Objetivo:** permitir congelar temporalmente el servicio de un cliente por viaje, construcción u otra ausencia sin retirarlo ni liberar sus recursos técnicos.
- **UI Clientes:** se agrega el botón `Pausar servicio` para clientes activos y una pestaña `En pausa` con contador, fecha de inicio, fecha programada de reactivación, días guardados, motivo y acciones.
- **Duración:** se puede seleccionar 1, 2 o 3 meses. El final se calcula por mes calendario conservando el día cuando exista y usando el último día válido en meses más cortos.
- **Motivo:** obligatorio, entre 10 y 250 caracteres.
- **Días conservados:** al iniciar la pausa Z-Hub calcula los días que faltan hasta la próxima fecha de facturación del cliente y guarda ese saldo de tiempo en `pause_saved_days`.
- **MikroTik:** la pausa usa el mecanismo de corte existente (`mt.cut_client`) sin eliminar PPPoE, Queue, IP, plan, router, NAP, ONU ni demás asociaciones. Si MikroTik no logra suspender el servicio, la pausa no se registra.
- **Facturación congelada:** mientras `status=paused`, la generación mensual automática omite al cliente y el proceso de marcar facturas vencidas no avanza sus vencimientos. Las deudas existentes no se eliminan.
- **Reactivación automática:** `pause_worker` revisa una vez por hora las pausas vencidas. Primero intenta `mt.restore_client`; solo si MikroTik confirma la restauración cambia el cliente a activo. Si falla, la pausa queda pendiente y se reintenta posteriormente.
- **Devolución de días:** al reactivar, Z-Hub suma los días guardados desde la fecha real de reactivación y ajusta el día de facturación resultante.
- **Reactivación anticipada:** la pestaña `En pausa` incorpora `Reactivar ahora`. El usuario puede dejar la fecha de facturación en modo automático o escoger opcionalmente un día de facturación del 1 al 30.
- **Aviso 5 días antes:** cuando faltan 5 días o menos aparece `Pausa por finalizar` y un botón `Avisar WhatsApp`, que prepara un mensaje con nombre, fecha de reactivación y días conservados. No se agregó envío automático por una API externa de WhatsApp.
- **Fechas de facturación:** `_billing_dates` deja de forzar todos los días 29/30 al 28 y ahora respeta días 1–30, ajustándose al último día válido del mes cuando corresponda.
- **Base de datos:** `init_db` agregará mediante su migración ligera las columnas `pause_active`, `pause_started_at`, `pause_until`, `pause_months`, `pause_reason`, `pause_saved_days`, `pause_original_billing_day`, `pause_resumed_at` y `pause_billing_day_after` sin borrar datos existentes.
- **Archivos:** `backend/app/models/client.py`, `backend/app/routers/clientes/pause.py` (nuevo), `backend/app/routers/facturacion/router.py`, `backend/server.py`, `frontend/src/modules/clientes/Clients.jsx`, `frontend/src/modules/system-update/version.js`.
- **Compatibilidad:** no se modifican aprovisionamiento inicial, planes, NAP, ONU, Instalaciones, Retirados ni el asistente oficial de Nuevo abonado.
- **Backup:** `docs/backups/1.2.26/SERVICE_PAUSE_BACKUP.md` contiene los blobs exactos previos de 1.2.26.
- **Pruebas realizadas:** revisión estática de estado `paused`, validaciones 1–3 meses y motivo 10–250, corte/restauración MikroTik, cálculo calendario, congelamiento de facturación, reactivación manual/automática y render de la pestaña/alerta/WhatsApp. **Validación operativa posterior del administrador:** pausa manual y reactivación manual probadas en el panel, con devolución correcta de los días guardados.
- **Pruebas pendientes:** reactivación automática al vencer la pausa y validación del aviso de 5 días antes.
- **Riesgo operativo:** la reactivación automática depende de que el backend permanezca en ejecución y el MikroTik esté accesible; ante fallo no se marca al cliente activo falsamente y se reintenta.
- **Commits principales:** backup `2ec3443f65c2f7fc3cdceda36ab1bd0c2787f9e4`; backend pausa `e12fabfb0526b75e46b3f668a41b58040d675b47`; modelo `8bdae240d9a8c75823b9d6acb2bcb85dfe17c572`; servidor `48f9a0e14b5f14c88922d98bc510b46434bd85e8`; facturación `0a7dcc33bc636fda0266ee3f6d20ff7dcd228e02`; UI `e98cf10a1e1ecda5e8ea1f2b8521f1b866780a5e`; versión `25e69ac8dc0457463ad4dfede33bf310929f04e0`.

## 1.2.26 — 2026-09-09 — Planes filtrados por tecnología en el alta

- **Objetivo:** evitar que durante el registro de un abonado se pueda escoger un plan que pertenezca a otra tecnología.
- **Comportamiento:** cuando la tecnología seleccionada es `Fibra óptica`, el selector `Plan de internet` muestra únicamente planes activos clasificados como fibra; cuando se selecciona `Inalámbrico`, muestra únicamente planes activos de radio/inalámbricos.
- **Clasificación:** tipos con `radio`, `inalam/inalám`, `Ubiquiti` o `Mimosa` se consideran inalámbricos; `Hotspot` queda fuera de ambos selectores; los demás tipos corresponden a fibra.
- **Cambio de tecnología:** al cambiar de Fibra a Inalámbrico o viceversa se limpia `plan_id`, obligando a escoger un plan válido para la nueva tecnología.
- **Validación:** antes de guardar, el asistente verifica que el `plan_id` seleccionado exista dentro de los planes activos compatibles con la tecnología actual.
- **Archivo funcional:** `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx`.
- **Versión/changelog:** `frontend/src/modules/system-update/version.js` → `1.2.26`.
- **Backend/Base de datos:** sin cambios.
- **Compatibilidad:** se conservan MikroTik, PPPoE, redes IPv4, NAP, ONU, facturación, Instalaciones, reactivación y aprovisionamiento actuales.
- **Backup:** `docs/backups/1.2.25/PLAN_TECH_FILTER_BACKUP.md`.
- **Pruebas realizadas:** revisión estática del filtro, cambio de tecnología, limpieza de `plan_id` y validación previa al submit.
- **Pruebas pendientes:** build React y prueba visual/funcional real en servidor.

## 1.2.25 — 2026-09-09 — Baja controlada y Clientes retirados
- `Retirar cliente` conserva identidad, contacto, fecha y motivo; libera recursos técnicos después de limpiar MikroTik.
- Pestaña `Retirados`, detección por DNI/RUC y `Reactivar / volver a registrar`.
- Motivo obligatorio 10–250 caracteres. Backup en `docs/backups/1.2.24/`.

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
- Serie cubierta: **1.2.00 → 1.2.28**.
- Orden: **descendente; versión más reciente primero**.
- Próxima versión funcional: **1.2.29**, encima de 1.2.28.
