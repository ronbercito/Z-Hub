# Z-Hub — Etapa 1/7: Contrato oficial de licencias

Fecha: 2026-09-10
Estado: DEFINIDO PARA IMPLEMENTACIÓN
Versión funcional del panel: se mantiene en 1.2.57 porque esta etapa es documental.

## 1. Objetivo

Definir las reglas comerciales y funcionales que usará Z-Hub para el sistema de licencias local, antes de programar el License Manager, el control de capacidad y el futuro servidor de licencias.

## 2. Principio general

Z-Hub seguirá siendo una instalación local (Self-Hosted) en el servidor del ISP.

Todos los planes, incluido Trial, podrán ver y usar todos los módulos y opciones de Z-Hub. No habrá módulos ocultos ni bloqueados por nivel de licencia.

La licencia comercial controlará únicamente:

- Duración del Trial.
- Capacidad máxima de abonados registrados para licencias pagadas.
- Estado de activación de la licencia.

No se limitarán por licencia funciones como Routers, OLT, Clientes, Instalaciones, Facturación, Almacén, Tickets, Monitoreo, Mapa, Mensajería u otros módulos actuales/futuros de Z-Hub.

## 3. Trial

Reglas acordadas:

- Duración: 30 días.
- Acceso: todas las funciones de Z-Hub.
- Límite por cantidad de abonados: ninguno.
- La única restricción comercial del Trial es el tiempo.
- Al terminar el Trial no se debe borrar, modificar ni perder información del ISP.

Comportamiento post-Trial a implementar en Etapa 5:

- Mantener los datos intactos.
- Permitir acceso de consulta al panel.
- Bloquear operaciones que modifiquen datos hasta activar una licencia pagada.

Esta regla puede revisarse antes de implementar Etapa 5 sin afectar el contrato de capacidad de las licencias pagadas.

## 4. Licencias pagadas

Las licencias pagadas:

- Tienen acceso completo a Z-Hub.
- NO tienen fecha de vencimiento.
- NO deben mostrar fecha de vencimiento en la interfaz.
- Se limitan exclusivamente por cantidad máxima de abonados registrados.
- Alcanzar el límite no debe bloquear el panel ni la administración de los abonados existentes.
- Únicamente se impedirá registrar nuevos abonados cuando el consumo sea igual al límite contratado.

## 5. Capacidades iniciales

Los niveles de capacidad definidos para la primera implementación son:

| Código sugerido | Capacidad máxima |
|---|---:|
| PLAN_100 | 100 abonados |
| PLAN_200 | 200 abonados |
| PLAN_800 | 800 abonados |
| PLAN_1000 | 1,000 abonados |
| UNLIMITED | Ilimitado |

Los nombres comerciales podrán cambiar posteriormente sin modificar la lógica del sistema. La implementación debe depender de `max_clients`, no del nombre visible del plan.

## 6. Regla de consumo de cupo

Consumen capacidad todos los abonados que continúan siendo parte de la cartera del ISP, incluyendo las situaciones comerciales/operativas acordadas:

- ACTIVO → cuenta.
- SUSPENDIDO → cuenta.
- MOROSO → cuenta.
- CORTADO → cuenta.
- PAUSADO → cuenta.

La regla de negocio es: un abonado registrado sigue consumiendo cupo mientras no haya sido dado de baja definitivamente.

### Estado que libera capacidad

Se adopta conceptualmente `BAJA` como estado definitivo que NO consume capacidad y libera un cupo sin eliminar el historial del abonado.

En el código actual, el modelo de Cliente usa estados técnicos `active`, `suspended`, `paused`, `retired` y `pending_install`. Por tanto, en Etapa 2 se deberá mapear cuidadosamente la regla comercial a los estados técnicos actuales sin crear estados duplicados innecesarios.

Regla inicial de mapeo:

- `active` → cuenta.
- `suspended` → cuenta.
- `paused` → cuenta.
- `retired` → no cuenta y representa la baja definitiva existente.
- `pending_install` → debe revisarse durante Etapa 2 para decidir si corresponde a un abonado ya registrado o a una instalación todavía no convertida en abonado.

Los términos MOROSO y CORTADO son estados comerciales/operativos definidos por negocio; actualmente no aparecen como valores propios del campo `client.status`. La implementación no debe inventarlos como estados de base de datos sin revisar primero dónde se representa realmente esa condición.

## 7. Qué ocurre al alcanzar el límite

Ejemplo: licencia de 200 abonados.

Mientras el consumo sea menor a 200:

- Se permite registrar nuevos abonados.

Cuando el consumo llegue a 200/200:

- Z-Hub sigue funcionando.
- Los módulos siguen funcionando.
- Se puede editar, cobrar, suspender, reconectar y administrar abonados existentes.
- No se elimina ni modifica información.
- Se bloquea únicamente el alta de un nuevo abonado.
- El backend debe devolver un error específico, por ejemplo `CLIENT_LIMIT_REACHED`.
- El frontend debe mostrar una ventana informativa con límite contratado, consumo actual y necesidad de ampliar capacidad.

Si posteriormente la licencia cambia a 800, la misma instalación debe permitir nuevos registros sin reinstalar Z-Hub.

## 8. Fuente de autoridad

En las primeras etapas, Z-Hub seguirá trabajando localmente y se construirá un `LicenseManager` interno.

Arquitectura objetivo:

1. Z-Hub local opera Clientes, MikroTik, OLT, Facturación y demás módulos.
2. El License Manager local concentra toda decisión de licencia.
3. En una etapa posterior, el License Manager obtendrá el estado de licencia desde un License Server en un VPS por HTTPS.
4. GitHub seguirá siendo repositorio de código/actualizaciones, no el registro productivo de licencias.

## 9. Separación entre licencia y permisos

La licencia determina capacidad comercial de la instalación.

Los roles/permisos de Administrador, Técnico, Cobranzas, etc. continúan siendo un sistema independiente.

Ejemplo:

- Licencia permite usar todo Z-Hub.
- El rol Técnico puede seguir teniendo restringida una función por permisos internos.

No deben mezclarse ambos controles.

## 10. Seguridad

- El límite debe validarse en backend/API.
- Deshabilitar un botón en React no es suficiente.
- Deben protegerse todos los flujos capaces de crear un abonado.
- Alcanzar el límite nunca debe borrar datos.
- El futuro servidor de licencias no deberá recibir datos de clientes del ISP para contar capacidad; el conteo se realizará localmente y la licencia únicamente indicará el máximo autorizado.

## 11. Resultado de la Etapa 1

Queda definido el contrato base para comenzar la Etapa 2/7 — License Manager local.

La Etapa 2 deberá revisar el estado real del modelo y rutas de Clientes, establecer el mapeo final de estados, centralizar la licencia y preparar las funciones `get_license()`, `get_status()`, `get_client_limit()`, `get_client_usage()`, `can_create_client()`, `is_trial()` y `trial_days_remaining()`.

## 12. Compatibilidad

Esta Etapa 1 es exclusivamente documental:

- No modifica MariaDB.
- No modifica Clientes.
- No modifica MikroTik.
- No modifica OLT.
- No modifica Facturación.
- No cambia el sistema actual de validación de licencia.
- No incrementa `PANEL_VERSION`.
